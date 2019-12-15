var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index')
var photonRouter = require('./routes/photon');
var usersRouter = require('./routes/users');
var devicesRouter = require('./routes/devices');
var activityRouter = require('./routes/activity');
var app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug')

var hostname = 'whatanutcase.com';

// This is to enable cross-origin access
app.use(function (req, res, next) {
	if(req.protocol === 'http') {
     res.redirect(301, `https://${req.headers.host}${req.url}`);
	}
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    // Pass to next layer of middleware
    next();
});

app.use(logger('dev'))
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}));


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/devices', devicesRouter);
app.use('/photon', photonRouter);
app.use('/activity', activityRouter);

// catch 404 and forward to error handler
// app.use(function (req, res, next) {
//     next(createError(404));
// });

// error handler
app.use(function (err, req, res, next) {
    if (err){
      console.log("Error", err);
    }
    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
