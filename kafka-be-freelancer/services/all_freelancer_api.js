var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://admin:admin@ds135399.mlab.com:35399/freelancer-273";

var dbArray = [];
var poolSize = 500;
while(poolSize>0){
	mongo.connect("mongodb://admin:admin@ds135399.mlab.com:35399/freelancer-273", function(database) {
		dbArray.push(database);
	});
	poolSize--;
}

function acquireDBInstance(){
	while(dbArray.length==0){}
	return dbArray.pop();
}


function handle_request(msg, callback){
    var res = {};
    if(msg.key=='login') {

            var getUser={email_id:req.param("email"), password:req.param("password")}, data, errors;

            MongoClient.connect(url, function(err, db) {
                if (err) throw err;
                console.log("We are connected");
                var dbo = db.db("freelancer-273");
                dbo.collection("user").find(getUser).toArray(function(err, result) {
                    if (err) throw err;
                    else if(result.length>0){
                        data = {
                            name:result[0].name,
                            email:result[0].email
                        };
                        req.session.name = result[0].name;
                        req.session.email = result[0].email_id;
                        req.session.userID = result[0].user_id;
                        console.log("valid Login");
                        res.send(data);
                    }
                    else {
                        errors="Invalid login Credentials";
                        console.log("Login unsuccessful");
                        res.status(400).json(errors);
                    }
                    console.log(result);
                    db.close();
                });
            });

            res.code = "200";
            res.data = "";
            res.message = "Login Successful";
        }


    else if(msg.key=='signup'){
        var name= msg.value.name;
        var email = msg.value.email;
        var password = msg.value.password;
        var errors;
        var data={};
        data = {name:name,email:email};
        var getUser={email_id:email};

    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        console.log("we are connected");
        var dbo = db.db("freelancer-273");

        dbo.collection("user").find(getUser).toArray(function(err, result) {
            if(result.length>0){
                errors="User already Registered";
                res.code = "401";
                res.value = errors;
            }
            else {
                MongoClient.connect(url, function(err, db) {
                    if (err) throw err;
                    console.log("we are connected");
                    var dbo = db.db("freelancer-273");
                    dbo.collection("user").find().sort({userId:-1}).limit(1).toArray(function(err, result) {
                        if (err) throw err;
                        else {
                            let userId = result[0].userId;
                            console.log("user id : " + userId);
                            MongoClient.connect(url, function(err, db) {
                                if (err) throw err;
                                else {
                                    var dbo = db.db("freelancer-273");
                                    var myobj = {
                                        userId: userId+1,
                                        name: name,
                                        email: email,
                                        password: password
                                    };
                                    dbo.collection("user").insertOne(myobj, function (err, result) {
                                        if(result){
                                        res.code = "200";
                                        res.data = "";
                                        res.message = "SignIn Successful";
                                    }
                                else {
                                        res.code = "401";
                                        res.value = "Please try again.";
                                    }
                                    });
                                }
                            });
                            db.close();
                        }
                    });
                });
            }
            db.close();
        });
    });
        callback(null, res);
    }
    else if(msg.key=='getUserData'){

    getUser={email:msg.value.email};
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        console.log("we are connected");
        var dbo = db.db("freelancer-273");
        dbo.collection("user").find(getUser).toArray(function(err, result) {
            if (err) throw err;
            else if(result.length>0){
                data = {
                    name: result[0].name,
                    email: result[0].email,
                    skills: result[0].skills,
                    about: result[0].about,
                    phone: result[0].phone,
                };
                res.code = "200";
                res.data = data;
                res.value = "Success";
            }
            else {
                errors = "Please Login";
                res.code = "401";
                res.value = errors;
            }
            console.log(result);
            db.close();
        });
    });
    callback(null, res);
    }
    else if(msg.key=='updateUserData'){


    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("freelancer-273");
        var myquery = { email:msg.value.email };
        var newvalues = { $set: {name: msg.value.name, phone: msg.value.phone, about:msg.value.about, skills:msg.value.skills} };
        dbo.collection("user").updateOne(myquery, newvalues, function(err, res) {
            if (err) throw err;
            console.log("1 document updated");
            res.code = "200";
            res.data = "";
            res.value = "Success";
            db.close();
        });
    });
    callback(null, res);
    }
    else if(msg.key=='balance'){
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("freelancer-273");
        var getBal={userId:msg.value.userId};
        dbo.collection("user").find(getBal,{balance:1}).toArray(function(err, result) {
            if (err) throw err;
            else{
                let userBalance = ""+result[0].balance;
                res.code = "200";
                res.data = userBalance;
                res.value = "Success";
            }
            db.close();
        });
    });

        callback(null, res);
    }
    else if(msg.key=='getTransactionList'){
    let transactionList;
    let getList={user_id:msg.value.userId}, errors;
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        console.log("we are connected");
        var dbo = db.db("freelancer-273");
        dbo.collection("payment_history").find(getList).toArray(function(err, result) {
            if (err) throw err;
            else if(result.length>0){
                var i = 0;
                let transaction ={};
                while(i<result.length) {
                    transaction = {
                        payment_type: result[i].payment_type,
                        amount: result[i].amount
                    }
                    transactionList.push(transaction);
                    i++;
                }
                res.code = "200";
                res.data = transactionList;
                res.value = "Success";
            }
            else {
                errors="Unable to process your request.";
                res.code = "401";
                res.value = errors;
            }
            console.log(result);
            db.close();
        });
    });
    callback(null, res);
    }
    else if(msg.key=='addMoney'){
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("freelancer-273");
        var myquery = { userId:msg.value.userId };
        var newvalues = { $inc: { balance: +(req.param("money"))} };
        dbo.collection("user").updateOne(myquery, newvalues, function(err, result) {
            if (err) throw err;
            else {
                MongoClient.connect(url, function (err, db) {
                    if (err) throw err;
                    console.log("we are connected");
                    var dbo = db.db("freelancer-273");
                    dbo.collection("payment_history").find().sort({trans_id: -1}).limit(1).toArray(function (err, result) {
                        if (err) throw err;
                        else {
                            let trans_id = result[0].trans_id;
                            MongoClient.connect(url, function(err, db) {
                                if (err) throw err;
                                else {
                                    var dbo = db.db("freelancer-273");
                                    var myobj = {
                                        trans_id: trans_id+1,
                                        user_id: msg.value.userId,
                                        project_id : null,
                                        payment_type: 'Cr',
                                        amount: req.param("money")
                                    };
                                    dbo.collection("payment_history").insertOne(myobj, function (err, result) {
                                        if (err) {
                                            errors = "Unable to add money at this time."
                                            res.code = "401";
                                            res.value = errors;
                                        }
                                        console.log("add payment: "+result);
                                        var message = "Balance updated successfully"
                                        res.code = "200";
                                        res.data = "";
                                        res.value = "Success";
                                        db.close();
                                    });
                                }
                            });
                        }
                        db.close();
                    });
                });
            }
            db.close();
        });
    });
    callback(null, res);
    }
    else if(msg.key=='withdrawMoney'){
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("freelancer-273");
        var myquery = { userId:msg.value.userId };
        var newvalues = { $inc: { balance: -(msg.value.money)} };
        dbo.collection("user").updateOne(myquery, newvalues, function(err, result) {
            if (err) throw err;
            else {
                MongoClient.connect(url, function (err, db) {
                    if (err) throw err;
                    console.log("we are connected");
                    var dbo = db.db("freelancer-273");
                    dbo.collection("payment_history").find().sort({trans_id: -1}).limit(1).toArray(function (err, result) {
                        if (err) throw err;
                        else {
                            let trans_id = result[0].trans_id;
                            MongoClient.connect(url, function(err, db) {
                                if (err) throw err;
                                else {
                                    var dbo = db.db("freelancer-273");
                                    var myobj = {
                                        trans_id: trans_id+1,
                                        user_id: msg.value.userId,
                                        project_id : null,
                                        payment_type: 'Db',
                                        amount: msg.value.money
                                    };
                                    dbo.collection("payment_history").insertOne(myobj, function (err, result) {
                                        if (err) {
                                            let errors = "Unable to add money at this time."
                                            res.code = "401";
                                            res.value = errors;
                                        }
                                        console.log("add payment: "+result);
                                        var message = "Balance updated successfully"

                                        res.code = "200";
                                        res.data = "";
                                        res.value = "Success";
                                        db.close();
                                    });
                                }
                            });
                        }
                        db.close();
                    });
                });
            }
            db.close();
        });
    });

        callback(null, res);
    }
    else if(msg.key=='postProject'){
    var d = new Date(msg.value.endDate);
    var finDate = d.getFullYear()+'-'+d.getMonth()+'-'+d.getDate()+" "+d.getHours()+":"+d.getMinutes()+":"+d.getSeconds();

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
                            user_id:msg.value.userId,
                            title: msg.value.projectName,
                            description: msg.value.description,
                            skills: msg.value.skills,
                            budget: msg.value.budget,
                            status: "open",
                            avg_bid: msg.value.avg_bid,
                            project_completion_date: finDate
                        };
                        dbo.collection("project").insertOne(myobj, function (err, result) {
                            if (err) throw err;
                            res.code = "200";
                            res.data = "Project Posted Successfully";
                            res.value = "Success";
                            db.close();
                        });
                    }
                });
                db.close();
            }
        });
    });


        callback(null, res);
    }
    else if(msg.key=='userAsFreelancerProjects'){
    var user_id= msg.value.userId;
    //var getProjectList  = "select p.project_id, p.description, u.name, p.employer_id, p.title, p.avg_bid, p.project_completion_date, p.status, p.skills from project p, user u where p.status = '"+"Open"+"'"+ " and p.employer_id <>  "+user_id+" and p.employer_id=u.userId";
    let getProject = {status:'open', employer_id:{$ne : user_id}};

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
                            res.code = "200";
                            res.data = data;
                            res.value = "Success";

                        }else{
                            errors="Unable to fetch user name";
                            res.code = "401";
                            res.value = errors;
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

    callback(null, res);
    }
    else if(msg.key=='userAsEmployer'){
        console.log("Inside listOfAllProjectsPostedByEmployer");
    var finDate;
    var user_id= msg.valye.userId;
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
                            res.code = "200";
                            res.data = data;
                            res.value = "Success";

                        }else{
                            errors="Unable to fetch user name";
                            res.code = "401";
                            res.value = errors;
                        }
                        db.close();
                    });
                });
            }else{
                errors="Unable to process your request";
                res.code = "401";
                res.value = errors;
            }
            db.close();
        });
    });


    callback(null, res);
    }
    else if(msg.key=='getBids'){
    let getBids = {userId : msg.value.userId};
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
                                        res.code = "200";
                                        res.data = data;
                                        res.value = "Success";

                                    }else{
                                        errors="Unable to fetch users";
                                        res.code = "401";
                                        res.value = errors;
                                    }
                                    db.close();
                                });
                            });
                        }else{
                            errors="Unable to fetch project list";
                            res.code = "401";
                            res.value = errors;
                        }
                        db.close();
                    });
                });
            }else{
                errors="Unable to fetch bids list";
                res.code = "401";
                res.value = errors;
            }
            db.close();
        });
    });

    callback(null, res);
    }
    else if(msg.key=='bidProjectNow'){
    let nBids = 0;
    var user_id = req.session.userID;
    //var bidProject="insert into bid(userId,project_id,bid_price,period_in_days) values ('"+user_id+"','"+req.param("project_id")+"','"+req.param("bid_price")+"','"+req.param("period_in_days")+"' )";
    //var bidProject="insert into bid(userId,project_id,bid_price,period_in_days) values ('"+user_id+"','"+req.param("project_id")+"','"+req.param("bid_price")+"','"+req.param("period_in_days")+"' )";
    var errors;

    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("freelancer-273");
        var myobj = { userId:msg.value.userId, project_id: msg.value.project_id, bid_price: msg.value.bid_price, period_in_days:msg.value.period_in_days };
        dbo.collection("bid").insertOne(myobj, function(err, result) {
            if (err) throw err;
            console.log(result);
            MongoClient.connect(url, function(err, db) {
                if (err) {
                    errors="Unable to add project at this time."
                    res.code = "401";
                    res.value = errors;
                    throw err
                };
                nBids = getNumberOfBids();
                var dbo = db.db("freelancer-273");
                var myquery = { project_id: msg.value.project_id};
                console.log("average bid:"+nBids);
                var newvalues = { $set: {avg_bid: nBids+1} };
                dbo.collection("project").updateOne(myquery, newvalues, function(err, results) {
                    if (err) throw err;
                    console.log("1 document updated");
                    res.code = "200";
                    res.data = "Bid Done Successfully";
                    res.value = "Success";
                    db.close();
                });
            });
            db.close();
        });
    });
    callback(null, res);
    }
    else if(msg.key=='getProjectDetails'){
        console.log("Inside getProjectDetails");
    var project_id= msg.value.project_id;
    var isEmployer = false;
    var errors;
    //var getProject="select * from project where project_id="+project_id;
    var getProject={project_id: msg.value.project_id};
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
                if(msg.value.userId == results[0].employer_id){
                    isEmployer = true;
                }
                data = {
                    isEmployer:isEmployer,
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


                        }
                        console.log(results);
                        db.close();
                    });
                });
                res.code = "200";
                res.data = data;
                res.value = "Success";
            }
            else {
                errors = "Unable to fetch transaction details.";
                res.code = "401";
                res.value = errors;
            }
            console.log(JSON.stringify(results));
            db.close();
        });
    });
    callback(null, res);
    }
    else if(msg.key=='hireFreelancer'){
    var userId = msg.value.user_id;

    var addFreelancerDetails = {$set: {user_id:msg.value.user_id}};
    var error = "";
    var data = {};
    MongoClient.connect(url, function(err, db) {
        if (err) {
            errors="Unable to process your request"
            res.code = "401";
            res.value = errors;
            throw err
        };
        var dbo = db.db("freelancer-273");
        var myquery = { project_id: msg.value.project_id};
        dbo.collection("project").updateOne(myquery, addFreelancerDetails, function(err, results) {
            if (err) throw err;
            console.log("1 document updated");
            let details ={};
            details.userId = userId;
            details.project_id = msg.value.project_id;
            sendEmailToFreelancer(function(err,results){
                if(err){
                    error = "Unable to process your request";
                    res.code = "401";
                    res.value = error;
                }else{
                    //data.email = results.email;
                    res.code = "200";
                    res.data = "updated";
                    res.value = "Success";
                }
            },details);
            db.close();
        });
    });
    callback(null, res);
    }
    else if(msg.key=='makePaymentToFreelancer'){
        console.log("Inside makePayment");
        res.code = "200";
        res.data = "updated";
        res.value = "Success";
        callback(null, res);
    }
    else if(msg.key=='userBidedProjects'){
        var user_id= msg.value.userId;

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
                                            res.code = "200";
                                            res.data = data;
                                            res.value = "Success";
                                        }else{
                                            errors="Unable to fetch users";
                                            res.code = "401";
                                            res.value = errors;
                                        }
                                        db.close();
                                    });
                                });
                            }else{
                                errors="Unable to fetch project list";
                                res.code = "401";
                                res.value = errors;
                            }
                            db.close();
                        });
                    });
                }else{
                    errors="Unable to fetch bids list";
                    res.code = "401";
                    res.value = errors;
                }
                db.close();
            });
        });

        callback(null, res);
    }
    else if(msg.key==''){
        callback(null, res);
    }
}

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


exports.handle_request = handle_request;