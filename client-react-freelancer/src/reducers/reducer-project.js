
import {combineReducers} from 'redux'

export const data = (state =  {
    listOfProjects:[],
    listOfEmpProjects:[],
    projectData:{},
    bidsList:[],
    message : ""
}, action) =>{

    switch (action.type) {
        case "PROJECT_INFO":
            console.log("In User info"+JSON.stringify(action.payload));
            state= {
                ...state,
                projectData:action.payload
            };
            console.log("In User info"+JSON.stringify(state.projectData));
            break;

        case "PROJECTS_INFO":
            state= {
                ...state,
                listOfProjects:action.payload.projectsList
            };
            break;
        case "EMP_PROJECT_LIST":
            console.log("In emp project list info",action.payload.bList);
            state= {
                ...state,
                listOfEmpProjects:action.payload.bList
            };
            console.log("list of projs emp",state.listOfEmpProjects);
            break;
        case "FREELANCER_PROJECT_LIST":
            console.log("In flcr project list info",action.payload.bList);
            state= {
                ...state,
                listOfProjects:action.payload.bList
            };
            break;

        case "BIDS_LIST":
            console.log("In User info"+action.payload);
            state= {
                ...state,
                bidsList:action.payload.bidsList
            };
            break;

        case "HIRE_INFO":
            console.log("In HIRE info"+action.payload.message);
            state= {
                ...state,
                message:action.payload.message
            };
            break;

        default:
            return state;
    }
    return state;
}
export default combineReducers({
    data
});