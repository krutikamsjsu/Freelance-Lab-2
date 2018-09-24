import React from "react";
import {render} from "react-dom";
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {Redirect} from 'react-router-dom';
import {userLogin} from '../actions/signupAction';
import feelancer from '../feelancer-LOGO.svg';
import {Link} from 'react-router-dom';
//import {Platform} from 'react-native';
//import { sha256 } from 'react-native-sha256';


class Login extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            email:"",
            password:""
        }
    }

    onChange(e){
        this.setState({
            [e.target.name]:e.target.value
        });
    }
    login(e){
        e.preventDefault();
        this.setState({errors:""});
        this.props.userLogin(this.state).then(
            (data) => {
                this.setState({
                    redirect: true
                })
            },
            (err) => {this.setState({errors : err.response.data})
                console.log(err.response);}

        );
    }
    render(){
        if (this.state.redirect) {
            //alert("sdfghjk");
            return (<Redirect to={{
                pathname: '/profile'
            }}/>)
        }
        const {userLogin} = this.props;
        const {errors} = this.state;
        return(
            <div className="display-flex justify-content-md-center mt40">
                <div className="col-md-4 form-border mt30">
                    <form className="" onSubmit={this.login.bind(this)}>
                        <img src={feelancer} className="freelance-logo mt20" alt="logo"/>
                        <hr/>
                        {errors && <div className="help-block">{errors}</div>}
                        <div>
                            <h5>Log In here</h5>
                        </div>
                        <hr/>
                        <div>
                            <div className="input-type ">
                                <input
                                    placeholder="Email Address"
                                    className="form-control col-md-10"
                                    type="email"
                                    name="email"
                                    required
                                    label=""
                                    onChange={this.onChange.bind(this)}/>
                            </div>
                            <div className="input-type">
                                <input
                                    placeholder="Password"
                                    className="form-control col-md-10"
                                    type="password"
                                    name="password"
                                    required
                                    label=""
                                    onChange={this.onChange.bind(this)}/>
                            </div>
                        </div>

                        <button className="btn btn-primary mt20 col-md-8">Log In</button>
                        <hr/>
                        <label>Dont have an account? <Link to="/signup">Sign Up</Link></label>
                    </form>
                </div>
            </div>
        );
    }
}

Login.propTypes = {
    userLogin: PropTypes.func.isRequired
}

export default connect(null,{userLogin})(Login);