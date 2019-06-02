import * as actions from '../../store/actions';
import * as config from '../../config';
import { put, call, takeEvery, all } from 'redux-saga/effects';
import axios from 'axios';

var vaPort = '';

function* watchFetchWeather() {
    yield takeEvery('FETCH_WEATHER', FetchWeather);
}
function* FetchWeather(metod, params = []) {
    try {
        const data = yield call(() => {
            return axios
                .get(config.WEATHER_URL, {
                    params: config.WEATHER_QUERY_PARAMS,
                })
                .then(response => response.data);
        });
        yield put(actions.fetchWeatherSuccess(data));
    } catch (e) {
        console.error(e);
    }
}

function* watchGetLastEvent() {
    yield takeEvery('GET_LAST_EVENT', GetLastEvent);
}

function* GetLastEvent() {
    try {
        const data = yield call(() => {
            return axios
                .post(
                    config.ID_SERVER_URL + config.EVENT_SERVICE_ENDPOINT_URL,
                    {
                        jsonrpc: '2.0',
                        id: '1',
                        params: [],
                        method: 'getLastEvent',
                    }
                )
                .then(response => response.data.result);
        });
        console.log('GET_LAST_EVENT_SUCCESS', data);

        yield put(actions.getLastEventSuccess(data));
        yield put(actions.getNextEvent(data.id));
    } catch (e) {
        console.error('GET_LAST_EVENT_ERROR', e);

        yield put(actions.getLastEvent).run(5000);
    }
}

function* watchGetNextEvent() {
    yield takeEvery('GET_NEXT_EVENT', GetNextEvent);
}

function* GetNextEvent(action) {
    const eventId = action.payload;
    try {
        const data = yield call(() => {
            return axios
                .post(
                    config.ID_SERVER_URL + config.EVENT_SERVICE_ENDPOINT_URL,
                    {
                        jsonrpc: '2.0',
                        id: '1',
                        params: { lastEventId: eventId },
                        method: 'getNextEvents',
                    }
                )
                .then(response => response.data.result);
        });
        console.log('GET_NEXT_EVENT_SUCCESS', data);

        yield put(actions.getNextEventSuccess(data));
        const newEventId = data.length == 0 ? eventId : data[0].id;
        yield put(actions.getNextEvent(newEventId));
    } catch (e) {
        console.error('GET_LAST_EVENT_ERROR', e);

        yield put(actions.getLastEvent).run(5000);
    }
}

function* watchInitialPlayer() {
    yield takeEvery('INITIAL_PLAYER', InitialPlayer);
}

function* InitialPlayer() {
    try {
        yield put(actions.getCameraRtspPort());
        yield put(actions.getVaRtspPort());
        yield put(actions.getStreamUrl());
    } catch (e) {}
}

function* watchGetCameraRtspPort() {
    yield takeEvery('GET_CAMERA_RTSP_PORT', getCameraRtspPort);
}

function* getCameraRtspPort(action) {
    try {
        const response = yield call(() => {
            return axios.post(config.RTSP_SYSTEM_ENDPOINT, {
                jsonrpc: '2.0',
                id: '1',
                params: [],
                method: 'getRtspPort',
            });
        });
        if (response.data.error) {
            console.error('getCameraRtspPort', response.error);
        } else {
            yield put(actions.getCameraRtspPortSuccess(response.data.result));
            yield put(
                actions.checkStream({
                    endpoint: config.RTSP_SERVICE_ENDPOINT,
                    source: config.SOURCE_URI,
                    modules: [],
                })
            );
        }
    } catch (e) {}
}

function* watchGetVaRtspPort() {
    yield takeEvery('GET_VA_RTSP_PORT', getVaRtspPort);
}

function* getVaRtspPort(action) {
    try {
        const response = yield call(() => {
            return axios.post(config.VA_SYSTEM_ENDPOINT, {
                jsonrpc: '2.0',
                id: '1',
                params: [],
                method: 'getRtspPort',
            });
        });
        if (response.data.error) {
            console.error('getVaRtspPort', response.error);
        } else {
            vaPort = response.data.result;
            yield put(actions.getVaRtspPortSuccess(response.data.result));
            const port = response.data.result;
            yield put(
                actions.checkStream({
                    endpoint: config.VA_SERVICE_ENDPOINT,
                    source: `rtsp://${config.VA_SERVICE_ENDPOINT}:4000/${
                        config.STREAM_ID
                    }`,
                    modules: [
                        {
                            name: 'facedetector',
                        },
                        {
                            name: 'motiondetector',
                        },
                    ],
                })
            );
        }
    } catch (e) {}
}

function* watchCheckStream() {
    yield takeEvery('CHECK_STREAM', checkStream);
}

function* checkStream(action) {
    console.log('checkStream', action);
    const params = { ...action.payload };
    try {
        const response = yield call(() => {
            return axios.post(params.endpoint, {
                jsonrpc: '2.0',
                id: '1',
                params: [config.STREAM_ID],
                method: 'getStream',
            });
        });
        console.log('checkStream', response);
        if (response.data.error) {
            yield put(actions.createStream(params));
            yield put(actions.startStream(params));
        } else {
            yield put(actions.checkStreamSuccess(response.data.result));
            yield put(actions.startStream(params));
        }
    } catch (e) {}
}

function* watchStartStream() {
    yield takeEvery('START_STREAM', startStream);
}

function* startStream(action) {
    console.log('startStream', action.payload);
    const params = { ...action.payload };
    try {
        const response = yield call(() => {
            return axios.post(params.endpoint, {
                jsonrpc: '2.0',
                id: '1',
                params: [config.STREAM_ID],
                method: 'startStream',
            });
        });
    } catch (e) {}
}

function* watchCreateStream() {
    yield takeEvery('CREATE_STREAM', createStream);
}

function* createStream(action) {
    console.log('createStream', action.payload);
    const params = { ...action.payload };

    var stream = {
        id: config.STREAM_ID,
        source_uri: params.source,
        mount_point_uri: config.STREAM_ID,
        modules: params.modules,
    };

    try {
        const response = yield call(() => {
            return axios.post(params.endpoint, {
                jsonrpc: '2.0',
                id: '1',
                params: [stream],
                method: 'createStream',
            });
        });
    } catch (e) {}
}

function* watchGetStreamUrl() {
    yield takeEvery('GET_STREAM_URL', getStreamUrl);
}

function* getStreamUrl() {
    console.log('getStreamUrl', config.WEBSOCKET_VA_SERVICE_ENDPOINT)
    try {
        const response = yield call(() => {
            return axios.post(config.WEBSOCKET_VA_SERVICE_ENDPOINT, {
                jsonrpc: '2.0',
                id: '1',
                params: { stream_id: config.STREAM_ID },
                method: 'getStreamURI',
            });
        });
        if (response.data.error) {
            yield put(actions.createStream({
                endpoint: config.WEBSOCKET_VA_SERVICE_ENDPOINT,
                modules: [],
                source: `rtsp://${config.VA_SERVER}:${vaPort}/${config.STREAM_ID}`
            }))

        } else {
            yield put(actions.getStreamUrlSuccess(response.data.result));
        }
    } catch (e) {}
}

export default function* rootSaga() {
    yield all([
        watchFetchWeather(),
        watchGetLastEvent(),
        watchGetNextEvent(),
        watchInitialPlayer(),
        watchGetCameraRtspPort(),
        watchGetVaRtspPort(),
        watchCheckStream(),
        watchStartStream(),
        watchCreateStream(),
        watchGetStreamUrl()
    ]);
}
