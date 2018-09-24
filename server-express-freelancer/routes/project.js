var express = require('express');
var router = express.Router();
var mysql = require('./mysql');
var nodemailer = require('nodemailer');
var mongoose = require('mongoose');
var User = require('./models/userSchema');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://admin:admin@ds135399.mlab.com:35399/freelancer-273";

mongoose.connect(url);

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

    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        console.log("we are connected");
        var dbo = db.db("freelancer-273");
        dbo.collection("project").find().sort({project_id:-1}).limit(1).toArray(function(err, result) {
            if (err) throw err;
            else {
                let project_id = result[0].project_id;

                MongoClient.connect(url, function(err, db) {
                    if (err) throw err;
                    else {
                        var dbo = db.db("freelancer-273");
                        var myobj = {
                            project_id: project_id+1,
                            user_id:req.session.userID,
                            title: req.param("projectName"),
                            description: req.param("description"),
                            skills: req.param("skills"),
                            budget: req.param("budget"),
                            status: "open",
                            avg_bid: req.param("avg_bid"),
                            project_completion_date: finDate
                        };
                        dbo.collection("project").insertOne(myobj, function (err, result) {
                            if (err) throw err;
                            res.send("Project Posted Successfully");
                            db.close();
                        });
                    }
                });
                db.close();
            }
        });
    });
    /*mysql.fetchData(function (error,results) {
        if(error){
            errors="Unable to process request";
            res.status(400).json(errors);
        }
        else{
            if(results.length > 0){
                projectId = results[0].maxCnt+1;

                var addProject="insert into project (project_id,employer_id,title,description,files, skills, budget, status,avg_bid,project_completion_date) values ('"+projectId+"','"+userID+"','" + req.param("projectName") +"','" + req.param("description") +"','" + req.param("projectFiles") +"','"+ req.param("skills") +"','" + req.param("budget")+"','open','0','"+finDate+"')";
                console.log("insert Query is:"+addProject);
                mysql.fetchData(function (error,results) {
                    if(error){
                        errors="Unable to add project at this time. Please try again in sometime."
                        res.status(400).json({errors});
                    }
                    else{
                        if(results.affectedRows > 0){
                            console.log("inserted"+JSON.stringify(results));

                            res.send("Project Posted Successfully");
                        }
                    }
                },addProject);
            }
        }
    },getProjectId);*/
});


router.get('/userAsFreelancerProjects', function(req, res){
    var list= [];
    let errors = "";
    var data = {
        projectsList: []
    };
    var user_id= req.session.userID;
    //var getProjectList  = "select p.project_id, p.description, u.name, p.employer_id, p.title, p.avg_bid, p.project_completion_date, p.status, p.skills from project p, user u where p.status = '"+"Open"+"'"+ " and p.employer_id <>  "+user_id+" and p.employer_id=u.userId";
    let getProject = {status:'open', employer_id:{$ne : user_id}};

    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("freelancer-273");
        dbo.collection("project").find(getProject).toArray(function(err, results) {
            if (err) throw err;
            if(results.length>0){
                let projectList = results;
                console.log("projlist"+projectList[1].employer_id);
                let getUser = {userId : {$ne : user_id}};
                MongoClient.connect(url, function(err, db) {
                    if (err) throw err;
                    var dbo = db.db("freelancer-273");
                    dbo.collection("user").find({}).toArray(function(err, results) {
                        if (err) throw err;
                        if(results.length>0){
                            console.log("projlist"+JSON.stringify(results));
                            let project = {};
                            for(let i=0;i<projectList.length;i++){
                                for(let j=0;j<results.length;j++){
                                    if(projectList[i].employer_id == results[j].userId){
                                        project = {
                                            project_id: projectList[i].project_id,
                                            description: projectList[i].description,
                                            employer_name : results[j].name,
                                            employer_id: projectList[i].employer_id,
                                            title: projectList[i].title,
                                            avg_bid: projectList[i].avg_bid,
                                            skills:projectList[i].skills,
                                            project_completion_date: projectList[i].project_completion_date,
                                            status: projectList[i].status
                                        }
                                        list.push(project);
                                    }
                                }
                            }
                            data.projectsList = list;
                            res.send(data);
                        }else{
                            errors="Unable to fetch user name";
                            res.status(400).json(errors);
                        }
                        db.close();
                    });
                });
            }else{
                errors="Unable to process your request";
                res.status(400).json(errors);
            }
            db.close();
        });
    });

    /*mysql.fetchData(function(err,results){
        if(err){

        }
        else if(results.length > 0) {
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
    },getProjectList);*/
});


