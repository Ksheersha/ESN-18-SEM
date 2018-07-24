let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let statusSchema = require('./status');
const roleType = {
  CITIZEN: 'Citizen',
  ADMINISTRATOR: 'Administrator',
  DISPATCHER: 'Dispatcher',
  POLICE_CHIEF: 'PoliceChief',
  PATROL_OFFICER: 'PatrolOfficer',
  FIRE_CHIEF: 'FireChief',
  FIREFIGHTER: 'Firefighter',
  PARAMEDIC: 'Paramedic',
  NURSE: 'Nurse'
};

let UserSchema = Schema({ // according to Models on https://app.swaggerhub.com/apis/TheRkZai/ESN/1.0z
  username: {type: String, required: true},
  password: {type: String, required: true},
  isOnline: {type: Boolean, default: false},
  role: {type: String, default: roleType.CITIZEN},
  isCoordinator: {type: Boolean, default: false},
  // whether the account is active or not, default is active
  isActive: {type: Boolean, default: true},
  status: statusSchema,
  location: {
    type: {type: String, default: 'Point'},
    coordinates: {type: [Number], default: [0, 0], index: '2dsphere'}
  },
  phoneNumber: {type: String, required: false},
  personalInfo: {type: Schema.Types.ObjectId, ref: 'UserPersonal'},
  medicalInfo: {type: Schema.Types.ObjectId, ref: 'UserMedical'},
  emergencyContacts: [{type: Schema.Types.ObjectId, ref: 'UserEmergencyContact'}],
  lastLogout: {type: Date}
});

UserSchema.statics.roleType = roleType;

module.exports = UserSchema;
