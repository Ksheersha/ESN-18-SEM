var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = Schema({  // according to Models on https://app.swaggerhub.com/apis/TheRkZai/ESN/1.0
  name: {type: String, required: true},
  quantity: {type: String, required: true},
  location: {type: String, required: true},
  description: {type: String, required: false},
  timestamp: {type: Date, required: true},
  ownerId: {type: String, required: true},
  requesterId: {type: String, required: false}
});