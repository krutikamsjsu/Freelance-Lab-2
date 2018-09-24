import React from "react";
import * as checkLoggedSession from "../actions/signupAction";
import {userData} from "../reducers/reducer-login";
import {bindActionCreators} from 'redux'
import {connect} from "react-redux";
import feelancer from '../feelancer-LOGO.svg';
import * as postData from "../actions/projectActions";
import {Redirect} from 'react-router-dom';
import {Link} from 'react-router-dom';
import Search from 'react-search';

class Home extends React.Component{
    constructor(props){
        super(props);
        this.state={
            listOfProject: [],
            redirect : false,
            period_in_days:"",
            bid_price:"",
            project_id:"",
            currentPage: 1,
            todosPerPage: 10,
            search:"",
            listOfProjectBck:[],
            userSkills:[]
        }
        this.showProject = this.showProject.bind(this);
        this.pageNumClicked = this.pageNumClicked.bind(this);
        this.searchData = this.searchData.bind(this);
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
        if(nextProps.projectData){
            this.setState({
                listOfProject : nextProps.projectData.data.listOfProjects,
                listOfProjectBck : nextProps.projectData.data.listOfProjects
            });
        }
        if(nextProps.userData){
            let skills = [];
            if(nextProps.userData.data && nextProps.userData.data.skills) {
                skills = (nextProps.userData.data.skills).split(',');
                this.setState({
                    userSkills: skills
                });
            }
        }
    }


    componentWillMount(){
        this.props.checkSession();
        this.props.getProjectDataForHome();
        this.props.getUserData()
    }

    componentDidMount(){
        var doc = document.getElementById("1");
        if(doc != undefined) {
            doc.style.backgroundColor = "blue";
            doc.style.color = "white";
        }
    }

    bid(id){

        var str = "bid-details"+id;
        var x = document.getElementById(str);
        if (x.style.display === "none") {
            x.style.display = "block";
        } else {
            x.style.display = "none";
        }
    }

    showProject(id){
        this.props.projectId = id;
    }

    bidNow(id){
        var bidData = {};
        bidData.project_id = id;
        bidData.period_in_days = this.state.period_in_days;
        bidData.bid_price = this.state.bid_price;
        var str = "bid-details"+id;
        var x = document.getElementById(str);
        x.style.display = "none";
        this.props.bidProjectNow(bidData).then(
            (data) => {
                this.props.getProjectDataForHome();
            },
            (err) => {
                this.setState({redirect:true})
            });
    }

    onChange(e){
        this.setState({
            [e.target.name]:e.target.value
        });
    }

    nextPath(path) {
        this.props.history.push(path);
    }

    logout(){
        this.props.logout();
    }

    pageNumClicked(event){
        this.setState({
            currentPage: Number(event.target.id)
        });
        var pageNums = Math.ceil(this.state.listOfProject.length / this.state.todosPerPage);
        var doc;
        for (var i=1; i<=pageNums; i++){
            console.log("page number"+i);
            doc = document.getElementById(""+i);
            if(i == event.target.id) {
                doc.style.backgroundColor = "blue";
                doc.style.color = "white";
            }else{
                doc.style.backgroundColor = "white";
                doc.style.color = "blue";
            }
        }
    }

    searchData(){
        /* if("krutika mude".includes(this.state.search)) {
             alert(this.state.search);
         }*/
        var projectList = [];
        var bckup = this.state.listOfProjectBck;

        this.setState({
            listOfProject : bckup
        })
        var searchStr = this.state.search;
        if(searchStr == ""){
            this.setState({
                listOfProject : bckup
            })
        }else {
            this.setState({
                listOfProject: this.state.listOfProjectBck.filter(function (project) {
                    return (project.title.includes(searchStr) || project.skills.includes(searchStr));
                })
            });
        }
    }

    onChange(e){
        this.setState({
            [e.target.name]:e.target.value
        });
        //this.searchData();
    }


    revProject(){
        var projectList = [];
        var bckup = this.state.listOfProjectBck;

        this.setState({
            listOfProject : bckup
        })
        for(var i=0;i<this.state.userSkills.length;i++){
            for(var j=0;j<this.state.listOfProject.length;j++){
                if(this.state.listOfProject[j].skills.includes(this.state.userSkills[i])){
                    projectList.push(this.state.listOfProject[j]);
                }
            }
        }
        this.setState({
            listOfProject : projectList
        })
        console.log("projectList"+JSON.stringify(projectList));

    }

    allProject(){
        var projectList = this.state.listOfProjectBck;
        this.setState({
            listOfProject : projectList
        })
    }

