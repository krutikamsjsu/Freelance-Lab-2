import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import {createStore,applyMiddleware} from 'redux';
import {Provider} from 'react-redux';
import thunk from "redux-thunk";
import allReducers from './reducers';

const middlewares = applyMiddleware(thunk);
const store = createStore(allReducers,middlewares);

ReactDOM.render(<Provider store={store}><App/></Provider>, document.getElementById('root'));
registerServiceWorker();

