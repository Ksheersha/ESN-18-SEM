let express = require('express');
let path = require('path');
let favicon = require('serve-favicon');
let logger = require('morgan');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
let session = require('express-session');
let users = require('./routes/users');
let map = require('./routes/map');
let join = require('./routes/join');
let homepage = require('./routes/homepage');
let messages = require('./routes/messages');
let announcements = require('./routes/announcements');
let supply = require('./routes/supply');
let userProfile = require('./routes/userProfile');
let hospital = require('./routes/hospitals');
let incidents = require('./routes/incidents');
let logout = require('./routes/logout');
let group = require('./routes/group');
let image = require('./routes/image');
let alert = require('./routes/alertMessage');
let resource = require('./routes/resource');
let patients = require('./routes/patients');
let organization = require('./routes/organization');
let vehicles = require('./routes/vehicles');
let situation = require('./routes/situation');
let dashboard = require('./routes/dashboard');
let inventories = require('./routes/inventories');
let inventoryRequest = require('./routes/inventoryRequest');
let instructions = require('./routes/instructions');
let area = require('./routes/area');

let mongoose = require('mongoose');

// choose mock database or real database
if (process.env.NODE_ENV === 'test') {
  let db = require('./util/mockDB');
} else {
  let db = require('./util/db');
}

let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(bodyParser.json({limit: '50mb'}));
app.use(logger('dev', {
  skip: function (req, res) {
    return process.env.NODE_ENV === 'test';
  }
}));
// Config Session
app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));
app.use(session({
  secret: 'Session',
  resave: false,
  saveUninitialized: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', join);
app.use('/users', users);
app.use('/map', map);
app.use('/messages', messages);
app.use('/homepage', homepage);
app.use('/announcements', announcements);
app.use('/supply', supply);
app.use('/hospitals', hospital);
app.use('/profile', userProfile);
app.use('/incidents', incidents);
app.use('/logout', logout);
app.use('/group', group);
app.use('/image', image);
app.use('/organization', organization);
app.use('/vehicles', vehicles);
app.use('/alert', alert);
app.use('/resource', resource);
app.use('/patients', patients);
app.use('/situations', situation);
app.use('/dashboard', dashboard);
app.use('/inventories/requests', inventoryRequest);
app.use('/inventories', inventories);
app.use('/instructions', instructions);
app.use('/areas', area);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error', err);
});

module.exports = app;
