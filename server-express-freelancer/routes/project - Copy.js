var express = require('express');
var router = express.Router();
var mysql = require('./mysql');

var nBids = 0;

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

router.post('/postProject', function(req, res){
    var getProjectId="select max(project_id) as maxCnt from project";
    var errors;
    var d = new Date(req.param("endDate"));
    var finDate = d.getFullYear()+'-'+d.getMonth()+'-'+d.getDate()+" "+d.getHours()+":"+d.getMinutes()+":"+d.getSeconds();
    var projectId;
    var userID = req.session.userID;
    console.log("SQL : :"+getProjectId);
    mysql.fetchData(function (error,results) {
        if(error){
            errors="Unable to process request";
            res.status(400).json(errors);
        }
        else{
            if(results.length > 0){
                projectId = results[0].maxCnt+1;
                //endDate = changeToDate(req.param("endDate"));

                var addProject="insert into project (project_id,employer_id,title,description, files, skills, budget, avg_bid, status, project_completion_date) values ('"+projectId+"','"+userID+"','" + req.param("projectName") +"','" + req.param("description") +"','" + req.param("projectFiles") +"','"+ req.param("skills") +"','" + req.param("budget")+"','0','Open','"+finDate+"')";
                console.log("insert SQL : :"+addProject);
                mysql.fetchData(function (error,results) {
                    if(error){
                        errors="Unable to add project at this time."
                        res.status(400).json({errors});
                    }
                    else{
                        if(results.affectedRows > 0){
                            console.log("SQL insert" +JSON.stringify(results));
                            res.send("Project Posted Successfully")
                        }
                    }
                },addProject);
            }
        }
    },getProjectId);
});

router.get('/getAllOpenProjects', function(req, res){
    var list= [];
    var data = {
        projectsList: []
    };
    var user_id= req.session.userID;
    var getProjectList  = "select p.project_id, p.description, u.name, p.employer_id, p.title, p.avg_bid, p.project_completion_date, p.status, p.skills ";
    getProjectList = getProjectList + "from freelancer_prototype_db.project p , freelancer_prototype_db.user u where p.employer_id = u.user_id";/*and p.status = '"+"Open"+"'"*/

    mysql.fetchData(function(err,results){
        if(results.length > 0) {
            var i = 0;
            while(i<results.length) {
                var project = {
                    project_id: results[i].project_id,
                    description: results[i].description,
                    employer_name : results[i].name,
                    employer_id: results[i].employer_id,
                    title: results[i].title,
                    avg_bid: results[i].avg_bid,
                    skills:results[i].skills,
                    project_completion_date: results[i].project_completion_date,
                    status: results[i].status
                }
                list.push(project);
                i++;
            }
            data.projectsList = list;
            res.send(data);
        }
    },getProjectList);
});

router.get('/userAsFreelancerProjects', function(req, res){
    var list= [];
    var data = {
        projectsList: []
    };
    var user_id= req.session.userID;
    var getProjectList  = "select p.project_id, p.description, u.name, p.employer_id, p.title, p.avg_bid, p.project_completion_date, p.status, p.skills ";
    getProjectList = getProjectList + "from project p, user u where ";
    getProjectList = getProjectList + "  p.employer_id <>  "+user_id+" and p.employer_id=u.user_id";

    mysql.fetchData(function(err,results){
        if(results.length > 0) {
            var i = 0;
            while(i<results.length) {
                var project = {
                    project_id: results[i].project_id,
                    description: results[i].description,
                    employer_name : results[i].name,
                    employer_id: results[i].employer_id,
                    title: results[i].title,
                    avg_bid: results[i].avg_bid,
                    skills:results[i].skills,
                    project_completion_date: results[i].project_completion_date,
                    status: results[i].status
                }
                list.push(project);
                i++;
            }
            data.projectsList = list;
            res.send(data);
        }
    },getProjectList);
});

