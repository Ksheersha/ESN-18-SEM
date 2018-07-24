var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = Schema({
  username: {type: String, required: true},
  content: {type: String, required: true},
  status: {type: String, required: true},
  timestamp: {type: Date, required: false}
});
