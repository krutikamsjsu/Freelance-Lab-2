
import {combineReducers} from 'redux'

export const data = (state =  {
    email: "",
    name: "",
    phone:"",
    about:"",
    skills:"",
    profileImage:null
}, action) =>{

    switch (action.type) {
        case "USER_INFO":
            console.log("In User info"+action.payload.email);
            state= {
                ...state,
                email:action.payload.email,
                name:action.payload.name,
                phone:action.payload.phone,
                about:action.payload.about,
                skills:action.payload.skills,
                profileImage:action.payload.profileImage
            };
            break;


        case "LOGOUT":
            console.log("in logout"+action.payload.logout);
            state= {
                ...state,
                logout:action.payload.logout
            };
            break;

        case "SESSION_INFO":
            console.log("in logout"+action.payload.logout);
            state= {
                ...state,
                sessionActive:action.payload.sessionActive
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