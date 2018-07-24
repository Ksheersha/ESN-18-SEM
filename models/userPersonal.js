var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var UserSchema = require('./user');

const sexEnum = {UNDEFINED: 0, MALE: 1, FEMALE: 2, OTHER: 3};

var UserPersonalSchema = Schema({  // according to Models on https://app.swaggerhub.com/apis/TheRkZai/ESN/1.0
  name: {type: String},
  dob: {type: Date},
  sex: {type: Number, default: sexEnum.OTHER},
  address: {type: String},
  phoneNumber: {type: String},
  email: {type: String}
});

UserPersonalSchema.statics.sex = sexEnum;

module.exports = UserPersonalSchema;