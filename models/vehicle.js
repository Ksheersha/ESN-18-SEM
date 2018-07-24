let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let vehicleSchema = Schema({
  type: {type: String, enum: ['car', 'truck'], required: true},
  name: {type: String},
  allocated: {
    kind: String,
    to: {type: Schema.Types.ObjectId, refPath: 'allocated.kind'}
  },
  location: {
    type: {type: String, default: 'Point'},
    coordinates: {type: [Number], default: [0, 0], index: '2dsphere'}
  },
  persons: [{type: Schema.Types.ObjectId, ref: 'User'}],
  inventory: {type: Schema.Types.ObjectId, ref: 'InventoryItem'}
});


module.exports = vehicleSchema;
