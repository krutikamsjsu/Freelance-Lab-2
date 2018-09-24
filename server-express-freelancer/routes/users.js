var express = require('express');
var router = express.Router();
var mysql = require('./mysql');
//var bcrypt = require('bcrypt');
//var salt = bcrypt.genSaltSync(10);

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://admin:admin@ds135399.mlab.com:35399/freelancer-273";

/* GET users listing. */

router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

/*router.post('/signup', function(req, res) {
    var name= req.param("name");
    var email = req.param("email");
    var getUser="select * from user where email='"+req.param("email")+"' and password='" + req.param("password") +"'";

    var userId=0;
    var errors;
    var data={};
    data = {name:name,email:email};

    bcrypt.hash(req.param("password"), salt, function(err, password) {

        if (err) {
            console.log("Error : ", err);
        } else {
            passwordEncpt = password;
        }
    })

    mysql.fetchData(function(err,results){
        if(err){
            errors="Unable to process request";
            res.status(400).json(errors);
        }
        else
        {
            if(results.length > 0){
                errors = "User already registered.";
                res.status(400).json(errors);
            }
            else {
                var getUserId="select max(userId) as maxCnt from user";
                console.log("max Query is:"+getUserId);
                mysql.fetchData(function (error,results) {
                    if(error){
                        errors="Unable to process request"
                        res.status(400).json(errors);
                    }
                    else{
                        if(results.length > 0){
                            userId = results[0].maxCnt+1;

                            var insertUser="insert into user (userId,name,email,password) values ("+userId+",'"+req.param("name")+"','" + req.param("email") +"','" + passwordEncpt+"')";
                            mysql.fetchData(function (error,results) {
                                if(error){
                                    errors="User already registered"
                                    res.status(400).json({errors});
                                }
                                else{
                                    if(results.affectedRows > 0){
                                        res.send(data);
                                    }
                                }
                            },insertUser)
                        }
                    }
                },getUserId);
            }
        }
    },getUser);
});

router.post('/login', function(req, res){
    var getUser="select * from user where email='"+req.param("email")+"' and password='" + req.param("password") +"'";
    console.log("Query is:"+getUser);
    var data={};

    mysql.fetchData(function(err,results){
        if(err){
            throw err;
        }
        else
        {
            console.log(JSON.stringify(results));
            if(results.length > 0){
                console.log("loginData"+JSON.stringify(results));
                bcrypt.compare(req.param("password"), results[0].password, function(err, pswdMatch){
                    if(pswdMatch){
                        data = {
                            name:results[0].name,
                            email:results[0].email_id
                        };
                        req.session.name = results[0].name;
                        req.session.email = results[0].email_id;
                        req.session.userID = results[0].user_id;
                        console.log("valid Login");
                        res.send(data);
                    }
                    else {
                        errors="Incorrect login Credentials. Try again.";
                        console.log("Login unsuccessful");
                        res.status(400).json(errors);
                    }
                });
            }
            else {
                errors="Invalid login Credentials.Try again";
                console.log("Login unsuccessful");
                res.status(400).json(errors);
            }
        }
    },getUser);
});*/

