import React from "react";
import {render} from "react-dom";
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {Redirect} from 'react-router-dom';
import {userSignUp} from '../actions/signupAction';
import {Link} from 'react-router-dom';
import feelancer from '../feelancer-LOGO.svg';

class Signup extends React.Component{

    state={
        name:"",
        email:"",
        password:""
    }

    onChange(e){
        this.setState({
            [e.target.name]:e.target.value
        });
    }

    signUp(e){
        e.preventDefault();
        this.setState({errors:""});
        this.props.userSignUp(this.state).then(
            (data) => {

                this.setState({
                    redirect: true
                })
            },
            (err) => {this.setState({errors : err.response.data});
                console.log(JSON.stringify(err.response));}

        );
        console.log("Error"+this.state.errors);
    }

    render(){
        const { redirect,errors } = this.state
        if (redirect)
            return (<Redirect to={{
                pathname: '/login'
            }} />)
        return(
            <div className="display-flex justify-content-md-center mt40">
                <div className="col-md-4 form-border mt30">
                    <form className="" onSubmit={this.signUp.bind(this)}>
                        <img src={feelancer} className="freelance-logo mt20" alt="logo"/>
                        <hr/>
                        {errors && <div className="help-block">{errors}</div>}
                        <div>
                            <h5>Sign Up for free today!</h5>
                        </div>
                        <hr/>
                        <div>
                            <div className="input-type">
                                <input
                                    placeholder="Name"
                                    className="form-control  col-md-10"
                                    type="text"
                                    required
                                    label=""
                                    name="name"
                                    onChange={this.onChange.bind(this)}
                                />
                            </div>
                            <div className="input-type ">
                                <input
                                    placeholder="Email Address"
                                    className="form-control col-md-10"
                                    type="email"
                                    required
                                    label=""
                                    name="email"
                                    onChange={this.onChange.bind(this)}
                                />
                            </div>
                            <div className="input-type">
                                <input
                                    placeholder="Password"
                                    className="form-control col-md-10"
                                    type="password"
                                    label=""
                                    required
                                    name="password"
                                    onChange={this.onChange.bind(this)}
                                />
                            </div>
                        </div>

                        <button className="btn btn-primary mt20 col-md-8">Submit</button>
                        <hr/>
                        <label>Already a member? <Link to='/login'>Log In</Link></label>
                    </form>
                </div>
            </div>
        );
    }
}

Signup.propTypes = {
    userSignUp: PropTypes.func.isRequired
}

export default connect(null,{userSignUp})(Signup);