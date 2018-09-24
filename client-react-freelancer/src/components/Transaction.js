import React from "react";
import * as transactionData from "../actions/projectActions";
import * as checkLoggedSession from "../actions/signupAction";
import * as userData from "../actions/userDataActions";
import {bindActionCreators} from 'redux'
import {connect} from "react-redux";
import {Redirect} from 'react-router-dom';
import {Link} from 'react-router-dom';

class Transaction extends React.Component{

    state={
        redirect:false,
        transactionDetails:{
            paymentType:"",
            amount:0
        },
        aMessage:"",
        wMessage:"",
        errors:"",
        totalFund:0,
        transList:[],
        addMoney:"",
        withdrawMoney:""
    }

    componentWillReceiveProps(nextProps) {
        console.log(nextProps);
        if (nextProps.userData) {
            if (nextProps.userData.data.sessionActive == true) {
                this.setState({
                    redirect: false
                })
            } else {
                this.setState({
                    redirect: true
                })
            }
        }
        if (nextProps.transData.userData) {
            this.setState({
                totalFund: nextProps.transData.userData.total_balance,
                transList: nextProps.transData.userData.listOfTrans
            })
            //this.state.transList = nextProps.transData.data.listOfTrans;

            /*this.setState({
                transList: this.state.transList
            });*/
        }
    }

    componentWillMount(){
        this.props.checkSession();
        this.props.getTotalBalance();
        this.props.getTransactionList();
    }

    nextPath(path) {
        this.props.history.push(path);
    }

    logout(){
        this.props.logout();
    }

    addMoney(e){
        e.preventDefault();
        var aMoneyData = {};
        aMoneyData.money = this.state.addMoney;
        this.setState({
            addMoney : ""
        })
        this.props.addMoney(aMoneyData).then(
            (data) => {
                this.props.getTotalBalance();
                this.props.getTransactionList();
                this.setState({
                    totalFund: this.props.transData.userData.total_balance
                });
                this.state.transList = this.props.transData.userData.listOfTrans;
                this.setState({
                    transList: this.state.transList
                });
                this.setState({
                    aMessage: this.props.transData.userData.message
                });
            },
            (err) => {
                this.setState({errors : err.response.data.error});
                console.log(JSON.stringify(err.response));
            });
    }

    withdrawMoney(e){
        e.preventDefault();
        var wMoneyData = {};
        wMoneyData.money = this.state.withdrawMoney;
        this.setState({
            withdrawMoney : ""
        })
        this.props.withdrawMoney(wMoneyData).then(
            (data) => {
                this.props.getTotalBalance();
                this.props.getTransactionList();

                console.log("this.props.transData.data----------",this.props.transData.userData);
                this.setState({
                    totalFund: this.props.transData.userData.total_balance
                });
                this.setState({
                    transList: this.props.transData.userData.listOfTrans
                });
                this.setState({
                    wMessage: this.props.transData.userData.message
                });
            },
            (err) => {
                this.setState({errors : err.response.data.error});
                console.log(JSON.stringify(err.response));
            });
    }

    render(){
        const {redirect}  = this.state;
        const {errors}  = this.state;
        const {message}  = this.state;
        const { userData } = this.props;
        if(this.state.redirect || userData.data.logout === true)
            return (<Redirect to={{
                pathname: '/login'
            }} />)
        console.log("message : ",this.state.transList);

        return(
            <div>
                <div className="App-header">
                    <button className="btn btn-primary logout-btn" onClick={this.logout.bind(this)}>Logout</button>
                </div>
                <nav className="bar nav-black">
                    <Link to="/home" className="item-button bar-item ml75">Home</Link>
                    <Link to="/dashboard" className="item-button bar-item">Dashboard</Link>
                    <Link to="/profile" className="item-button bar-item">User Profile</Link>
                    <Link to="/transaction" className="item-button bar-item">My Transaction</Link>
                    <button className="btn-warning btn post-project-btn" onClick={() => this.nextPath('/post-project')}>Post Project</button>
                </nav>
                <div className="display-flex justify-content-md-center mt40">
                    <div className="col-md-8  justify-content-md-center form-border mt30">
                        <h3 className="mb30 mt50 col-md-4">Transaction Details</h3>
                        <div className="col-md-offset-5 mt50">
                            <label className="font-bold col-md-4">Total Fund : </label>
                            <label className="font-bold col-md-1">{JSON.stringify(this.state.totalFund)} </label>
                        </div>
                        {errors && <div className="help-block">{errors}</div>}
                        {this.state.aMessage && <div className="success-block">{this.state.aMessage}</div>}
                        <div className="col-md-offset-5 mt20">
                            <input type="text" id="addValue" value={this.state.addMoney} onChange={(event)=>this.setState({addMoney  : event.target.value})} className="font-bold col-md-3"/>
                            <button type="button" onClick={this.addMoney.bind(this)}> Add Money </button>
                        </div>
                        {errors && <div className="help-block">{errors}</div>}
                        {this.state.wMessage && <div className="success-block">{this.state.wMessage}</div>}
                        <div className="col-md-offset-5 mt20">
                            <input type="text" id="withValue" value={this.state.withdrawMoney} onChange={(event)=>this.setState({withdrawMoney : event.target.value})} className="font-bold col-md-3"/>
                            <button type="button" onClick={this.withdrawMoney.bind(this)}> Withdraw Money </button>
                        </div>
                        <br/>
                        <br/>
                        <div>
                            <div className="mt30">
                                <nav className="row bar nav-black">
                                    <div className="col-md-6 mt10 mb10">Transaction Type</div>
                                    <div className="col-md-6 mt10 mb10">Amount</div>
                                    <br/>
                                </nav>
                                <div className="mt20"></div>
                            </div>
                            <div>
                                {this.state.transList.map((ts,i) =>
                                    <h5 key={i}>
                                        <div className="row row-border mt20 ml7 mr7">
                                            <div className="col-md-6 mt15 mb15">{ts.payment_type}</div>
                                            <div className="col-md-6 mt15 mb15">{ts.amount}</div>
                                        </div>
                                    </h5>
                                )}
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
        transData : state.UserReducer,
        userData : state.LoginReducer
    };
}

function mapDispatchToProps(dispatch){
    return bindActionCreators(Object.assign({}, transactionData,checkLoggedSession,userData),dispatch)
}
export default connect(mapStateToProps,mapDispatchToProps)(Transaction);

