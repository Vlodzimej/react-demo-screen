import React, { Component } from 'react';
import 'antd/dist/antd.css';
import { Provider } from 'react-redux';
import Main from './views/containers/main';
import { store } from './store';

class App extends Component {
    render() {
        return (
            <Provider store={store}>
                <Main />
            </Provider>
        );
    }
}

export default App;