router.post('/signup', function(req, res) {
    var name= req.param("name");
    var email = req.param("email");
    var errors;
    var data={};
    data = {name:name,email:email};
    var getUser={email:req.param("email")};
    /*mysql.fetchData(function(err,results){
        if(err){
            errors="Unable to process request";
            res.status(400).json(errors);
        }
        else
        {
            if(results.length > 0){
                errors = "User already registered.";
                res.status(400).json(errors);
            }
            else {
                var getUserId="select max(userId) as maxCnt from user";
                console.log("max Query is:"+getUserId);
                mysql.fetchData(function (error,results) {
                    if(error){
                        errors="Unable to process request"
                        res.status(400).json(errors);
                    }
                    else{
                        if(results.length > 0){
                            userId = results[0].maxCnt+1;

                            var setUser="insert into user (userId,name,email,password) values ("+userId+",'"+req.param("name")+"','" + req.param("email") +"','" + req.param("password")+"')";
                            console.log("insert Query is:"+setUser);
                            mysql.fetchData(function (error,results) {
                                if(error){
                                    errors="User already registered"
                                    res.status(400).json({errors});
                                }
                                else{
                                    if(results.affectedRows > 0){
                                        console.log("inserted"+JSON.stringify(results));

                                        //data = {name:results[0].name,email:results[0].email};
                                        res.send(data);
                                    }
                                }
                            },setUser)
                        }
                    }
                },getUserId);
            }
        }
    },getUser);*/
    var userId = 0;
    /*MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        console.log("we are connected");
        var dbo = db.db("freelancer-273");
        dbo.collection("user").find().sort({userId:-1}).limit(1).toArray(function(err, result) {
            if (err) throw err;
            let userId = result[0].userId;
            console.log("user id : "+userId);
            db.close();
        });
    });*/

    console.log("user id : "+userId);

    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        console.log("we are connected");
        var dbo = db.db("freelancer-273");

        dbo.collection("user").find(getUser).toArray(function(err, result) {
            if(result.length>0){
                errors="User already Registered";
                res.status(400).json(errors);
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
                                        name: req.param("name"),
                                        email: req.param("email"),
                                        password: req.param("password")
                                    };
                                    dbo.collection("user").insertOne(myobj, function (err, result) {
                                        if (err) throw err;
                                        res.send(data);
                                        db.close();
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
});


router.post('/login', function(req, res){
    /*var getUser="select * from user where email='"+req.param("email")+"' and password='" + req.param("password") +"'";
    console.log("Query is:"+getUser);
    var data={},errors;

    mysql.fetchData(function(err,results){
        if(err){
            throw err;
        }
        else
        {
            console.log(JSON.stringify(results));
            if(results.length > 0){
                data = {
                    name:results[0].name,
                    email:results[0].email
                };
                req.session.name = results[0].name;
                req.session.email = results[0].email;
                req.session.userID = results[0].userId;
                console.log("valid Login");
                res.send(data);
            }
            else {
                errors="Invalid login Credentials.Try again";
                console.log("Login unsuccessful");
                res.status(400).json(errors);
            }
        }
    },getUser);*/

    var getUser={email:req.param("email"), password:req.param("password")}, data, errors;

    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        console.log("we are connected");
        var dbo = db.db("freelancer-273");
        dbo.collection("user").find(getUser).toArray(function(err, result) {
            if (err) throw err;
            else if(result.length>0){
                data = {
                    name:result[0].name,
                    email:result[0].email
                };
                req.session.name = result[0].name;
                req.session.email = result[0].email;
                req.session.userID = result[0].userId;
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

});


router.get('/getUserData', function(req, res){
    console.log(req.session.name);
    var errors = "";
    var getUser;
    if(req.param("user_id")!=undefined && req.param("user_id")!==''){
        getUser={userId:Number(req.param("user_id"))};
    }
    else if(req.session.email !== undefined && req.session.email !== '') {
        getUser={email:req.session.email};
    }
    console.log("getUser"+getUser);
    if(getUser!==undefined && getUser!==''){
        //var getUser = "select * from user where email='" + id + "'";// and password='" + req.param("password") +"'";
        //console.log("Query is:" + getUser);
        var data = {};

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
                    res.send(data);
                }
                else {
                    errors = "Please Login";
                    res.status(400).json(errors);
                }
                console.log(result);
                db.close();
            });
        });



        /*mysql.fetchData(function (err, results) {
            if (err) {
                throw err;
            }
            else {
                if (results.length > 0) {
                    data = {
                        name: results[0].name,
                        email: results[0].email,
                        skills: results[0].skills,
                        about: results[0].about,
                        phone: results[0].phone,
                        profileImage: results[0].profile_image

                    };
                    res.send(data);
                }
                else {
                    errors = "Please Login";
                    res.status(400).json(errors);
                }
            }
        }, getUser);*/
    }
    else{
        errors = "Please Login";
        res.status(400).json(errors);
    }
});

router.post('/updateUserData', function(req, res){

   // var updateUser="update user set name='"+req.param("name")+"', phone='" + req.param("phone") +"', about='"+ req.param("about")+"', skills='"+req.param("skills")+"', profile_image='"+req.param("profileImage")+"' where email='"+req.param("email")+"'";
    
    var data={};


    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("freelancer-273");
        var myquery = { email:req.session.email };
        var newvalues = { $set: {name: req.param("name"), phone: req.param("phone"), about:req.param("about"), skills:req.param("skills")} };
        dbo.collection("user").updateOne(myquery, newvalues, function(err, res) {
            if (err) throw err;
            console.log("1 document updated");
            db.close();
        });
    });


    /*mysql.fetchData(function(err,results){
        if(err){
            throw err;
        }
        else
        {
            console.log(JSON.stringify(results));
            if(results.affectedRows > 0){
                var getUser="select * from user where email='" + req.param("email") + "'";
                console.log("Query is:"+getUser);

                mysql.fetchData(function(err,results){
                    if(err){
                        throw err;
                    }
                    else
                    {
                        console.log(JSON.stringify(results));
                        //window.URL.createObjectURL(new Blob(nextProps.userData.data.profileImage, {type: "application/zip"}))
                        //var profile_url =  window.URL.createObjectURL(results[0].profile_image);
                        //console.log("profile_url"+profile_url);
                        if (results.length > 0) {
                            data = {
                                name: results[0].name,
                                phone: results[0].phone,
                                skills: results[0].skills,
                                about: results[0].about,
                                email:results[0].email,
                                profileImage: results[0].profile_image
                            };
                            res.send(data);
                        }
                        else {
                            errors="Cant update this data";
                            console.log("Login unsuccessful");
                            res.status(400).json(errors);
                        }
                    }
                },getUser);
            }
            else {
                errors="Cant update this data";
                console.log("Login unsuccessful");
                res.status(400).json(errors);
            }
        }
    },updateUser);*/
});