    render() {
        const { currentPage, todosPerPage } = this.state;
        const indexOfLastTodo = currentPage * todosPerPage;
        const indexOfFirstTodo = indexOfLastTodo - todosPerPage;
        const currentTodos = this.state.listOfProject.slice(indexOfFirstTodo, indexOfLastTodo);

        const { userData } = this.props;
        if(this.state.redirect || userData.data.logout === true)
            return (<Redirect to={{
                pathname: '/login'
            }} />)

        const pageNumbers = [];
        for (let i = 1; i <= Math.ceil(this.state.listOfProject.length / todosPerPage); i++) {
            pageNumbers.push(i);
        }

        return (
            <div>
                <div className="App-header">
                    <img src={feelancer} className="App-logo" alt="logo" />
                    <input type="text"
                           name="search"
                           onChange={this.onChange.bind(this)}
                           placeholder="Search"
                           className="searchBox col-md-4"/><button type="submit" className="p510" onClick={this.searchData}><i class="fa fa-search"></i></button>
                    <button className="btn btn-primary logout-btn" onClick={this.logout.bind(this)}>Logout</button>
                </div>
                <nav class="bar nav-black">
                    <Link to="/home" class="item-button bar-item ml75">Home</Link>
                    <Link to="/dashboard" class="item-button bar-item">Dashboard</Link>
                    <Link to="/profile" class="item-button bar-item">User Profile</Link>
                    <Link to="/transaction" className="item-button bar-item">My Transaction</Link>
                    <button className="btn-warning btn post-project-btn" onClick={() => this.nextPath('/post-project')}>Post Project</button>
                </nav>
                <div className="row ">
                    <section className="display-flex justify-content-md-center col-md-2 mt40">
                        <div>
                            <button className="btn btn-primary col-md-12 ml40 p105" onClick={this.revProject.bind(this)}>Display Relevant Projects</button>
                            <button className="btn btn-primary col-md-12 ml40 p105 mt40" onClick={this.allProject.bind(this)}>Display All Projects</button>
                            <input type="file"/>
                        </div>
                    </section>
                <div className="display-flex justify-content-md-center mt40 col-md-10">
                    <div className="col-md-11 form-border mt30 border-blue pb20">
                        <nav className="row bar nav-black border-blue nav-font">
                            <div className="col-md-2 mt10">PROJECT NAME</div>
                            <div className="col-md-2 mt10">DESCRIPTION</div>
                            <div className="col-md-2 mt10">SKILLS REQUIRED</div>
                            <div className="col-md-2 mt10">EMPLOYER ID</div>
                            <div className="col-md-1 mt10">BIDS COUNT</div>
                            <div className="col-md-2 mt10">BID NOW</div>
                        </nav>
                        <div className="mt20"></div>
                        {currentTodos.map((projectDetail,i) =>
                            <h5 key={i}>
                                <div className="row row-border mt20 ml7 mr7">
                                    <Link to={'/project-details/'+projectDetail.project_id} className="col-md-2 mt15 mb15">{projectDetail.title}</Link>
                                    <div className="col-md-2 mt15 mb15">{projectDetail.description}</div>
                                    <div className="col-md-2 mt15 mb15">{projectDetail.skills}</div>
                                    <Link to={'/view-details/'+projectDetail.employer_id} className="col-md-2 mt15 mb15">{projectDetail.employer_name}</Link>
                                    <div className="col-md-1 mt15 mb15">{projectDetail.avg_bid}</div>
                                    <div className="col-md-2 mt15 mb15 ml60">
                                        <button className="btn btn-primary" onClick={() => this.bid(projectDetail.project_id)}>Bid Project</button>
                                        <div id={"bid-details"+projectDetail.project_id} className="mt10" style={{display:'none'}}>
                                            <input
                                                placeholder="Enter Period"
                                                className="form-control col-md-10 mt10"
                                                type="text"
                                                name="period_in_days"
                                                required
                                                label=""
                                                onChange={this.onChange.bind(this)}
                                            />
                                            <input
                                                placeholder="Enter Amount"
                                                className="form-control col-md-10 mt10"
                                                type="text"
                                                name="bid_price"
                                                required
                                                label=""
                                                onChange={this.onChange.bind(this)}
                                            />
                                            <button className="btn btn-primary mt10" onClick={() => this.bidNow(projectDetail.project_id)}>Bid Now</button>
                                        </div>
                                    </div>
                                </div>
                            </h5>)}
                    </div>
                </div>
                </div>
                <div id="pagin" className="row display-flex justify-content-md-center mt40 pagination">{pageNumbers.map((number,i) =>
                    <Link
                        to='/home'
                        key={i}
                        id={number}
                        className={'page'+number}
                        onClick={this.pageNumClicked}
                    >
                        {number}
                    </Link>
                )}</div>
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
export default connect(mapStateToProps,mapDispatchToProps)(Home);

