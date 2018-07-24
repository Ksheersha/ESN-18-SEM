var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = Schema({  // according to Models on https://app.swaggerhub.com/apis/TheRkZai/ESN/1.0
  uid: {type:String, required: true},
  username: {type: String, required: true},
  content: {type: String, required: true},
  status: {type: String, required: true},
  to: {type: String, required: false},
  timestamp: {type: Date, required: false}
});