router.get('/logout', function(req, res){
    console.log("email:------  "+ req.session.email);
    req.session.destroy();
    var logoutStat = {};
    logoutStat.logout = true;
    res.send(logoutStat);
});

router.get('/checkSession', function(req, res){
    console.log("Session Email: --"+req.session.email);
    var sessionStat = {};
    if(req.session.email !== undefined && req.session.email !== '') {
        sessionStat.sessionActive = true;
    }else{
        sessionStat.sessionActive = false;
    }
    res.send(sessionStat);
});

router.get('/balance', function(req, res){
    console.log("inside balance",req.session.userID);
    //var getBal="select u.balance from user u where userId= "+req.session.userID;
    var userBalance = "";

    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("freelancer-273");
        var getBal={userId:req.session.userID};
        dbo.collection("user").find(getBal,{balance:1}).toArray(function(err, result) {
            if (err) throw err;
           else{
                userBalance = ""+result[0].balance;
                res.send(userBalance);
            }
            db.close();
        });
    });

    /*mysql.fetchData(function(err,results){
        if(err){
            throw err;
        }
        else
        {
            console.log(JSON.stringify(results));
            if(results.length > 0) {
                balance = results[0].balance;
                userBalance = ""+balance;
                res.send(userBalance);

            }else{
                console.log("Transaction unsuccessful, please try again");
                res.status(400).json(errors);
            }
        }
    },getBal);*/
});

router.get('/transactionList', function(req, res){
    //var getList="select h.payment_type, h.amount from payment_history h where h.user_id = "+req.session.userID;
    let getList={user_id:req.session.userID}, errors="";
    console.log("Query is:"+getList);
    var transactionList=[];

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
                res.send(transactionList);
            }
            else {
                errors="Unable to process your request.";
                res.status(400).json(errors);
            }
            console.log(result);
            db.close();
        });
    });


    /*mysql.fetchData(function(err,results){
        if(err){
            throw err;
        }
        else
        {
            console.log(JSON.stringify(results));
            if(results.length > 0){
                var i = 0;
                while(i<results.length) {
                    var transaction = {
                        payment_type: results[i].payment_type,
                        amount: results[i].amount
                    }
                    transactionList.push(transaction);
                    i++;
                }
                res.send(transactionList);
            }
            else {
                console.log("Transaction unsuccessful, please try again");
                res.status(400).json(errors);
            }
        }
    },getList);*/
});

