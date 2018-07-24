var mongoose = require('mongoose');
mongoose.Promise = Promise;

var dbUtil = require('./dbUtil');
var User = dbUtil.getModel('User');
var Message = dbUtil.getModel('Message');
var Status = dbUtil.getModel('Status');
var Location = dbUtil.getModel('Location');
var Announcement = dbUtil.getModel('Announcement');
var Supply = dbUtil.getModel('Supply');
var Incident = dbUtil.getModel('Incident');
var IncidentAnswer = dbUtil.getModel('IncidentAnswer');
var UserMedical = dbUtil.getModel('UserMedical');
var UserPersonal = dbUtil.getModel('UserPersonal');
var Hospital = dbUtil.getModel('Hospital');
var Situation = dbUtil.getModel('Situation');
var UserEmergencyContact = dbUtil.getModel('UserEmergencyContact');
var Util = dbUtil.getModel('Util');
var Vehicle = dbUtil.getModel('Vehicle');

function setup(done) {
  mongoose.connect(process.env.DB_PATH || 'mongodb://127.0.0.1:27017/esn_test',
    {useMongoClient:true});
  const db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error'));
  db.once('open', () => {
    Situation.ensureIndexes()
    .then(() => {
      Vehicle.ensureIndexes()
      .then(() => {
        done();
      });
    });
  });
}

function teardown(done) {
  mongoose.connection.db.dropDatabase(() => {
    mongoose.connection.close(done);
  });
}

module.exports = { setup, teardown, dbUtil };
