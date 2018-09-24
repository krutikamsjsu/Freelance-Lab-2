import {combineReducers} from 'redux';
import LoginReducer from './reducer-login';
import UserReducer from './reducer-user';
import ProjectReducer from './reducer-project';

const allReducers = combineReducers({
    LoginReducer, UserReducer, ProjectReducer
});

export default allReducers;