router.post('/addMoney', function(req, res){
    var error = "";
    var data = {};
    var updateBal = "update user u set u.balance = u.balance + "+ req.param("money") +" where u.userId = "+req.session.userID;
    var errors;


    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("freelancer-273");
        var myquery = { userId:req.session.userID };
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
                                        user_id: req.session.userID,
                                        project_id : null,
                                        payment_type: 'Cr',
                                        amount: req.param("money")
                                    };
                                    dbo.collection("payment_history").insertOne(myobj, function (err, result) {
                                        if (err) {
                                            errors = "Unable to add money at this time."
                                            res.status(400).json({errors});
                                        }
                                        console.log("add payment: "+result);
                                        var message = "Balance updated successfully"
                                        res.send(message);
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


    /*mysql.fetchData(function (error,results) {
        if(error){
            errors="Unable to process request";
            res.status(400).json(errors);
        }
        else{
            console.log("update Emp balance SQL : :"+updateBal);
            var getTransId1="select max(trans_id) as maxCnt from payment_history";
            mysql.fetchData(function (error,results) {
                if (error) {
                    errors = "Unable to process request";
                    res.status(400).json(errors);
                }
                else {
                    if (results.length > 0) {
                        var transId1 = results[0].maxCnt + 1;
                        var update_history = "insert into payment_history (trans_id, user_id, project_id, payment_type, amount) values ( " + transId1+ "," +req.session.userID + "," + null +","+ "'Cr'" + "," + req.param("money") + " )";
                        console.log("SQL insert", update_history);
                        mysql.fetchData(function (error, results) {
                            if (error) {
                                errors = "Unable to add money at this time."
                                res.status(400).json({errors});
                            }
                            else {
                                var message = "Balance updated successfully"
                                res.send(message);
                            }
                        }, update_history);
                    }
                }
            },getTransId1);
        }
    },updateBal);*/
});

router.post('/withdrawMoney', function(req, res){
    var error = "";
    var data = {};

    var updateBal = "update user u set u.balance = u.balance - "+ req.param("money") +" where u.userId = "+req.session.userID;
    var errors;

    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("freelancer-273");
        var myquery = { userId:req.session.userID };
        var newvalues = { $inc: { balance: -(req.param("money"))} };
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
                                        user_id: req.session.userID,
                                        project_id : null,
                                        payment_type: 'Db',
                                        amount: req.param("money")
                                    };
                                    dbo.collection("payment_history").insertOne(myobj, function (err, result) {
                                        if (err) {
                                            errors = "Unable to add money at this time."
                                            res.status(400).json({errors});
                                        }
                                        console.log("add payment: "+result);
                                        var message = "Balance updated successfully"
                                        res.send(message);
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

    /*mysql.fetchData(function (error,results) {
        if(error){
            errors="Unable to process request";
            res.status(400).json(errors);
        }
        else{
            console.log("update Emp balance SQL : :"+updateBal);
            var getTransId1="select max(trans_id) as maxCnt from payment_history";
            mysql.fetchData(function (error,results) {
                if (error) {
                    errors = "Unable to process request";
                    res.status(400).json(errors);
                }
                else {
                    if (results.length > 0) {
                        var transId1 = results[0].maxCnt + 1;
                        var update_history = "insert into payment_history (trans_id, user_id, project_id, payment_type, amount) values ( " + transId1 +","+ req.session.userID + "," + null +","+"'Db'" + "," + req.param("money") + " )";
                        console.log("SQL insert", update_history);
                        mysql.fetchData(function (error, results) {
                            if (error) {
                                errors = "Unable to withdraw money at this time."
                                res.status(400).json({errors});
                            }
                            else {
                                var message = "Balance updated successfully"
                                res.send(message);
                            }
                        }, update_history);
                    }
                }
            },getTransId1);
        }
    },updateBal);*/
});


module.exports = router;