//get List of all projects posted by employer
router.get('/listOfAllProjectsPostedByEmployer', function(req, res){
    var list= [];
    var data = {
        bList: []
    };
    console.log("/listOfAllProjectsPostedByEmployer-----------------------------------------------",req.session.userID);
    var user_id= req.session.userID;
    var getProjectList = "select p.project_id, u.user_id, p.title, p.avg_bid, u.name, p.project_completion_date, p.status";
    getProjectList = getProjectList + " from freelancer_prototype_db.project p, freelancer_prototype_db.user u";
    getProjectList = getProjectList + " where u.user_id = p.employer_id and u.user_id = "+user_id;
    mysql.fetchData(function(err,results){
        if(results.length > 0) {
            var i = 0;
            while (i < results.length) {
                var project = {
                    project_id: results[i].project_id,
                    user_id: results[i].user_id,
                    projectName: results[i].title,
                    avg_bid: results[i].avg_bid,
                    userName: results[i].name,
                    project_completion_date: results[i].project_completion_date,
                    status: results[i].status
                }
                list.push(project);
                i++;
            }
            data.bList = list;
            res.send(data);
        }
    },getProjectList);
});


function getBidsCount(project_id){
    var getBids="select count(*) as numberOfBids from bid b where b.project_id=" +project_id;
    var bids = 0;
    mysql.fetchData(function(err,results){
        console.log("Bids function result", results[0].numberOfBids);
        if(results.length > 0) {
            nBids = results[0].numberOfBids;
        }
    },getBids);
    return bids;
}

router.get('/getBids', function(req, res){
    console.log("Bids List : inside node  inside getBids");
    console.log("Bids List : inside node  inside getBids project id",req.param("project_id"));
    var list= [];
    var data = {
        bidsList: []
    };
    var project_id= req.param("project_id");
    var getProjectList="select u.user_id, b.project_id,  u.name, b.bid_price, b.period_in_days";
    getProjectList= getProjectList + " from user u, bid b ";
    getProjectList= getProjectList + " where b.user_id = u.user_id and b.project_id = "+project_id;

    console.log(getProjectList);
    mysql.fetchData(function(err,results){
        if(results.length > 0) {
            var i = 0;
            while(i<results.length) {
                var project = {
                    userId : results[i].user_id,
                    project_id : results[i].project_id,
                    name: results[i].name,
                    bid_price: results[i].bid_price,
                    period_in_days: results[i].period_in_days
                }
                list.push(project);
                i++;
            }
            console.log("List of bids inside /getBids",list);
            data.bidsList = list;
            res.send(data);
        }
    },getProjectList);
});

router.post('/bidProjectNow', function(req, res){
    var bid_id;
    var user_id = req.session.userID;
    var bidProject="insert into bid(user_id,project_id,bid_price,period_in_days) values";
    bidProject= bidProject + " ('"+user_id+"','"+req.param("project_id")+"','"+req.param("bid_price")+"','"+req.param("period_in_days")+"' )";
    console.log("insert SQL : :"+bidProject);
    var errors;
    mysql.fetchData(function (error,results) {
        if(error){
            errors="Unable to process request";
            res.status(400).json(errors);
        }
        else{
            if(results.affectedRows > 0){
                var update_bid_count="update project set avg_bid = avg_bid+1 where project_id = "+req.param("project_id");
                console.log("insert SQL : :"+update_bid_count);

                mysql.fetchData(function (error,results) {
                    if(error){
                        errors="Unable to add project at this time."
                        res.status(400).json({errors});
                    }
                    else{
                        if(results.affectedRows > 0){
                            console.log("SQL insert" +JSON.stringify(results));
                            res.send("Bid Done Successfully");
                        }
                    }
                },update_bid_count);
            }
        }
    },bidProject);
});

