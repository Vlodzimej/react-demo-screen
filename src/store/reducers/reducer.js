import * as types from '../../constants/ActionTypes';
import * as config from '../../config';

export const initialState = {
    settings: {
        streamUrl: config.STREAM_URL,
    },
};

export default (state = initialState, action) => {
    switch (action.type) {
        case types.FETCH_WEATHER_SUCCESS:
            return { ...state, weatherData: action.payload };

        case types.GET_LAST_EVENT_SUCCESS:
            return { ...state, events: [action.payload] };

        case types.GET_NEXT_EVENT_SUCCESS:
            return action.payload.length > 0
                ? { ...state, events: [...state.events, ...action.payload] }
                : { ...state };

        case types.REMOVE_EVENT:
            return {
                ...state,
                events: state.events.filter(x => x.id != action.payload),
            };

        case types.GET_CAMERA_RTSP_PORT_SUCCESS:
            return {
                ...state,
                settings: { ...state.settings, rtspPort: action.payload },
            };

        case types.GET_VA_RTSP_PORT_SUCCESS:
            return {
                ...state,
                settings: { ...state.settings, vaPort: action.payload },
            };

        case types.GET_STREAM_URL_SUCCESS:
            return {
                ...state,
                settings: { ...state.settings, streamUrl: action.payload },
            };

        default:
            return state;
    }
};
