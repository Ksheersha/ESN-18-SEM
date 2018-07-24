let mongoose = require('mongoose');
mongoose.Promise = Promise;

let Schema = mongoose.Schema;
let userSchema = require('../models/user');
let messageSchema = require('../models/message');
let announcementSchema = require('../models/announcement');
let statusSchema = require('../models/status');
let locationSchema = require('../models/location');
let supplySchema = require('../models/supply');
let incidentSchema = require('../models/incident');
let incidentAnswerSchema = require('../models/incidentAnswer');
let userMedical = require('../models/userMedical');
let userPersonal = require('../models/userPersonal');
let userEmergencyContact = require('../models/userEmergencyContact');
let group = require('../models/group');
let Util = require('../models/util');
let image = require('../models/image');
let alert = require('../models/alertMessage');
let hospital = require('../models/hospital');
let patient = require('../models/patient');
let organization = require('../models/organization');
let area = require('../models/area');
let vehicle = require('../models/vehicle');
let situation = require('../models/situation');
let inventoryItemSchema = require('../models/inventoryItem');
let InventoryRequest = require('../models/inventoryRequest');
let firstAid = require('../models/firstAidInstruction');

mongoose.model('User', userSchema); // use Capital to indicate "Class"
mongoose.model('Message', messageSchema);
mongoose.model('Status', statusSchema);
mongoose.model('Location', locationSchema);
mongoose.model('Announcement', announcementSchema);
mongoose.model('Supply', supplySchema);
mongoose.model('Incident', incidentSchema);
mongoose.model('IncidentAnswer', incidentAnswerSchema);
mongoose.model('UserMedical', userMedical);
mongoose.model('UserPersonal', userPersonal);
mongoose.model('UserEmergencyContact', userEmergencyContact);
mongoose.model('Group', group);
mongoose.model('Util', Util);
mongoose.model('Image', image);
mongoose.model('Organization', organization);
mongoose.model('Area', area);
mongoose.model('Vehicle', vehicle);
mongoose.model('Alert', alert);
mongoose.model('Hospital', hospital);
mongoose.model('Patient', patient);
mongoose.model('Situation', situation);
mongoose.model('InventoryItem', inventoryItemSchema);
mongoose.model('InventoryRequest', InventoryRequest);
mongoose.model('FirstAidInstruction',firstAid);

// load default data
let DefaultDataLoader = require('./DefaultDataLoader').DefaultDataLoader;
DefaultDataLoader.loadDefaultGroupsAndUpdateUsers();

module.exports = {
  getModel: function (modelName) {
    return mongoose.model(modelName);
  }
};
