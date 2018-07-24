var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = Schema({  // according to Models on https://app.swaggerhub.com/apis/TheRkZai/ESN/1.0
  status: {type: String, required: true},
  timestamp: {type: String, required: true}
});