router.get('/getProjectDetails', function(req, res){
    var project_id= Number(req.param("project_id"));
    var isEmployer = false;
    var errors;
    //var getProject="select * from project where project_id="+project_id;
    var getProject={project_id: project_id};
    console.log("Query is:"+JSON.stringify(getProject));
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

    getNumberOfBids(project_id);
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        console.log("we are connected");
        var dbo = db.db("freelancer-273");
        dbo.collection("project").find(getProject).toArray(function(err, results) {
            if (err) throw err;
            if(results.length>0){
            if(req.session.userID == results[0].employer_id){
                isEmployer = true;
            }
            data = {
                isEmployer,
                project_id: results[0].project_id,
                projectName: results[0].title,
                description: results[0].description,
                files: results[0].files,
                skills: results[0].skills,
                budget: results[0].budget,
                averageBid:  results[0].averageBid,
                numberOfBids: nBids,
                employer_id: results[0].employer_id,
                status: results[0].status
            };
            //let getPaymentHistory = {project_id:req.param("project_id")};
            MongoClient.connect(url, function(err, db) {
                if (err) throw err;
                console.log("we are connected");
                let i=0,list=[];
                var dbo = db.db("freelancer-273");
                dbo.collection("payment_history").find(getProject).toArray(function(err, results) {
                    if (err) throw err;
                    if(results.length>0){
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
                    }
                    console.log(results);
                    db.close();
                });
            });
                res.send(data);
            }
            else {
                    errors = "Unable to fetch transaction details.";
                    res.status(400).json(errors);
                }
                console.log(JSON.stringify(results));
                db.close();
            });
            });
    /*console.log("Number of Bids inside project function  : "+nBids);
    mysql.fetchData(function(err,results){
        console.log("result",results);
        if(results.length > 0) {
            console.log("Session: "+req.session.userID);
            console.log("Emp id: "+results[0].employer_id);
            if(req.session.userID == results[0].employer_id){
                isEmployer = true;
            }
            data = {
                isEmployer,
                project_id: results[0].project_id,
                projectName: results[0].title,
                description: results[0].description,
                files: results[0].files,
                skills: results[0].skills,
                budget: results[0].budget,
                averageBid:  results[0].averageBid,
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
    },getProject);*/
});

function getNumberOfBids(project_id){
    //var getBidsCount="select count(*) as numberOfBids from bid b where b.project_id=" +project_id;
    let getBidsCount={"project_id": project_id};
    let bids = 0;
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        console.log("we are connected");
        var dbo = db.db("freelancer-273");
        dbo.collection("project").find(getBidsCount,{avg_bid:1}).toArray(function(err, result) {
            if (err) throw err;
            else if(result.length>0){
                nBids = result[0].avg_bid;
            }
            console.log(result);
            db.close();
            //return bids;
        });
    });
    /*mysql.fetchData(function(err,results){
        if(results.length > 0) {
            nBids = results[0].numberOfBids;
        }
    },getBidsCount);*/
    return bids;
}

router.get('/getBids', function(req, res){
    var list= [];
    var data = {
        bidsList: []
    };
    var project_id= req.param("project_id");
   // var getProjectList="select u.userId, b.project_id,  u.name, b.bid_price, b.period_in_days from user u, bid b
    // where b.userId = u.userId and b.project_id ="+project_id+" order by u.name";

    let getBid = {project_id:Number(project_id)};
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("freelancer-273");
        dbo.collection("bid").find(getBid).toArray(function(err, results) {
            if (err) throw err;
            console.log("********************************************"+JSON.stringify(results));
            if(results.length>0){
                let bidList = results;
                console.log("bidlist"+JSON.stringify(bidList));
                //let getUser = {userId : {$ne : user_id}};
                MongoClient.connect(url, function(err, db) {
                    if (err) throw err;
                    var dbo = db.db("freelancer-273");
                    dbo.collection("user").find({}).toArray(function(err, results) {
                        if (err) throw err;

                        if(results.length>0){
                            console.log("projlist"+JSON.stringify(results));
                            let project = {};
                            for(let i=0;i<bidList.length;i++){
                                for(let j=0;j<results.length;j++){
                                    if(bidList[i].userId == results[j].userId){
                                        project = {
                                            userId : bidList[i].userId,
                                            project_id : bidList[i].project_id,
                                            name: results[j].name,
                                            bid_price: bidList[i].bid_price,
                                            period_in_days: bidList[i].period_in_days
                                        }
                                        list.push(project);
                                    }
                                }
                            }
                            data.bidsList = list;
                            res.send(data);
                        }else{
                            errors="Unable to fetch user name";
                            res.status(400).json(errors);
                        }
                        db.close();
                    });
                });
            }else{
                errors="Unable to process your request";
                res.status(400).json(errors);
            }
            db.close();
        });
    });


    /*mysql.fetchData(function(err,results){
        if (err){

        }else if(results.length > 0) {
            var i = 0;
            while(i<results.length) {
                var project = {
                    userId : results[i].userId,
                    project_id : results[i].project_id,
                    name: results[i].name,
                    bid_price: results[i].bid_price,
                    period_in_days: results[i].period_in_days
                }
                list.push(project);
                i++;
            }
            data.bidsList = list;
            res.send(data);
        }
    },getProjectList);*/
});

