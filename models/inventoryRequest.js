let mongoose = require('mongoose');
let Schema = mongoose.Schema;

const Status = {
  REQUESTED: 'requested',
  READY: 'ready',
  PICKED_UP: 'picked-up',
  ON_TRUCK: 'on-truck'
};

class InvalidArguments extends Error {}
class RequestExisted extends Error {}

const InventoryRequestError = {
  InvalidArguments,
  RequestExisted
};

let InventoryRequestSchema = Schema({
  displayId: {type: String, required: true},
  truck: {type: Schema.Types.ObjectId, ref: 'Vehicle', required: true},
  hospital: {type: Schema.Types.ObjectId, ref: 'Hospital', required: true},
  createdAt: {type: Date, default: Date.now, required: true},
  updatedAt: {type: Date, default: Date.now, required: true},
  status: {
    type: String,
    enum: Object.values(Status),
    default: Status.REQUESTED,
    required: true
  },
  // Request items.
  bandageCount: {type: Number, default: 0, required: true},
  antibioticsCount: {type: Number, default: 0, required: true},
  painKillerCount: {type: Number, default: 0, required: true},
  ointmentCount: {type: Number, default: 0, required: true},
  aspirinCount: {type: Number, default: 0, required: true},
  coldCompressCount: {type: Number, default: 0, required: true},
  sanitizerCount: {type: Number, default: 0, required: true}
});

InventoryRequestSchema.statics.Status = Status;
InventoryRequestSchema.statics.Error = InventoryRequestError;

module.exports = InventoryRequestSchema;
