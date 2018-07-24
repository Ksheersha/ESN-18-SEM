let mongoose = require('mongoose');
let Schema = mongoose.Schema;

const situationStateEnum = {OPEN: 1, CLOSED: 2};

let SituationSchema = Schema({ // according to Models on https://app.swaggerhub.com/apis/TheRkZai/ESN/1.0
  name: { type: String, required: true },
  creatorId: { type: Schema.Types.ObjectId, ref: 'User' },
  address: { type: String },
  affectedRadius: { type: Number },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], default: [0, 0]},
  },
  description: { type: String, required: true },
  specialNotes: { type: String },
  affectedUsers: [ { type: Schema.Types.ObjectId, ref: 'User' } ],
  state:{ type: Number, default: situationStateEnum.OPEN},
  creationTime: { type: Date }
});

SituationSchema.statics.situationState = situationStateEnum;
SituationSchema.index({ location: '2dsphere' });

module.exports = SituationSchema;