router.post('/bidProjectNow', function(req, res){
    getNumberOfBids(req.param("project_id"));
    console.log("bid counttttttttt : "+nBids);
    var bid_id;
    var user_id = req.session.userID;
    //var bidProject="insert into bid(userId,project_id,bid_price,period_in_days) values ('"+user_id+"','"+req.param("project_id")+"','"+req.param("bid_price")+"','"+req.param("period_in_days")+"' )";
    //var bidProject="insert into bid(userId,project_id,bid_price,period_in_days) values ('"+user_id+"','"+req.param("project_id")+"','"+req.param("bid_price")+"','"+req.param("period_in_days")+"' )";
    var errors;

    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("freelancer-273");
        var myobj = { userId:user_id, project_id: req.param("project_id"), bid_price: req.param("bid_price"), period_in_days:req.param("period_in_days") };
        dbo.collection("bid").insertOne(myobj, function(err, result) {
            if (err) throw err;
            console.log(result);
            MongoClient.connect(url, function(err, db) {
                if (err) {
                    errors="Unable to add project at this time."
                    res.status(400).json({errors});
                    throw err
                };
                getNumberOfBids();
                var dbo = db.db("freelancer-273");
                var myquery = { project_id: req.param("project_id")};
                console.log("average bid:"+nBids);
                var newvalues = { $set: {avg_bid: nBids+1} };
                dbo.collection("project").updateOne(myquery, newvalues, function(err, results) {
                    if (err) throw err;
                    console.log("1 document updated");
                    res.send("Bid Done Successfully");
                    db.close();
                });
            });
            db.close();
        });
    });

    /*mysql.fetchData(function (error,results) {
        if(error){
            errors="Unable to process request";
            res.status(400).json(errors);
        }
        else{
            if(results.affectedRows > 0){
                var update_bid_count="update project set avg_bid = avg_bid+1 where project_id = "+req.param("project_id");

                mysql.fetchData(function (error,results) {
                    if(error){
                        errors="Unable to add project at this time."
                        res.status(400).json({errors});
                    }
                    else{
                        if(results.affectedRows > 0){
                            res.send("Bid Done Successfully");
                        }
                    }
                },update_bid_count);
            }
        }
    },bidProject);*/
});

