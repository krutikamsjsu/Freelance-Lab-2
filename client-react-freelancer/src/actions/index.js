import axios from "axios";

export function calculateValue(values){
    return(dispatch)=>{
        return axios({
            method: 'post',
            url: 'http://localhost:3001/calculate',
            data: values
        }).then((response)=>{
            dispatch(calVal(response.data));
        })
    }
}

export function calVal(values){
    return{
        type:"CALCULATE_RESULT",
        payload:values
    }
}
