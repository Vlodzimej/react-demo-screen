import * as types from '../../constants/ActionTypes';

export const fetchWeather = () => {
    return {
        type: types.FETCH_WEATHER,
    };
};

export const fetchWeatherSuccess = data => {
    return {
        type: types.FETCH_WEATHER_SUCCESS,
        payload: data,
    };
};

export const getLastEvent = () => {
    return {
        type: types.GET_LAST_EVENT,
    };
};

export const getLastEventSuccess = data => {
    return {
        type: types.GET_LAST_EVENT_SUCCESS,
        payload: data,
    };
};

export const getNextEvent = eventId => {
    return {
        type: types.GET_NEXT_EVENT,
        payload: eventId,
    };
};

export const getNextEventSuccess = data => {
    return {
        type: types.GET_NEXT_EVENT_SUCCESS,
        payload: data,
    };
};

export const removeEvent = eventId => {
    return {
        type: types.REMOVE_EVENT,
        payload: eventId,
    };
};

export const initialPlayer = () => {
    return {
        type: types.INITIAL_PLAYER,
    };
};

export const getCameraRtspPort = () => {
    return {
        type: types.GET_CAMERA_RTSP_PORT,
    };
};

export const getCameraRtspPortSuccess = data => {
    return {
        type: types.GET_CAMERA_RTSP_PORT_SUCCESS,
        payload: data,
    };
};

export const getVaRtspPort = () => {
    return {
        type: types.GET_VA_RTSP_PORT,
    };
};

export const getVaRtspPortSuccess = data => {
    return {
        type: types.GET_VA_RTSP_PORT_SUCCESS,
        payload: data,
    };
};

export const checkStream = data => {
    return {
        type: types.CHECK_STREAM,
        payload: data,
    };
};

export const checkStreamSuccess = data => {
    return {
        type: types.CHECK_STREAM_SUCCESS,
        payload: data,
    };
};

export const startStream = data => {
    return {
        type: types.START_STREAM,
        payload: data,
    };
};

export const createStream = data => {
    return {
        type: types.CREATE_STREAM,
        payload: data,
    };
};

export const getStreamUrl = () => {
    return {
        type: types.GET_STREAM_URL,
    };
};

export const getStreamUrlSuccess = data => {
    return {
        type: types.GET_STREAM_URL_SUCCESS,
        payload: data,
    };
};
