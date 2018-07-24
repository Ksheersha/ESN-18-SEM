let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let organizationSchema = Schema({
    chief: {type: Schema.Types.ObjectId, ref: 'User'},
    persons: [{type: Schema.Types.ObjectId, ref: 'User'}],
    areas: [{type: Schema.Types.ObjectId, ref: 'Area'}],
    vehicles: [{type: Schema.Types.ObjectId, ref: 'Vehicle'}]
  },
  {usePushEach: true});

module.exports = organizationSchema;