router.get('/getProjectDetails', function(req, res){
    console.log("Inside Project details");
    var project_id= req.param("project_id");
    getBidsCount(project_id);
    
    var getProject="select * from project where project_id="+project_id;
    console.log("SQL :"+getProject);

    var isEmployer = false;
    var data = {
        projectName: "",
        description: "",
        files: "",
        skills: "",
        budgetRange: "",
        averageBid: "",
        numberOfBids: "",
        employer_id:"",
        status:"",
        transList: []
    };
    mysql.fetchData(function(error,results){
        if(results.length > 0) {
            if(req.session.userID == results[0].employer_id){
                isEmployer = true;
            }
            data = {
                isEmployer,
                projectName: results[0].title,
                description: results[0].description,
                files: results[0].files,
                skills: results[0].skills,
                budget: results[0].budget,
                averageBid:  results[0].avg_bid,
                numberOfBids: nBids,
                employer_id: results[0].employer_id,
                status: results[0].status
            };

            var getTransactions = "select h.user_id, h.project_id, h.payment_type, h.amount from payment_history h where h.project_id =" + req.param("project_id");
            console.log("SQL select ", getTransactions);
            mysql.fetchData(function (error, results) {
                if (error) {
                    errors = "Unable to add payment at this time."
                    res.status(400).json({errors});
                }
                else {
                    if (results.length > 0) {
                        var i = 0;
                        var list= [];
                        while(i<results.length) {
                            var transaction = {
                                user_id: results[i].user_id,
                                project_id: results[i].project_id,
                                payment_type : results[i].payment_type,
                                amount: results[i].amount
                            }
                            list.push(transaction);
                            i++;
                        }
                        data.transList = list;
                        console.log("Project details transaction list ",data.transList);
                        res.send(data);
                    }else{
                        res.send(data);
                    }
                }
            }, getTransactions);
        }
    },getProject);
});

router.post('/hireFreelancer', function(req, res){
    //var addFreelancerDetails = "insert into project (user_id) values ('" + req.param("user_id") +"') where project_id = "+req.param("project_id");
    var addFreelancerDetails = "update project set freelancer_id ='" + req.param("user_id") +"' where project_id = "+req.param("project_id");
    var error = "";
    var data = {};
    mysql.fetchData(function(err,results){
        console.log(JSON.stringify(results));
        if(err){
            error = "Unable to process your request";
            res.status(400).json({error});
        }
        else if(results.affectedRows > 0) {
            data.message = "Freelancer Hired Successfully";
            res.send(data);
        }
    },addFreelancerDetails);
});

