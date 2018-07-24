var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var userSchema = require('./user');
// TODO - the below lines needs to be uncommented once the group schema has been created
// var GroupSchema = require('./group');

const emergencyTypeEnum = {UNDEFINED: 0, FIRE: 1, MEDICAL: 2, POLICE: 3};
var priorityEnum = { UNDEFINED: ' ', IMMEDIATE: 'E', URGENT: '1', COULDWAIT: '2', DISMISS: '3'};
const incidentStateEnum = {WAITING: 0, TRIAGE: 1, ASSIGNED: 2, CLOSED: 3};

var IncidentSchema = Schema({ // according to Models on https://app.swaggerhub.com/apis/TheRkZai/ESN/1.0
  callerId: {type: Schema.Types.ObjectId, ref: 'User'},
  displayId: {type: String, required: true},
  openingDateTime: {type: Date, required: true},
  closingDateTime: {type: Date},
  state: {type: Number, default: incidentStateEnum.WAITING},
  creatorId: {type: Schema.Types.ObjectId, ref: 'User'},
  commanderId: {type: Schema.Types.ObjectId, ref: 'User'},
  address: {type: String},
  location: {
    latitude: {type: Number},
    longitude: {type: Number}
  },
  emergencyType: {type: Number, default: emergencyTypeEnum.UNDEFINED},
  priority: {type: String, default: priorityEnum.UNDEFINED},
  answerInfo: {type: Schema.Types.ObjectId, ref: 'IncidentAnswer'},
  // TODO - the below lines needs to be uncommented once the group schema has been created
  // groupId: {type: Schema.Types.ObjectId, ref: GroupSchema},
  // TODO - note that the resources might be changed in future sprints based on the functionality
  resources: {type: String},
  patient: {type: Schema.Types.ObjectId, ref: 'Patient'},
  dispatcherGroupId: {type: String},
  responderGroupId: {type: String}
});

IncidentSchema.statics.emergencyType = emergencyTypeEnum;
IncidentSchema.statics.priority = priorityEnum;
IncidentSchema.statics.incidentState = incidentStateEnum;

module.exports = IncidentSchema;
