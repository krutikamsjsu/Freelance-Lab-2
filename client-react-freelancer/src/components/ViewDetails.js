import React from "react";
import {render} from "react-dom";
import * as checkLoggedSession from "../actions/signupAction";
import {userData} from "../reducers/reducer-login";
import {bindActionCreators} from 'redux'
import {connect} from "react-redux";
import * as postData from "../actions/projectActions";
import {Redirect} from 'react-router-dom';
import {Link} from 'react-router-dom';
import PropTypes from 'prop-types';
import feelancer from '../feelancer-LOGO.svg';
import Dropzone from 'react-dropzone';

class ViewDetails extends React.Component{

    constructor(props) {
        super(props);
        this.state = { redirect: false, profileImage:null ,preview: null, docs:null, docsPreview: null};
        this.onImageDrop = this.onImageDrop.bind(this);
    }

    state={
        redirect:false,
        userDetails:{
            name : "",
            email : "",
            about : "",
            phone : "",
            skills : ""
        }
    }

    componentWillReceiveProps(nextProps){
        console.log(nextProps);
        if(nextProps.userData){
            if(nextProps.userData.data.sessionActive == true){
                this.setState ({
                    redirect : false,
                    name : nextProps.userData.data.name,
                    email : nextProps.userData.data.email,
                    about : nextProps.userData.data.about,
                    phone : nextProps.userData.data.phone,
                    skills : nextProps.userData.data.skills
                })
            }else {
                this.setState({
                    redirect: true
                })
            }
        }
    }


    componentWillMount(){
        this.props.checkSession();
        this.props.getOtherUserData(this.props.match.params.user_id);
    }

    logout(){
        this.props.logout();
    }

    nextPath(path) {
        this.props.history.push(path);
    }

    onImageDrop(file) {
        this.setState({
            profileImage: file[0],
            preview: file[0].preview
        })
        console.log("Image file path : ",this.state.profileImage);
    }

    render(){
        const {redirect}  = this.state;
        const { userData } = this.props;
        console.log("name:  " +JSON.stringify(this.state.bidsList));
        if(this.state.redirect || userData.data.logout === true)
            return (<Redirect to={{
                pathname: '/login'
            }} />)

        return(
            <div>
                <div className="App-header">
                    <img src={feelancer} className="App-logo" alt="logo" />
                    <button className="btn btn-primary logout-btn" onClick={this.logout.bind(this)}>Logout</button>
                </div>
                <nav class="bar nav-black">
                    <Link to="/home" class="item-button bar-item ml75">Home</Link>
                    <Link to="/dashboard" class="item-button bar-item">Dashboard</Link>
                    <Link to="/profile" class="item-button bar-item">User Profile</Link>
                    <Link to="/transaction" className="item-button bar-item">My Transaction</Link>
                    <button className="btn-warning btn post-project-btn" onClick={() => this.nextPath('/post-project')}>Post Project</button>
                </nav>
                <div className="display-flex justify-content-md-center mt40">
                    <div className="col-md-8  justify-content-md-center border-blue form-border mt30">
                        <h3 className="mb30 mt50">User Details</h3>
                        <hr/>
                        <div className="row">
                            <div className="col-md-5">
                        <div className="row ml60 mt50">
                            <label className="mr120"> Profile Image </label>
                            <br/>
                            { this.state.preview &&
                            <img src={ this.state.preview } alt="image preview" />
                            }
                        </div>
                        <div className="row ml60 mt10">
                            <Dropzone style="height: 50px"
                                      multiple={false}
                                      accept="image/*"
                                      onDrop={this.onImageDrop}>
                                <p><u>Click here</u> to upload a profile image</p>
                            </Dropzone>
                        </div>
                        </div>
                        <div className="col-md-7 text-left">
                        <div className=" mt50">
                            <label className="font-bold">Name : </label>
                            <label className="ml10">{this.state.name}</label>
                        </div>
                        <div className=" mt20">
                            <label className="font-bold">Email : </label>
                            <label className="ml10">{this.state.email}</label>
                        </div>
                        <div className=" mt20">
                            <label className="font-bold">Skills : </label>
                            <label className="ml10">{this.state.skills}</label>
                        </div>
                        <div className=" mt20">
                            <label className="font-bold">About : </label>
                            <label className="ml10">{this.state.about}</label>
                        </div>
                        <div className=" mt20 mb30">
                            <label className="font-bold">Phone : </label>
                            <label className="ml10">{this.state.phone}</label>
                        </div>
                        </div>
                    </div>
                    </div>
                </div>
            </div>
        );
    }
}


function mapStateToProps(state){
    return{
        projectData : state.ProjectReducer,
        userData : state.LoginReducer
    };
}

function mapDispatchToProps(dispatch){
    return bindActionCreators(Object.assign({}, postData,checkLoggedSession),dispatch)

}
export default connect(mapStateToProps,mapDispatchToProps)(ViewDetails);

ViewDetails.propTypes = {
    user_id: PropTypes.string
};
