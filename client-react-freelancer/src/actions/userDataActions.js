import axios from "axios/index";


export function getUserData(){
    return dispatch => {
        return axios.get('/users/getUserData').then((response)=>{
            dispatch(userInfo(response.data));
        });
    }
}

export function getTotalBalance(){
    return dispatch => {
        return axios.get('/users/balance').then((response)=>{
            dispatch(userBalance(response.data));
        });
    }
}
export function getTransactionList(){
    return dispatch => {
        return axios.get('/users/transactionList').then((response)=>{
            dispatch(transactionList(response.data));
        });
    }
}

export function addMoney(aMoneyData){
    return dispatch => {
        return axios.post('/users/addMoney',aMoneyData).then((response)=>{
            dispatch(addMoneyInfo(response.data));
        });
    }
}

export function withdrawMoney(wMoneyData){
    return dispatch => {
        return axios.post('/users/withdrawMoney',wMoneyData).then((response)=>{
            dispatch(withdrawMoneyInfo(response.data));
        });
    }
}

export function userInfo(values){
    return{
        type:"USER_INFO",
        payload:values
    }
}

export function userBalance(values){
    return{
        type:"BALANCE",
        payload:values
    }
}

export function transactionList(values){
    return{
        type:"LIST_OF_TRANS",
        payload:values
    }
}
export function addMoneyInfo(values){
    return{
        type:"ADD_MONEY",
        payload:values
    }
}
export function withdrawMoneyInfo(values) {
    return {
        type: "WITHDRAW_MONEY",
        payload: values
    }
}