router.post('/makePayment', function(req, res){
    console.log("bid price",req.param("bid_price"));
    var error = "";
    var data = {};
    var updateEmpBal = "update freelancer_prototype_db.user u set u.balance = u.balance - "+ req.param("bid_price") +" where u.user_id = "+req.param("employer_id");

    var errors;
    mysql.fetchData(function (error,results) {
        if(error){
            errors="Unable to process request";
            res.status(400).json(errors);
        }
        else{
            console.log("update Emp balance SQL : :"+updateEmpBal);
            if(results.affectedRows > 0){
                var getTransId="select max(trans_id) as maxCnt from freelancer_prototype_db.payment_history";
                mysql.fetchData(function (error,results) {
                    if(error){
                        errors="Unable to process request";
                        res.status(400).json(errors);
                    }
                    else {
                        if (results.length > 0) {
                            var transId = results[0].maxCnt + 1;
                            var update_emp_history = "insert into freelancer_prototype_db.payment_history (trans_id, user_id, project_id, payment_type, amount) values ( "+ transId + "," +req.param("employer_id") +"," + req.param("project_id")+ "," +"'Db'"+"," +req.param("bid_price")+" )";
                            console.log("SQL insert",update_emp_history);
                            mysql.fetchData(function (error,results) {
                                if(error){
                                    errors="Unable to deduct payment from employer at this time."
                                    res.status(400).json({errors});
                                }
                                else{
                                    console.log("update Eupdate_emp_history : :"+update_emp_history);
                                    if(results.affectedRows > 0){
                                        console.log("SQL update" +JSON.stringify(results));
                                        var updateUserBal = "update freelancer_prototype_db.user u set u.balance = u.balance + "+ req.param("bid_price") +" where u.user_id = "+req.param("user_id");
                                        console.log("SQL Update : :"+updateUserBal);

                                        mysql.fetchData(function (error,results) {
                                            if(error){
                                                errors="Unable to add payment at this time."
                                                res.status(400).json({errors});
                                            }
                                            else{
                                                console.log("update updateUserBal : :"+updateUserBal);
                                                if(results.affectedRows > 0){
                                                    console.log("SQL insert" +JSON.stringify(results));
                                                    var getTransId1="select max(trans_id) as maxCnt from freelancer_prototype_db.payment_history";
                                                    mysql.fetchData(function (error,results) {
                                                        if (error) {
                                                            errors = "Unable to process request";
                                                            res.status(400).json(errors);
                                                        }
                                                        else {
                                                            if (results.length > 0) {
                                                                var transId1 = results[0].maxCnt + 1;
                                                                var update_emp_history = "insert into freelancer_prototype_db.payment_history (trans_id, user_id, project_id, payment_type, amount) values ( " + transId1 +","+ req.param("user_id") + "," + req.param("project_id") + "," + "'Cr'" + "," + req.param("bid_price") + " )";
                                                                console.log("SQL insert ", update_emp_history);
                                                                mysql.fetchData(function (error, results) {
                                                                    if (error) {
                                                                        errors = "Unable to add payment at this time."
                                                                        res.status(400).json({errors});
                                                                    }
                                                                    else {
                                                                        if (results.affectedRows > 0) {
                                                                            console.log("SQL insert ", update_emp_history);
                                                                            console.log("SQL insert" + JSON.stringify(results));

                                                                            var update_project = "update freelancer_prototype_db.project p set p.status = " + "'Closed'" + " where p.project_id = " + req.param("project_id");
                                                                            console.log("SQL insert ", update_project);
                                                                            mysql.fetchData(function (error, results) {
                                                                                if (error) {
                                                                                    errors = "Unable to add payment at this time."
                                                                                    res.status(400).json({errors});
                                                                                }
                                                                                else {
                                                                                    if (results.affectedRows > 0) {
                                                                                        var getTransactions = "select h.user_id, h.project_id, h.payment_type, h.amount from freelancer_prototype_db.payment_history h where h.project_id =" + req.param("project_id");
                                                                                        console.log("SQL select ", getTransactions);
                                                                                        mysql.fetchData(function (error, results) {
                                                                                            if (error) {
                                                                                                errors = "Unable to add payment at this time."
                                                                                                res.status(400).json({errors});
                                                                                            }
                                                                                            else {
                                                                                                if (results.length > 0) {
                                                                                                    var i = 0;
                                                                                                    var list= [];
                                                                                                    while(i<results.length) {
                                                                                                        var transaction = {
                                                                                                            user_id: results[i].user_id,
                                                                                                            project_id: results[i].project_id,
                                                                                                            payment_type : results[i].payment_type,
                                                                                                            amount: results[i].amount
                                                                                                        }
                                                                                                        list.push(transaction);
                                                                                                        i++;
                                                                                                    }
                                                                                                    var data = {transList: list,
                                                                                                        message: "Payment done Successfully"
                                                                                                    }
                                                                                                    res.send(data);
                                                                                                }
                                                                                            }
                                                                                        }, getTransactions);
                                                                                    }
                                                                                }
                                                                            }, update_project);
                                                                        }
                                                                    }
                                                                }, update_emp_history);
                                                            }
                                                        }
                                                    },getTransId1);
                                                }
                                            }
                                        },updateUserBal);
                                    }
                                }
                            },update_emp_history);
                        }
                    }
                },getTransId);
            }
        }
    },updateEmpBal);
});

function changeToDate(date){
    if (date instanceof Date)
        return date.toLocaleFormat("%Y-%m-%d %H:%M:%S")
}

module.exports = router;