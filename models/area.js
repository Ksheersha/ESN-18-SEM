var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AreaSchema = Schema({
  name: {type: String, required: true}
}); 

module.exports = AreaSchema;
