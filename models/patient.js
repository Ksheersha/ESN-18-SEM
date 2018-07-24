let mongoose = require('mongoose');
let Schema = mongoose.Schema;

const Priority = {
  IMMEDIATE: 'E',
  URGENT: '1',
  COULD_WAIT: '2',
  DISMISS: '3',
  DEAD: '4'
};

const BedStatus= {
  REQUESTED: 0,
  READY: 1,
  OCCUPIED: 2
};

const Location = {
  ROAD: 'road',
  EMERGENCY_ROOM: 'ER'
};

const Sex = {
  MALE: 'male',
  FEMALE: 'female',
  OTHER: 'other'
};

const Condition = {
  ALLERGY: 'allergy',
  ASTHMA: 'asthma',
  BLEEDING: 'bleeding',
  BROKEN_BONE: 'broken-bone',
  BURN: 'burn',
  CHOKING: 'choking',
  CONCUSSION: 'concussion',
  HEAR_ATTACK: 'hear-attack',
  HEAT_STROKE: 'heat-stroke',
  HYPOTHERMIA: 'hypothermia',
  POISONING: 'poisoning',
  SEIZURE: 'seizure',
  SHOCK: 'shock',
  STRAIN_SPRAIN: 'strain-sprain',
  STROKE: 'stroke'
};

let PatientSchema = Schema({
  incident: {type: Schema.Types.ObjectId, ref: 'Incident'},
  displayId: {type: String, require: true},
  priority: {type: String, enum: Object.values(Priority), default: Priority.IMMEDIATE, require: true},
  location: {type: String, enum: Object.values(Location), default: Location.ROAD, require: true},
  name: {type: String},
  dob: {type: Date},
  age: {type: Number},
  sex: {type: String, enum: Object.values(Sex)},
  conscious: {type: Boolean},
  breathing: {type: Boolean},
  chiefComplaint: {type: String},
  condition: {type: String, enum: Object.values(Condition)},
  drags: {type: String},
  allergies: {type: String},
  hospital: {type: Schema.Types.ObjectId, ref: 'Hospital'},
  bedStatus: {type: Number, enum: Object.values(BedStatus), default: BedStatus.REQUESTED}
});

PatientSchema.statics.Priority = Priority;
PatientSchema.statics.Location = Location;
PatientSchema.statics.Sex = Sex;
PatientSchema.statics.Condition = Condition;
PatientSchema.statics.BedStatus = BedStatus;
module.exports = PatientSchema;
