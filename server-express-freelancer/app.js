var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var cors = require('cors');
var LocalStrategy = require("passport-local").Strategy;
var kafka = require('./routes/kafka/client');

var mongoSessionURL = "mongodb://admin:admin@ds135399.mlab.com:35399/freelancer-273";
var session = require('express-session');
var mongoStore = require("connect-mongo")(session);

var index = require('./routes/index');
var users = require('./routes/users');
var project = require('./routes/project');

var app = express();
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(cors());
app.use(session({
    cookieName: 'session',
    secret: 'gfashdyjagfakshdiyawehbayegqkwueyakjsbdmjas',
    duration: 30 * 60 * 1000,    //setting the time for active session
    activeDuration: 5 * 60 * 1000,
    resave: false,
    saveUninitialized:true,
    store: new mongoStore({
        url: mongoSessionURL
    })}));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(passport.initialize());
app.use(passport.session());
app.use('/', routes);
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/*app.use('/', index);
app.use('/users', users);
app.use('/project', project);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});*/

passport.use('login', new LocalStrategy({usernameField: 'email',passwordField: 'password'},function(username , password, done) {
    console.log('in passport');
    kafka.make_request('request_topic',"login",{"username":username,"password":password}, function(err,results){
        console.log('in result');
        console.log(results);
        if(err){
            done(err,{});
        }
        else
        {
            if(results.code == 200){
                done(null,{username:results.data.email,password:results.data.password,userId:results.data.userId});
            }
            else {
                done(null,false);
            }
        }
    });
}));

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

app.post('/login', function(req, res) {
    console.log("inside login");
    console.log("passport var",passport);
    passport.authenticate('login', function(err, user) {
        if(err) {
            res.status(500).send();
        }

        if(!user) {
            res.status(401).send();
        }
        req.session.userID = user.userId;
        req.session.email = user.username;
        console.log(req.session.user);
        console.log("session initialised");
        return res.status(201).send({username:user.username});
    })(req, res);
});


app.post('/signup', function(req, res) {
    kafka.make_request('request_topic',"signup",{"name":req.param("name"), "email":req.param("email"),"password":req.param("password")}, function(err,results){
        console.log('in result');
        console.log(results);
        if(err){
            done(err,{});
        }
        else
        {
            if(results.code == 200){
                console("response from kafka backend",results);
                return res.status(200).json(results.value);
            }
            else {
                res.status(400).send({
                    success: false,
                    message: 'Unable to process your request. Please try again.'
                });
            }
        }
    });
});

app.get('/getUserData', function(req, res) {
    kafka.make_request('request_topic',"getUserData",{email:req.session.email}, function(err,results){
        console.log('in result');
        console.log(results);
        if(err){
            done(err,{});
        }
        else
        {
            if(results.code == 200){
                return res.status(200).json(results.value);
            }
            else {
                res.status(400).send({
                    success: false,
                    message: 'Unable to process your request. Please try again.'
                });
            }
        }
    });
});

app.post('/updateUserData', function(req, res) {
    kafka.make_request('request_topic',"updateUserData",{"name":req.param("name"), "phone":req.param("phone"), "about":req.param("about"), "skills":req.param("skills"), "profileImage":	req.param("profileImage"), "email":req.param("email")}, function(err,results){
        console.log('in result');
        console.log(results);
        if(err){
            done(err,{});
        }
        else
        {
            if(results.code == 200){
                return res.status(200).json(results.value);
            }
            else {
                res.status(400).send({
                    success: false,
                    message: 'Unable to process your request. Please try again.'
                });
            }
        }
    });
});

app.get('/logout', function(req, res) {
    req.session.destroy();
    var logoutStat = {};
    logoutStat.logout = true;
    res.send(logoutStat);
});

app.get('/checkSession', function(req, res){
    console.log("Session Email: "+req.session.email);
    var sessionStat = {};
    if(req.session.email !== undefined && req.session.email !== '') {
        sessionStat.sessionActive = true;
    }else{
        sessionStat.sessionActive = false;
    }
    res.send(sessionStat);
});

app.get('/balance', function(req, res) {
    kafka.make_request('request_topic',"balance",{userId:req.session.userID}, function(err,results){
        console.log('in result');
        console.log(results);
        if(err){
            done(err,{});
        }
        else
        {
            if(results.code == 200){
                return res.status(200).json(results.value);
            }
            else {
                res.status(400).send({
                    success: false,
                    message: 'Unable to process your request. Please try again.'
                });
            }
        }
    });
});

app.get('/getTransactionList', function(req, res) {
    kafka.make_request('request_topic',"getTransactionList",{userId:req.session.userID}, function(err,results){
        console.log('in result');
        console.log(results);
        if(err){
            done(err,{});
        }
        else
        {
            if(results.code == 200){
                return res.status(200).json(results.value);
            }
            else {
                res.status(400).send({
                    success: false,
                    message: 'Unable to process your request. Please try again.'
                });
            }
        }
    });
});

app.post('/addMoney', function(req, res) {
    kafka.make_request('request_topic',"addMoney",{money:req.param("money"), userId:req.session.userID}, function(err,results){
        console.log('in result');
        console.log(results);
        if(err){
            done(err,{});
        }
        else
        {
            if(results.code == 200){
                return res.status(200).json(results.value);
            }
            else {
                res.status(400).send({
                    success: false,
                    message: 'Unable to process your request. Please try again.'
                });
            }
        }
    });
});

