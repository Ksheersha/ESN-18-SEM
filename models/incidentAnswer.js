let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let userSchema = require('./user');
let incidentSchema = require('./incident');

let IncidentAnswerSchema = Schema({  // according to Models on https://app.swaggerhub.com/apis/TheRkZai/ESN/1.0
  patient:{type: String},
  sex: {type: String, default: 0},
  citizenAge:{type: String},
  conscient:{type: String},
  smoke:{type: String},
  smokeColor:{type: String},
  smokeQuantity:{type: String},
  breathing:{type: String},
  citizenChiefComplaint:{type: String},
  citizenPatientsProfile:{type: String},
  flame:{type: String},
  fireInjury:{type: String},
  hazardous:{type: String},
  citizenPeople:{type: String},
  getOut:{type: String},
  weapon:{type: String},
  weaponInjury:{type: String},
  citizenSuspectDescription:{type: String},
  suspectLeft:{type: String},
  safe:{type: String},
  citizenCrimeDetail:{type: String}

});

module.exports = IncidentAnswerSchema;
