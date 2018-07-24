var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ImageSchema = Schema({  
    content: {type: String, required: true},
});

module.exports = ImageSchema;