router.get('/userAsEmployer', function(req, res){
    var list= [];
    var data = {
        bList: []
    };
    var d;
    var finDate;
    var user_id= req.session.userID;
    console.log("Request param user ID "+user_id);
    //var getProjectList = "select p.project_id, u.userId, p.title, p.avg_bid, u.name, p.project_completion_date, p.status from project p, user u where u.userId = p.user_id and p.employer_id = "+user_id;
    let getProject = {employer_id : user_id};
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("freelancer-273");
        dbo.collection("project").find(getProject).toArray(function(err, results) {
            if (err) throw err;
            if(results.length>0){
                let projectList = results;
                let getUser = {userId : {$ne : user_id}};
                MongoClient.connect(url, function(err, db) {
                    if (err) throw err;
                    var dbo = db.db("freelancer-273");
                    dbo.collection("user").find({}).toArray(function(err, results) {
                        if (err) throw err;
                        if(results.length>0){
                            console.log("projlist"+JSON.stringify(results));
                            let project = {};
                            for(let i=0;i<projectList.length;i++){
                                for(let j=0;j<results.length;j++){
                                    if(projectList[i].user_id == results[j].userId){
                                        project = {
                                            project_id: projectList[i].project_id,
                                            user_id: projectList[i].user_id,
                                            user_name:results[j].name,
                                            project_name: projectList[i].title,
                                            avg_bid: projectList[i].avg_bid,
                                            project_completion_date: projectList[i].project_completion_date,
                                            status: projectList[i].status
                                        }
                                        list.push(project);
                                    }
                                }
                            }
                            data.bList = list;
                            res.send(data);
                        }else{
                            errors="Unable to fetch user name";
                            res.status(400).json(errors);
                        }
                        db.close();
                    });
                });
            }else{
                errors="Unable to process your request";
                res.status(400).json(errors);
            }
            db.close();
        });
    });


    /*mysql.fetchData(function(err,results){
        if (err){
            res.status(400).json({err});
        }
        else if(results.length > 0) {
            var i = 0;
            while (i < results.length) {
                d = new Date(results[i].project_completion_date);
                console.log("date"+d);
                finDate = d.getMonth()+'-'+d.getDate()+'-'+d.getFullYear();
                var project = {
                    project_id: results[i].project_id,
                    user_id: results[i].user_id,
                    user_name:results[i].name,
                    project_name: results[i].title,
                    avg_bid: results[i].avg_bid,
                    username: results[i].name,
                    project_completion_date: finDate,
                    status: results[i].status
                }
                list.push(project);
                i++;
            }
            data.bList = list;
            res.send(data);
        }
    },getProjectList);*/
});

router.get('/userBidedProjects', function(req, res){
    var list= [];
    var data = {
        bList: []
    };
    var user_id= req.session.userID;

    //var getProjectList = "select p.project_id, u.userId, p.employer_id, p.title, u.name, p.avg_bid, b.bid_price,p.status from bid b,
    // project p, .user u where b.project_id = p.project_id and p.status = '"+"Open"+"' and u.userId = b.userId and b.userId = "+user_id;

    let getBids = {userId : user_id};
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("freelancer-273");
        dbo.collection("bid").find(getBids).toArray(function(err, results) {
            if (err) throw err;
            if(results.length>0){
                let bidsList = results;
                let getUser = {userId : {$ne : user_id}};
                MongoClient.connect(url, function(err, db) {
                    if (err) throw err;
                    var dbo = db.db("freelancer-273");
                    dbo.collection("project").find({}).toArray(function(err, results) {
                        if (err) throw err;
                        if(results.length>0){
                            let projectList = results;
                            MongoClient.connect(url, function(err, db) {
                                if (err) throw err;
                                var dbo = db.db("freelancer-273");
                                dbo.collection("user").find({}).toArray(function(err, results) {
                                    if (err) throw err;
                                    if(results.length>0){
                                        let project = {};
                                        for(let i=0;i<bidsList.length;i++){
                                            for(let j=0;j<projectList.length;j++){
                                                for(let k=0;k<results.length;k++) {
                                                    if (bidsList[i].project_id == projectList[j].project_id && projectList[j].employer_id == results[k].userId) {
                                                        project = {
                                                            project_id: projectList[j].project_id,
                                                            project_name: projectList[j].title,
                                                            user_id: projectList[j].user_id,
                                                            emp_id: projectList[j].employer_id,
                                                            emp_name: results[k].name,
                                                            avg_bid: projectList[j].avg_bid,
                                                            bid_price: bidsList[i].bid_price,
                                                            status: projectList[j].status
                                                        }
                                                        list.push(project);
                                                    }
                                                }
                                            }
                                        }
                                        data.bList = list;
                                        res.send(data);
                                    }else{
                                        errors="Unable to fetch users";
                                        res.status(400).json(errors);
                                    }
                                    db.close();
                                });
                            });
                        }else{
                            errors="Unable to fetch project list";
                            res.status(400).json(errors);
                        }
                        db.close();
                    });
                });
            }else{
                errors="Unable to fetch bids list";
                res.status(400).json(errors);
            }
            db.close();
        });
    });


    /*mysql.fetchData(function(err,results){
        if(err){
            res.status(400).json({err});
        }
        else if(results.length > 0) {
            var i = 0;
            while(i<results.length) {
                var project = {
                    project_id : results[i].project_id,
                    project_name: results[i].title,
                    user_id : results[i].userId,
                    emp_id : results[i].employer_id,
                    emp_name: results[i].name,
                    avg_bid: results[i].avg_bid,
                    bid_price: results[i].bid_price,
                    status: results[i].status
                }
                list.push(project);
                i++;
            }
            data.bList = list;
            res.send(data);
        }
    },getProjectList);*/
});

