
import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import createSagaMiddleware from 'redux-saga';
import createRootReducer from './reducers';

import rootSaga from './sagas';

const sagaMiddleware = createSagaMiddleware();

export const store = createStore(
    createRootReducer(),
    composeWithDevTools(
        applyMiddleware(sagaMiddleware)
    )
);

sagaMiddleware.run(rootSaga);