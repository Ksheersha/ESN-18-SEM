var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = Schema({ // according to Models on https://app.swaggerhub.com/apis/TheRkZai/ESN/1.0
  latitude: {type: String, required: true},
  longitude: {type: String, required: true}
});
