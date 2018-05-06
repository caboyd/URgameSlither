
var express = require('express');
var path = require('path');
//var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var config = require('./config');

//The .js files
var index = require('./src/app/controllers/index');
var oauth2 = require('./src/app/lib/oauth2');
var cookie = require('./src/app/lib/cookie');
var statsController = require('./src/app/controllers/statsController');
var gameController = require('./src/app/controllers/gameController');

const passport = require('passport');
const session = require('express-session');

const app = express();

//Database
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/cobra');
var db = mongoose.connection;
//Check connection
db.once('open', function () {
    console.log('Connected to MongoDB')
});

//Check for DB errors
db.on('error', function (err) {
    console.log("There's an error with the database. See below for what the error is.");
    console.log(err);
});


//Using express.static middleware to server all public files
//Note: the path that you provide to the express.static f(x) is relative to the directory from where you launch
//your node process. Which is why you used path and dirname
app.use(express.static(path.join(__dirname, 'public')));
// view engine setup
app.set('views', path.join(__dirname, 'src/app/views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

//OAuth20
const sessionConfig = {
    resave: false,
    saveUninitialized: false,
    //secret: "n5QL0atAVhe5rQvZuwmyczX4",
    secret: config.get('SECRET'),
    signed: true
};

app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());


//app.use(cookie.router);
app.use(cookie);
app.use(oauth2.router);
app.use(oauth2.template);


//Routes
app.use('/', index);
app.use('/stats',statsController);
app.use('/game',gameController);



// redirect all other urls to homepage
app.use(function(req, res, next) {
  res.redirect("/");
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
	
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
