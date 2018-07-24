let mongoose = require('mongoose');
let Schema = mongoose.Schema;

module.exports = Schema({ // according to Models on https://app.swaggerhub.com/apis/TheRkZai/ESN/1.0
  bandageCurrentCount: {type: Number, required: true},
  bandageExpectedCount: {type: Number, required: true},
  antibioticsCurrentCount: {type: Number, required: true},
  antibioticsExpectedCount: {type: Number, required: true},
  painKillerCurrentCount: {type: Number, required: true},
  painKillerExpectedCount: {type: Number, required: true},
  ointmentCurrentCount: {type: Number, required: true},
  ointmentExpectedCount: {type: Number, required: true},
  aspirinCurrentCount: {type: Number, required: true},
  aspirinExpectedCount: {type: Number, required: true},
  coldCompressCurrentCount: {type: Number, required: true},
  coldCompressExpectedCount: {type: Number, required: true},
  sanitizerCurrentCount: {type: Number, required: true},
  sanitizerExpectedCount: {type: Number, required: true}
});
