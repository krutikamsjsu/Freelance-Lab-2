import React from "react";
import {render} from "react-dom";
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux';
import {Redirect} from 'react-router-dom';
import * as getData from '../actions/signupAction';
import feelancer from '../feelancer-LOGO.svg';
import {userData} from "../reducers/reducer-user";
import { Control, Form } from 'react-redux-form';

class UserProfileTest extends React.Component{

    state={
        redirect:false
    }
    componentWillMount(){
        this.props.getUserData().then(
            (data) => {

            },
            (err) => {
                this.setState({redirect:true})
            });
    }

    updateUserDetails(){
        this.props.updateUser(userData);
    }

    logout(){
        this.props.logout();
    }

    isDataNotValid(){
        return true;
    }

    handleSubmit(val){
        console.log(JSON.stringify(val));
    }

    render(){
        const {redirect}  = this.state;
        const { userData } = this.props;
        console.log("logout" +JSON.stringify(userData.data.logout));
        if(this.state.redirect || userData.data.logout === true)
            return (<Redirect to={{
                pathname: '/login'
            }} />)

        return(
            <Form model="user" onSubmit={(val) => this.handleSubmit(val)}>
                <label>Your name?</label>
                <Control.text model=".name" />
                <button>Submit!</button>
                <div className="display-flex justify-content-md-center mt40 col-md-2">
                    <div className="col-md-11 form-border mt30 border-blue pb20">
                        <nav className="row bar nav-black border-blue nav-font">
                            <div className="mt10">Display Options</div>
                        </nav>
                    </div>
                </div>
            </Form>


        );
    }
}

function mapStateToProps(state){
    return{
        userData : state.LoginReducer
    };
}

function mapDispatchToProps(dispatch){
    return bindActionCreators(getData,dispatch)

}
export default connect(mapStateToProps,mapDispatchToProps)(UserProfileTest);