router.post('/hireFreelancer', function(req, res){
    var userId = req.param("user_id");

    var addFreelancerDetails = {$set: {user_id:req.param("user_id")}};
    var error = "";
    var data = {};
    MongoClient.connect(url, function(err, db) {
        if (err) {
            errors="Unable to process your request"
            res.status(400).json({errors});
            throw err
        };
        var dbo = db.db("freelancer-273");
        var myquery = { project_id: req.param("project_id")};
        dbo.collection("project").updateOne(myquery, addFreelancerDetails, function(err, results) {
            if (err) throw err;
            console.log("1 document updated");
            let details ={};
            details.userId = userId;
            details.project_id = req.param("project_id");
            sendEmailToFreelancer(function(err,results){
                if(err){
                    error = "Unable to process your request";
                    res.status(400).json({error});
                }else{
                    //data.email = results.email;
                    res.send(data);
                }
            },details);
            db.close();
        });
    });


    /*var addFreelancerDetails = "update project set user_id ='" + req.param("user_id") +"' where project_id = "+req.param("project_id");
    mysql.fetchData(function(err,results){
        console.log(JSON.stringify(results));
        if(err){
            error = "Unable to process your request";
            res.status(400).json({error});
        }
        else if(results.affectedRows > 0) {
            data.message = "Freelancer Hired Successfully";
            sendEmailToFreelancer(function(err,results){
                if(err){
                    error = "Unable to process your request";
                    res.status(400).json({error});
                }else{
                    //data.email = results.email;
                    res.send(data);
                }
            },userId);
        }
    },addFreelancerDetails);*/
});

function sendEmailToFreelancer(callback,details){

    var getProject={project_id:details.project_id}, data, errors, project_name="";
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("freelancer-273");
        dbo.collection("project").find(getProject).toArray(function(err, result) {
            if (err) throw err;
            else{
                project_name = result[0].title;
            }
            console.log(result);
            db.close();
        });
    });

    var getEmail={userId:details.userId};
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("freelancer-273");
        dbo.collection("user").find(getEmail).toArray(function(err, result) {
            if (err) throw err;
            else{
                data = {
                    email: result[0].email
                };
                var transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: 'trythings2002@gmail.com',
                        pass: 'Krutika@123'
                    },
                    tls:{ rejectUnauthorized: false}
                });

                var mailOptions = {
                    from: 'trythings2002@gmail.com',
                    to: data.email,
                    subject: 'Your are HIRED.',
                    text: 'Congratulations. You are hired for '+project_name+' project. For more details login to your freelancer account.'
                };
                transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Email sent: ' + info.response);
                    }
                });
                callback(err, result);

            }
            console.log(result);
            db.close();
        });
    });
    /*  var getEmail = "select email from  user where userId='" + userId + "'";
    var error = "";
    var data = {};
    mysql.fetchData(function(err,results){
        console.log(JSON.stringify(results));
        if(err){
            error = "Unable to process your request";
            //return err;
        }
        else if(results.length > 0) {
            data = {
                email: results[0].email
            };
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'trythings2002@gmail.com',
                    pass: 'Krutika@123'
                },
                tls:{ rejectUnauthorized: false}
            });

            var mailOptions = {
                from: 'trythings2002@gmail.com',
                to: data.email,
                subject: 'Sending Email using Node.js',
                text: 'You are Hired...congratulations!!!'
            };
            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });
            callback(err, results);
            //return data;
            //res.send(data);
        }
    },getEmail);*/
}


