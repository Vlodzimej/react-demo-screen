import * as types from '../../constants/ActionTypes';
import * as actions from '../actions';

describe('TEST Action Creators', () => {
    it('fetchWeather()', () => {
        const expectedAction = {
            type: types.FETCH_WEATHER,
        };
        expect(actions.fetchWeather()).toEqual(expectedAction);
    });

    it('fetchWeatherSuccess()', () => {
        const expectedAction = {
            type: types.FETCH_WEATHER_SUCCESS,
            payload: 1,
        };
        expect(actions.fetchWeatherSuccess(1)).toEqual(expectedAction);
    });

    it('getLastEvent()', () => {
        const expectedAction = {
            type: types.GET_LAST_EVENT,
        };
        expect(actions.getLastEvent()).toEqual(expectedAction);
    });

    it('getLastEventSuccess()', () => {
        const expectedAction = {
            type: types.GET_LAST_EVENT_SUCCESS,
            payload: 1,
        };
        expect(actions.getLastEventSuccess(1)).toEqual(expectedAction);
    });

    it('getNextEvent()', () => {
        const expectedAction = {
            type: types.GET_NEXT_EVENT,
            payload: 1,
        };
        expect(actions.getNextEvent(1)).toEqual(expectedAction);
    });

    it('getNextEventSuccess()', () => {
        const expectedAction = {
            type: types.GET_NEXT_EVENT_SUCCESS,
            payload: 1,
        };
        expect(actions.getNextEventSuccess(1)).toEqual(expectedAction);
    });

    it('removeEvent()', () => {
        const expectedAction = {
            type: types.REMOVE_EVENT,
            payload: 1,
        };
        expect(actions.removeEvent(1)).toEqual(expectedAction);
    });

    it('initialPlayer()', () => {
        const expectedAction = {
            type: types.INITIAL_PLAYER,
        };
        expect(actions.initialPlayer()).toEqual(expectedAction);
    });

    it('getCameraRtspPort()', () => {
        const expectedAction = {
            type: types.GET_CAMERA_RTSP_PORT,
        };
        expect(actions.getCameraRtspPort()).toEqual(expectedAction);
    });

    it('getCameraRtspPortSuccess()', () => {
        const expectedAction = {
            type: types.GET_CAMERA_RTSP_PORT_SUCCESS,
            payload: 1,
        };
        expect(actions.getCameraRtspPortSuccess(1)).toEqual(expectedAction);
    });

    it('getVaRtspPort()', () => {
        const expectedAction = {
            type: types.GET_VA_RTSP_PORT,
        };
        expect(actions.getVaRtspPort()).toEqual(expectedAction);
    });

    it('getVaRtspPortSuccess()', () => {
        const expectedAction = {
            type: types.GET_VA_RTSP_PORT_SUCCESS,
            payload: 1,
        };
        expect(actions.getVaRtspPortSuccess(1)).toEqual(expectedAction);
    });

    it('checkStream()', () => {
        const expectedAction = {
            type: types.CHECK_STREAM,
            payload: 1,
        };
        expect(actions.checkStream(1)).toEqual(expectedAction);
    });

    it('checkStreamSuccess()', () => {
        const expectedAction = {
            type: types.CHECK_STREAM_SUCCESS,
            payload: 1,
        };
        expect(actions.checkStreamSuccess(1)).toEqual(expectedAction);
    });

    it('startStream()', () => {
        const expectedAction = {
            type: types.START_STREAM,
            payload: 1,
        };
        expect(actions.startStream(1)).toEqual(expectedAction);
    });

    it('createStream()', () => {
        const expectedAction = {
            type: types.CREATE_STREAM,
            payload: 1,
        };
        expect(actions.createStream(1)).toEqual(expectedAction);
    });

    it('getStreamUrl()', () => {
        const expectedAction = {
            type: types.GET_STREAM_URL,
        };
        expect(actions.getStreamUrl()).toEqual(expectedAction);
    });

    it('getStreamUrlSuccess()', () => {
        const expectedAction = {
            type: types.GET_STREAM_URL_SUCCESS,
            payload: 1,
        };
        expect(actions.getStreamUrlSuccess(1)).toEqual(expectedAction);
    });
});
