import axios from "axios/index";

export function userLogin(loginData){
    return dispatch => {
        return axios.post('/users/login',loginData).then((response)=>{
            dispatch(userInfo(response.data));
        });
    }
}

export function checkSession(){
    return dispatch => {
        return axios.get('/users/checkSession').then((response)=>{
            console.log("sessionInfo"+JSON.stringify(response));
            dispatch(sessionInfo(response.data));
        });
    }
}

export function sessionInfo(values){
    return{
        type:"SESSION_INFO",
        payload:values
    }
}


export function updateUser(userData){
    return dispatch => {
        return axios.post('/users/updateUserData',userData).then((response)=>{
            dispatch(userInfo(response.data));
        });
    }
}


export function logout(){
    return dispatch => {
        return axios.get('/users/logout').then((response)=>{
            console.log("logoutbackend"+JSON.stringify(response));
            dispatch(logoutFunc(response.data));
        });
    }
}

export function getUserData(){
    return dispatch => {
        return axios.get('/users/getUserData').then((response)=>{
            dispatch(userInfo(response.data));
        });
    }
}

export function getOtherUserData(user_id){
    return dispatch => {
        return axios.get('/users/getUserData',{
            params: {user_id: user_id}
        }).then((response)=>{
            dispatch(userInfo(response.data));
        });
    }
}

export function userInfo(values){
    return{
        type:"USER_INFO",
        payload:values
    }
}

export function logoutFunc(res){
    return{
        type:"LOGOUT",
        payload:res
    }
}

export function userSignUp(signupData){
    return dispatch => {
        return axios.post('/users/signup',signupData);
    }
}