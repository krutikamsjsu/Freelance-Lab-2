import axios from "axios/index";


export function postProject(projectData){
    return dispatch => {
        return axios.post('/project/postProject',projectData).then((response)=>{
            dispatch(projectInfo(response.data));
        });
    }
}

export function getProjectDataForHome(){
    return dispatch => {
        return axios.get('/project/userAsFreelancerProjects').then((response)=>{
            console.log("home data"+ JSON.stringify(response.data));
            dispatch(projectsInfo(response.data));
        });
    }
}

export function bidProjectNow(bidData){
    return dispatch => {
        return axios.post('/project/bidProjectNow',bidData).then((response)=>{
            //dispatch(projectsInfo(response.data));
        });
    }
}
export function getBids(project_id){
    return dispatch => {
        return axios.get('/project/getBids',{
            params: {project_id: project_id}
        }).then((response)=>{
            dispatch(bidsList(response.data));
        });
    }
}

export function getProjectDetails(project_id){
    return dispatch => {
        return axios.get('/project/getProjectDetails',{
            params: {project_id: project_id}
        }).then((response)=>{
            dispatch(projectInfo(response.data));
        });
    }
}

export function projectInfo(values){
    return{
        type:"PROJECT_INFO",
        payload:values
    }
}

export function projectsInfo(values){
    return{
        type:"PROJECTS_INFO",
        payload:values
    }
}
export function bidsList(values){
    return{
        type:"BIDS_LIST",
        payload:values
    }
}

export function getListProjectUserHasBidOn(){
    return dispatch => {
        return axios.get('/project/userBidedProjects').then((response)=>{
            dispatch(freelancerProjectList(response.data));
        });
    }
}

export function getListOfProjectPostedByEmployer(){
    return dispatch => {
        return axios.get('/project/userAsEmployer').then((response)=>{
            dispatch(employerProjectList(response.data));
        });
    }
}

export function employerProjectList(values){
    return{
        type:"EMP_PROJECT_LIST",
        payload:values
    }
}

export function freelancerProjectList(values){
    return{
        type:"FREELANCER_PROJECT_LIST",
        payload:values
    }
}

export function hireFreelancer(hireData){
    return dispatch => {
        return axios.post('/project/hireFreelancer',hireData).then((response)=>{
            dispatch(hireInfo(response.data));
        });
    }
}

export function hireInfo(values){
    return{
        type:"HIRE_INFO",
        payload:values
    }
}


export function makePayment(paymentData){
    return dispatch => {
        return axios.post('/project/makePayment',paymentData).then((response)=>{
            dispatch(paymentInfo(response.data));
        });
    }
}

export function paymentInfo(values){
    return{
        type:"PAYMENT_INFO",
        payload:values
    }
}