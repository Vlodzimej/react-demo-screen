import reducer, { initialState } from './reducer';
import * as types from '../../constants/ActionTypes';

describe('TEST Reducer', () => {
    it('FETCH_WEATHER_SUCCESS', () => {
        const action = {
            type: types.FETCH_WEATHER_SUCCESS,
            payload: { test: 'test' },
        };

        expect(reducer(initialState, action)).toEqual({
            ...initialState,
            weatherData: { test: 'test' },
        });
    });

    it('GET_LAST_EVENT_SUCCESS', () => {
        const action = {
            type: types.GET_LAST_EVENT_SUCCESS,
            payload: { testEvent: 'test' },
        };

        expect(reducer(initialState, action)).toEqual({
            ...initialState,
            events: [{ testEvent: 'test' }],
        });
    });

    it('REMOVE_EVENT', () => {
        const state = {
            ...initialState,
            events: [{ id: 1 }, { id: 2 }, { id: 3 }],
        };
        const action = {
            type: types.REMOVE_EVENT,
            payload: 2,
        };

        expect(reducer(state, action)).toEqual({
            ...initialState,
            events: [{ id: 1 }, { id: 3 }],
        });
    });

    it('GET_CAMERA_RTSP_PORT_SUCCESS', () => {
        const state = { ...initialState, settings: {} };
        const action = {
            type: types.GET_CAMERA_RTSP_PORT_SUCCESS,
            payload: 4000,
        };

        expect(reducer(state, action)).toEqual({
            ...initialState,
            settings: { rtspPort: 4000 },
        });
    });

    it('GET_VA_RTSP_PORT_SUCCESS', () => {
        const state = { ...initialState, settings: {} };
        const action = {
            type: types.GET_VA_RTSP_PORT_SUCCESS,
            payload: 4001,
        };

        expect(reducer(state, action)).toEqual({
            ...initialState,
            settings: { vaPort: 4001 },
        });
    });

    it('GET_STREAM_URL_SUCCESS', () => {
        const state = { ...initialState, settings: {} };
        const action = {
            type: types.GET_STREAM_URL_SUCCESS,
            payload: 1,
        };

        expect(reducer(state, action)).toEqual({
            ...initialState,
            settings: { streamUrl: 1 },
        });
    });
});
