import React from "react";
import {render} from "react-dom";
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import feelancer from '../feelancer-LOGO.svg';
import {Redirect, Link} from 'react-router-dom';
import axios from 'axios';
import * as postData from "../actions/projectActions";
import * as checkLoggedSession from "../actions/signupAction";
import {projectData} from "../reducers/reducer-project";
import {userData} from "../reducers/reducer-login";
import DatePicker from 'react-datepicker';
import moment from 'moment';
import 'react-datepicker/dist/react-datepicker.css';

class PostProject extends React.Component{

    constructor(props){
        super(props);
        this.state= {
            projectName: "",
            description: "",
            skills: "",
            budget:"Basic",
            endDate:moment(),
            errors:"",
            redirectHome:false,
            optionsdata: [
                {key:'Basic ($2 - $8 USD)',value: 'Basic ($2 - $8 USD)'},
                {key:'Moderate ($8 - $15 USD)',value: 'Moderate ($8 - $15 USD)'},
                {key:'Standard ($15 - $25 USD)',value: 'Standard ($15 - $25 USD)'},
                {key:'Skilled ($25 - $50 USD)',value: 'Skilled ($25 - $50 USD)'},
                {key:'Expert ($50 + USD)',value: 'Expert ($50 + USD)'}
            ],
            projectFiles:null
        }
        this.fileSelectedHandler = this.fileSelectedHandler.bind(this);
    }

    componentWillMount(){
        this.props.checkSession()
    }

    componentWillReceiveProps(nextProps){
        console.log(nextProps);
        if(nextProps.userData){
            if(nextProps.userData.data.sessionActive == true){
                this.setState ({
                    redirect : false
                })
            }else {
                this.setState({
                    redirect: true
                })
            }
        }
    }

    handleDateChange(date) {
        //var dateChange = moment(date).format('YYYY-MM-DD HH:MM:SS');
        //console.log(dateChange);
        this.setState({
            endDate: date
        });
    }

    postProject(e){
        e.preventDefault();
        this.props.postProject(this.state).then(
            (data) => {
                this.setState({
                   redirectHome: true
                })
            },
            (err) => {this.setState({errors : err.response.data.errors})
                console.log(err.response.data.errors);}

        );
    }

    handleChange = (e) => {
        console.log(e.target.value);
        this.setState({
           budget : e.target.value
        });
        var value = this.state.optionsdata.filter(function(item) {
            return item.key == e.target.value
        })

    }

    logout(){
        this.props.logout();
    }


    fileSelectedHandler(e) {
        this.state.projectFiles = e.target.files[0];
        this.setState({
            projectFiles: this.state.projectFiles
        })
        console.log("selected file : ",this.state.projectFiles);
    }
    render(){

        const { userData } = this.props;
        if(this.state.redirect || userData.data.logout === true)
            return (<Redirect to={{
                pathname: '/login'
            }} />)
        if(this.state.redirectHome)
            return (<Redirect to={{
                pathname: '/home'
            }} />)
        const {errors} = this.state;

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
                </nav>
                <div className="display-flex justify-content-md-center mt40">
                    <div className="col-md-8 mt30 align-left">
                        <form  onSubmit={this.postProject.bind(this)}>
                        {errors && <div className="help-block">{errors}</div>}
                        <div className="mb30">
                            <h4>Tell us what you need done</h4>
                            <label>Get free quotes from skilled freelancers within minutes, view profiles, ratings and portfolios and chat with them. Pay the freelancer only when you are 100% satisfied with their work.</label>
                        </div>
                        <div className="mb30">
                            <h4>Choose a name for your project</h4>
                            <input
                                placeholder="e.g Build me a website"
                                className="form-control  col-md-10"
                                type="text"
                                required
                                label=""
                                required
                                onChange={(event) => {
                                    this.setState({
                                        projectName : event.target.value
                                    });
                                }}
                            />
                        </div>
                        <div className="mb30">
                            <h4>Tell us more about your project</h4>
                            <label>Great project descriptions include a little bit about yourself, details of what you are trying to achieve, and any decisions that you have already made about your project. If there are things you are unsure of, don't worry, a freelancer will be able to help you fill in the blanks.</label>
                            <textarea
                                className="col-md-10"
                                name="body"
                                required
                                placeholder="Describe your project here..."
                                onChange={(event) => {
                                    this.setState({
                                        description : event.target.value
                                    });
                                }}
                                value={this.state.description}
                            />
                        </div>
                        <div className="mb30">
                            <h4>What skills are required?</h4>
                            <label>Enter up to 5 skills that best describe your project. Freelancers will use these skills to find projects they are most interested and experienced in.</label>
                            <input
                                placeholder="What skills are required?"
                                className="form-control  col-md-10"
                                type="text"
                                required
                                label=""
                                value={this.state.skills}
                                onChange={(event) => {
                                    this.setState({
                                        skills : event.target.value
                                    });
                                }}
                            />
                        </div>
                        <div className="mb30" onChange={this.handleChange}>
                            <h4>What is your estimated budget?</h4>
                            <select className="select-style" required onChange={this.handleChange}>
                                {this.state.optionsdata.map(function(data, key){  return (
                                    <option key={key} value={data.key}>{data.value}</option> )
                                })}
                            </select>
                        </div>
                        <div className="mb30">
                            <h4>When do you want the project completed?</h4>
                            <DatePicker  required
                                selected={this.state.endDate}
                                onChange={this.handleDateChange.bind(this)}
                            />
                        </div>
                        <br/>
                        <div className="mb30">
                            <h4>Project Files</h4>
                            <input
                                type="file"
                                onChange={this.fileSelectedHandler.bind(this)}
                            />
                        </div>
                        <button className="btn btn-warning mb30">Post My Project</button>
                        </form>
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
export default connect(mapStateToProps,mapDispatchToProps)(PostProject);