app.post('/withdrawMoney', function(req, res) {
    kafka.make_request('request_topic',"withdrawMoney",{money:req.param("money"), userId:req.session.userID}, function(err,results){
        console.log('in result');
        console.log(results);
        if(err){
            done(err,{});
        }
        else
        {
            if(results.code == 200){
                return res.status(200).json(results.value);
            }
            else {
                res.status(400).send({
                    success: false,
                    message: 'Unable to process your request. Please try again.'
                });
            }
        }
    });
});

app.post('/postProject', function(req, res) {
    kafka.make_request('request_topic',"postProject",{"user_id":req.session.userID, "endDate":req.param("endDate"), "projectName":req.param("projectName"), "description":req.param("description"), "projectFiles":req.param("projectFiles"), "skills":req.param("skills"),"budget":req.param("budget")}, function(err,results){
        console.log('in result');
        console.log(results);
        if(err){
            done(err,{});
        }
        else
        {
            if(results.code == 200){
                return res.status(200).json(results.value);
            }
            else {
                res.status(400).send({
                    success: false,
                    message: 'Unable to process your request. Please try again.'
                });
            }
        }
    });
});

app.get('/userAsFreelancerProjects', function(req, res) {
    kafka.make_request('request_topic',"userAsFreelancerProjects",{"user_id":req.session.userID}, function(err,results){
        console.log('in result');
        console.log(results);
        if(err){
            done(err,{});
        }
        else
        {
            if(results.code == 200){
                return res.status(200).json(results.value);
            }
            else {
                res.status(400).send({
                    success: false,
                    message: 'Unable to process your request. Please try again.'
                });
            }
        }
    });
});

app.get('/userAsEmployer', function(req, res) {
    kafka.make_request('request_topic',"userAsEmployer",{"user_id":req.session.userID}, function(err,results){
        console.log('in result');
        console.log(results);
        if(err){
            done(err,{});
        }
        else
        {
            if(results.code == 200){
                return res.status(200).json(results.value);
            }
            else {
                res.status(400).send({
                    success: false,
                    message: 'Unable to process your request. Please try again.'
                });
            }
        }
    });
});

app.get('/getBids', function(req, res) {
    kafka.make_request('request_topic',"getBids",{"userId":req.param("user_id")}, function(err,results){
        console.log('in result');
        console.log(results);
        if(err){
            done(err,{});
        }
        else
        {
            if(results.code == 200){
                return res.status(200).json(results.value);
            }
            else {
                res.status(400).send({
                    success: false,
                    message: 'Unable to process your request. Please try again.'
                });
            }
        }
    });
});

app.post('/bidProjectNow', function(req, res) {
    kafka.make_request('request_topic',"bidProjectNow",{"project_id":project_id,"userId":req.session.userID}, function(err,results){
        console.log('in result');
        console.log(results);
        if(err){
            done(err,{});
        }
        else
        {
            if(results.code == 200){
                return res.status(200).json(results.value);
            }
            else {
                res.status(400).send({
                    success: false,
                    message: 'Unable to process your request. Please try again.'
                });
            }
        }
    });
});

app.get('/getProjectDetails', function(req, res) {
    kafka.make_request('request_topic',"getProjectDetails",{"project_id":req.param("project_id"),"userId":req.session.userID}, function(err,results){
        console.log('in result');
        console.log(results);
        if(err){
            done(err,{});
        }
        else
        {
            if(results.code == 200){
                return res.status(200).json(results.data);
            }
            else {
                res.status(400).send({
                    success: false,
                    message: 'Unable to process your request. Please try again.'
                });
            }
        }
    });
});

app.post('/hireFreelancer', function(req, res) {
    kafka.make_request('request_topic',"hireFreelancer",{"user_id":req.param("user_id"),"project_id":req.param("project_id")}, function(err,results){
        console.log('in result');
        console.log(results);
        if(err){
            done(err,{});
        }
        else
        {
            if(results.code == 200){
                return res.status(200).json(results.value);
            }
            else {
                res.status(400).send({
                    success: false,
                    message: 'Unable to process your request. Please try again.'
                });
            }
        }
    });
});

app.post('/makePaymentToFreelancer', function(req, res) {
    kafka.make_request('request_topic',"makePaymentToFreelancer",{"user_id":req.param("user_id"),"project_id":req.param("project_id"),"bid_price":req.param("bid_price"),"employer_id":req.param("employer_id")}, function(err,results){
        console.log('in result');
        console.log(results);
        if(err){
            done(err,{});
        }
        else
        {
            if(results.code == 200){
                return res.status(200).json(results.value);
            }
            else {
                res.status(400).send({
                    success: false,
                    message: 'Unable to process your request. Please try again.'
                });
            }
        }
    });
});

app.post('/bidProjectNow', function(req, res) {
    let user_id = req.session.userID, project_id = req.param("project_id");
    kafka.make_request('request_topic',"bidProjectNow",{"user_id":user_id,"project_id":project_id}, function(err,results){
        console.log('in result');
        console.log(results);
        if(err){
            done(err,{});
        }
        else
        {
            if(results.code == 200){
                return res.status(200).json(results.value);
            }
            else {
                res.status(400).send({
                    success: false,
                    message: 'Unable to process your request. Please try again.'
                });
            }
        }
    });
});

app.post('/userBidedProjects', function(req, res) {
    let user_id = req.session.userID;
    kafka.make_request('request_topic',"userBidedProjects",{"user_id":user_id}, function(err,results){
        console.log('in result');
        console.log(results);
        if(err){
            done(err,{});
        }
        else
        {
            if(results.code == 200){
                return res.status(200).json(results.data);
            }
            else {
                res.status(400).send({
                    success: false,
                    message: 'Unable to process your request. Please try again.'
                });
            }
        }
    });
});

module.exports = app;
