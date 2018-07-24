var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var UserSchema = require('./user');

var UserMedicalSchema = Schema({  // according to Models on https://app.swaggerhub.com/apis/TheRkZai/ESN/1.0
  medCondition: {type: String},
  medDrugs: {type: String},
  medAllergies: {type: String}
});

module.exports = UserMedicalSchema;