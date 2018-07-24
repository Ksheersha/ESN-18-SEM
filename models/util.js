const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let UtilSchema = Schema({
  type: {type: String, required: true},
  location: {
    latitude: {type: Number, required: true},
    longitude: {type: Number, required: true}
  },
  note: {type: String, required: false}
});

module.exports = UtilSchema;
