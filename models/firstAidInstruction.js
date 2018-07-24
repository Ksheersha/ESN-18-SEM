let mongoose = require('mongoose');
let Schema = mongoose.Schema;

module.exports = Schema({
  category: {type: String,required: true},
  content: {type: String,required: true},
});
