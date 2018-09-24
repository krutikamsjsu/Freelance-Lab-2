import React from "react";
import {render} from "react-dom";
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux';
import {Redirect, Link, withRouter} from 'react-router-dom';
import * as getData from '../actions/signupAction';
import feelancer from '../feelancer-LOGO.svg';
import {userData} from "../reducers/reducer-user";
import Dropzone from 'react-dropzone';

class UserProfile extends React.Component{

    constructor(props) {
        super(props);
        this.state = {
            redirect: false,
            profileImage:null,
            preview: null
        };
        this.onImageDrop = this.onImageDrop.bind(this);
    }

    componentWillReceiveProps(nextProps){
        if(nextProps.userData){
            this.setState ({
                name : nextProps.userData.data.name,
                email : nextProps.userData.data.email,
                about : nextProps.userData.data.about,
                phone : nextProps.userData.data.phone,
                skills : nextProps.userData.data.skills,
                //profileImage: window.URL.createObjectURL(new Blob(nextProps.userData.data.profileImage, {type: "application/zip"})),
                //preview: global.URL.createObjectURL(nextProps.userData.data.profileImage),
                userFiles: nextProps.userData.data.userFiles
            })

            var fileData = JSON.stringify(nextProps.userData.data.profileImage, undefined, 4); // first use JSON.stringify
            var blob = new Blob([fileData], {type: "text/json;charset=utf-8"}); // save as Blob
            this.setState({
                profileImage: window.URL.createObjectURL(blob)
            });
        }
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
        this.props.updateUser(this.state);
    }

    logout(){
        this.props.logout();
    }

    isDataNotValid(){
        return true;
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

    profilePhotoUpload(){

    }
    profilePhotoSelect(event){
        this.setState({
            profileImage : event.target.files[0]
        });
    }

    render(){
        const {redirect}  = this.state;
        const { userData } = this.props;
        console.log("profileinmage"+this.state.profileImage);
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
                <div className="col-md-8 justify-content-md-center form-border mt30 border-blue">
                    <nav className="row bar nav-black justify-content-md-center mb20 border-blue nav-font">
                        <div className="mb20 mt15 font-bold">USER PROFILE</div>
                    </nav>
                    <div className="row ml60 mt10">
                        <label className="mr120"> Profile Image </label>
                        <br/>
                        { this.state.preview &&
                        <img src={ this.state.preview } alt="image preview" />
                        }
                    </div>
                    <div className="row ml60 mt10">
                        <input type="file" onChange = {this.profilePhotoSelect.bind(this)} />
                    </div>
                    <div className="row ml60 mt10">
                        <Dropzone style="height: 50px"
                                  multiple={false}
                                  accept="image/*"
                                  onDrop={this.onImageDrop}>
                            <p><u>Click here</u> to upload a profile image</p>
                        </Dropzone>
                    </div>
                    <div className="row ml60 mt10">
                    <label className="mr120">Name</label>
                    <input
                        placeholder="Name"
                        className="form-control  col-md-5 col-md-offset-5"
                        type="text"
                        label=""
                        value={this.state.name}
                        onChange={(event) => {
                            this.setState({
                                name: event.target.value
                            })
                        }}
                    />
                    </div>
                    <div className="row ml60 mt10">
                        <label className="mr120">Email</label>
                        <input
                            placeholder="Email"
                            className="form-control  col-md-5"
                            type="text"
                            label=""
                            value={this.state.email}
                            onChange={(event) => {
                                this.setState({
                                    email: event.target.value
                                })
                            }}
                            disabled
                        />
                    </div>
                    <div className="row ml60 mt10">
                        <label className="mr50 ">Phone Number</label>
                        <input
                            placeholder="Phone Number"
                            className="form-control  col-md-5"
                            type="text"
                            label=""
                            value={this.state.phone}
                            onChange={(event) => {
                                this.setState({
                                    phone: event.target.value
                                })
                            }}
                        />
                    </div>
                    <div className="row ml60 mt10">
                        <label className="mr88">About Me</label>
                        <input
                            placeholder="About"
                            className="form-control  col-md-5"
                            type="text"
                            label=""
                            value={this.state.about}
                            onChange={(event) => {
                                this.setState({
                                    about: event.target.value
                                })
                            }}
                        />
                    </div>
                    <div className="row ml60 mt10 mb10">
                        <label className="mr120">Skills</label>
                        <input
                            placeholder="Skills"
                            className="form-control  col-md-5"
                            type="text"
                            value={this.state.skills}
                            onChange={(event) => {
                                this.setState({
                                    skills: event.target.value
                                })
                            }}
                        />
                    </div>
                    <button className="btn btn-primary" onClick={this.updateUserDetails.bind(this)}>Update Details</button>
                </div>
            </div>
        </div>
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
export default connect(mapStateToProps,mapDispatchToProps)(UserProfile);