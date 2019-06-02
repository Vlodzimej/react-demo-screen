import { combineReducers } from 'redux';
import reducer from './reducer';

const createRootReducer = () =>
    combineReducers({
        globalState: reducer,
    });

export default createRootReducer;
