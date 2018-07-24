var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var UserSchema = require('./user');

var UserEmergencyContactSchema = Schema({  // according to Models on https://app.swaggerhub.com/apis/TheRkZai/ESN/1.0
  name: {type: String},
  phoneNumber: {type: String},
  email: {type: String}
});

module.exports = UserEmergencyContactSchema;