router.post('/makePayment', function(req, res){
    console.log("bid price",req.param("bid_price"));
    var error = "";
    var errors = "";
    var data = {};
    var updateEmpBal = "update user u set u.balance = u.balance - "+ req.param("bid_price") +" where u.userId = "+req.param("employer_id");

    //1
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("freelancer-273");
        var myquery = { userId:req.param("employer_id")};
        var newvalues = { $inc: { balance: -(req.param("bid_price"))} };
        //var newvalues = { $set: {name: req.param("name"), phone: req.param("phone"), about:req.param("about"), skills:req.param("skills")} };
        dbo.collection("user").updateOne(myquery, newvalues, function(err, result) {
            if (err) throw err;
            else{
                console.log("1 document updated");
                //2
                MongoClient.connect(url, function(err, db) {
                    if (err) throw err;
                    console.log("we are connected");
                    var dbo = db.db("freelancer-273");
                    dbo.collection("payment_history").find().sort({trans_id:-1}).limit(1).toArray(function(err, result) {
                        if (err) throw err;
                        let trans_id = result[0].trans_id;
                        //3
                        MongoClient.connect(url, function(err, db) {
                            if (err) throw err;
                            else {
                                var dbo = db.db("freelancer-273");
                                var myobj = {
                                    trans_id: trans_id+1,
                                    user_id: req.param("employer_id"),
                                    project_id: req.param("project_id"),
                                    payment_type: 'Db',
                                    amount: req.param("bid_price")
                                };
                                dbo.collection("payment_history").insertOne(myobj, function (err, result) {
                                    if (err) {
                                        errors="Unable to deduct payment from employer at this time."
                                        res.status(400).json({errors});
                                        throw err;
                                    }
                                    else{
                                        //4
                                        MongoClient.connect(url, function(err, db) {
                                            if (err) throw err;
                                            var dbo = db.db("freelancer-273");
                                            var myquery = { userId:req.param("user_id") };
                                            var newvalues = { $inc: { balance: +(req.param("bid_price"))} };
                                            dbo.collection("user").updateOne(myquery, newvalues, function(err, result) {
                                                if (err) throw err;
                                                else{
                                                    //5
                                                    MongoClient.connect(url, function(err, db) {
                                                        if (err) throw err;
                                                        var dbo = db.db("freelancer-273");
                                                        dbo.collection("payment_history").find().sort({trans_id:-1}).limit(1).toArray(function(err, result) {
                                                            if (err) throw err;
                                                            else {
                                                                let trans_id = result[0].trans_id;
                                                                //6
                                                                MongoClient.connect(url, function(err, db) {
                                                                    if (err) throw err;
                                                                    else {
                                                                        var dbo = db.db("freelancer-273");
                                                                        var myobj = {
                                                                            trans_id: trans_id+1,
                                                                            user_id: req.param("user_id"),
                                                                            project_id: req.param("project_id"),
                                                                            payment_type: 'Cr',
                                                                            amount: req.param("bid_price")
                                                                        };
                                                                        dbo.collection("payment_history").insertOne(myobj, function (err, result) {
                                                                            if (err) throw err;
                                                                            else{
                                                                                //7
                                                                                MongoClient.connect(url, function(err, db) {
                                                                                    if (err) throw err;
                                                                                    var dbo = db.db("freelancer-273");
                                                                                    var myquery = { project_id:req.param("project_id") };
                                                                                    var newvalues = { $set: {status: 'Closed'} };
                                                                                    dbo.collection("project").updateOne(myquery, newvalues, function(err, result) {
                                                                                        if (err) throw err;
                                                                                        else{
                                                                                            //var getTransactions = "select h.user_id, h.project_id, h.payment_type, h.amount from payment_history h where h.project_id =" + req.param("project_id");
                                                                                            let getList={project_id:req.param("project_id")};
                                                                                            MongoClient.connect(url, function(err, db) {
                                                                                                if (err) throw err;
                                                                                                console.log("we are connected");
                                                                                                var dbo = db.db("freelancer-273");
                                                                                                dbo.collection("payment_history").find(getList).toArray(function(err, results) {
                                                                                                    console.log("*******************************last**************************");
                                                                                                    if (err) throw err;
                                                                                                    else if(results.length>0){
                                                                                                        let i = 0,transaction={}, data = {};
                                                                                                        let list= [];
                                                                                                        while(i<results.length) {
                                                                                                            transaction = {
                                                                                                                user_id: results[i].user_id,
                                                                                                                project_id: results[i].project_id,
                                                                                                                payment_type : results[i].payment_type,
                                                                                                                amount: results[i].amount
                                                                                                            }
                                                                                                            list.push(transaction);
                                                                                                            i++;
                                                                                                        }

                                                                                                        data.transList = list;
                                                                                                        data.message= "Payment done Successfully";
                                                                                                        res.send(data);
                                                                                                    }
                                                                                                    else {
                                                                                                        errors="Unable to process your request.";
                                                                                                        res.status(400).json(errors);
                                                                                                    }
                                                                                                    console.log(result);
                                                                                                    db.close();
                                                                                                });
                                                                                            });
                                                                                        }
                                                                                        db.close();
                                                                                    });
                                                                                });
                                                                            }
                                                                            db.close();
                                                                        });
                                                                    }
                                                                });
                                                                db.close();
                                                            }
                                                        });
                                                    });
                                                }
                                                console.log("1 document updated");
                                                db.close();
                                            });
                                        });

                                    }
                                    db.close();
                                });
                            }
                        });
                        db.close();
                    });
                });
            }
            db.close();
        });
    });



    //1
    /*mysql.fetchData(function (error,results) {
        if(error){
            errors="Unable to process request";
            res.status(400).json(errors);
        }
        else{
            console.log("update Emp balance SQL : :"+updateEmpBal);
            if(results.affectedRows > 0){
                var getTransId="select max(trans_id) as maxCnt from payment_history";
                //2
                mysql.fetchData(function (error,results) {
                    if(error){
                        errors="Unable to process request";
                        res.status(400).json(errors);
                    }
                    else {
                        if (results.length > 0) {
                            var transId = results[0].maxCnt + 1;
                            var update_emp_history = "insert into payment_history (trans_id, user_id, project_id, payment_type, amount) values ( "+ transId + "," +req.param("employer_id") +"," + req.param("project_id")+ "," +"'Db'"+"," +req.param("bid_price")+" )";
                            console.log("SQL insert",update_emp_history);
                            //3
                            mysql.fetchData(function (error,results) {
                                if(error){
                                    errors="Unable to deduct payment from employer at this time."
                                    res.status(400).json({errors});
                                }
                                else{
                                    console.log("update Eupdate_emp_history : :"+update_emp_history);
                                    if(results.affectedRows > 0){
                                        console.log("SQL update" +JSON.stringify(results));
                                        var updateUserBal = "update user u set u.balance = u.balance + "+ req.param("bid_price") +" where u.userId = "+req.param("user_id");
                                        console.log("SQL Update : :"+updateUserBal);
                                        //4
                                        mysql.fetchData(function (error,results) {
                                            if(error){
                                                errors="Unable to add payment at this time."
                                                res.status(400).json({errors});
                                            }
                                            else{
                                                console.log("update updateUserBal : :"+updateUserBal);
                                                if(results.affectedRows > 0){
                                                    console.log("SQL insert" +JSON.stringify(results));
                                                    var getTransId1="select max(trans_id) as maxCnt from payment_history";
                                                    //5
                                                    mysql.fetchData(function (error,results) {
                                                        if (error) {
                                                            errors = "Unable to process request";
                                                            res.status(400).json(errors);
                                                        }
                                                        else {
                                                            if (results.length > 0) {
                                                                var transId1 = results[0].maxCnt + 1;
                                                                var update_emp_history = "insert into payment_history (trans_id, user_id, project_id, payment_type, amount) values ( " + transId1 +","+ req.param("user_id") + "," + req.param("project_id") + "," + "'Cr'" + "," + req.param("bid_price") + " )";
                                                                console.log("SQL insert ", update_emp_history);
                                                                //6
                                                                mysql.fetchData(function (error, results) {
                                                                    if (error) {
                                                                        errors = "Unable to add payment at this time."
                                                                        res.status(400).json({errors});
                                                                    }
                                                                    else {
                                                                        if (results.affectedRows > 0) {
                                                                            console.log("SQL insert ", update_emp_history);
                                                                            console.log("SQL insert" + JSON.stringify(results));

                                                                            var update_project = "update project p set p.status = " + "'Closed'" + " where p.project_id = " + req.param("project_id");
                                                                            console.log("SQL insert ", update_project);
                                                                            //7
                                                                            mysql.fetchData(function (error, results) {
                                                                                if (error) {
                                                                                    errors = "Unable to add payment at this time."
                                                                                    res.status(400).json({errors});
                                                                                }
                                                                                else {
                                                                                    if (results.affectedRows > 0) {
                                                                                        var getTransactions = "select h.user_id, h.project_id, h.payment_type, h.amount from payment_history h where h.project_id =" + req.param("project_id");
                                                                                        console.log("SQL select ", getTransactions);
                                                                                        //8
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
    },updateEmpBal);*/
});


module.exports = router;