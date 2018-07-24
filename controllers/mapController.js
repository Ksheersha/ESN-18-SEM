const dbUtil = require('../util/dbUtil');
const Incident = dbUtil.getModel('Incident');

const HospitalDAO = require('../util/dao/hospitalDAO');
const IncidentDAO = require('../util/dao/incidentDAO');
const IncidentResponderDAO = require('../util/dao/incidentResponderDAO');
const LocationDAO = require('../util/dao/locationDAO').LocationDAO;
const MessageDAO = require('../util/dao/messageDAO').MessageDAO;
const UserDAO = require('../util/dao/userDAO').UserDAO;
const UtilDAO = require('../util/dao/utilDAO');

const PrivilegeUtil = require('../util/privilegeUtil');

const ACCESSIBLE_TYPES = new Map([
  ['Citizen', ['hospital', 'pin']],
  ['Responder', ['block', 'hospital', 'pin']],
  ['Nurse', ['hospital', 'pin']],
  ['Coordinator', ['hospital', 'pin']],
  ['Administrator', ['block', 'hospital', 'pin']]
]);

const EDITABLE_TYPES = new Map([
  ['Citizen', new Set(['pin'])],
  ['Responder', new Set(['block', 'pin'])],
  ['Nurse', new Set(['pin'])],
  ['Coordinator', new Set(['pin'])],
  ['Administrator', new Set(['block', 'pin'])]
]);

function accessibleTypes (role) {
  if (PrivilegeUtil.isResponder(role)) {
    role = 'Responder';
  }
  return ACCESSIBLE_TYPES.get(role) || [];
}

function canEdit (role, type) {
  if (PrivilegeUtil.isResponder(role)) {
    role = 'Responder';
  }
  return EDITABLE_TYPES.has(role) && EDITABLE_TYPES.get(role).has(type);
}

function sortUtilsByType (utils, types) {
  let utilsList = {};
  for (let i in types) {
    utilsList[types[i]] = [];
  }
  for (let i in utils) {
    let util = utils[i];
    utilsList[util.type].push(util);
  }
  return utilsList;
}

function getIncidentUtilsByUser (user) {
  let incidentsPromise;

  if (PrivilegeUtil.isDispatcher(user.role)) {
    incidentsPromise = IncidentResponderDAO.getIncidentsForDispatcher(user.id);
  } else if (PrivilegeUtil.isFirstResponder(user.role)) {
    incidentsPromise = IncidentResponderDAO.getOpenIncidentForFirstResponder(user.id);
  } else if (PrivilegeUtil.isNurse(user.role)) {
    incidentsPromise = IncidentDAO.getByType(Incident.emergencyType.MEDICAL);
  } else if (PrivilegeUtil.isAdministrator(user.role)) {
    incidentsPromise = IncidentDAO.getAll();
  } else {
    incidentsPromise = Promise.resolve([]);
  }

  return incidentsPromise.then(incidents => {
    let utils = [];

    for (let incident of incidents) {
      if (incident.location !== undefined &&
          incident.location.latitude !== undefined &&
          incident.location.longitude !== undefined) {
        utils.push({
          type: 'incident',
          location: incident.location,
          note: incident.address,
          data: incident
        });
      }
    }

    return utils;
  });
}

function getHostipleUtils () {
  return HospitalDAO.getAllHospitals().then(hospitals => {
    let utils = [];

    for (let hospital of hospitals) {
      if (validateGeoJSON(hospital.location)) {
        utils.push({
          type: 'hospital',
          location: {
            latitude: hospital.location.coordinates[1],
            longitude: hospital.location.coordinates[0]
          },
          note: hospital.hospitalName,
          data: hospital
        });
      }
    }

    return utils;
  });
}

function validateGeoJSON (geoJson) {
  if (geoJson && geoJson.coordinates && geoJson.coordinates.length === 2) {
    if (geoJson.coordinates[0] && geoJson.coordinates[1]) {
      return true;
    }
  }
  return false;
}

// Class MapController
module.exports = class MapController {
  // Update location info
  updateLocationInfo (req, res) {
    let location = req.body;
    if (!validateGeoJSON(location)) {
      return res.status(400).send('Invalid GeoJSON.');
    }
    // let location = {
    //   type: 'Point',
    //   coordinates: [parseFloat(req.body.longitude), parseFloat(req.body.latitude)]
    // };

    let userID = req.params.userID;
    UserDAO.updateUser({_id: userID}, {location: location})
      .then(function (user) {
        global.io.emit('location updated');
        res.sendStatus(200);
      })
      .catch(function (err) {
        res.status(500).send(err);
      });
  }

  // Update phoneNumber
  updatePhoneNumber (req, res) {
    let phoneNumber = req.body['phoneNumber'];
    if (phoneNumber === undefined) {
      res.sendStatus(500);
    }
    let userID = req.params.userID;
    UserDAO.updateUser({_id: userID}, {phoneNumber: phoneNumber})
      .then(function (msg) {
        res.sendStatus(200);
        global.io.emit('reload map');
      })
      .catch(function (err) {
        res.status(500).send(err);
      });
  }

  // Get the latest message,username,location and phone number of all users
  getMapInfo (req, res) {
    MessageDAO.getLatestMessage(function (err, messages) {
      if (err) { res.send(err); } else {
        UserDAO.getAllUsers({}, {}, function (err, users) {
          if (err) res.send(err);
          let result = [];
          let msgMap = {};
          for (let i in messages) { msgMap[messages[i]['_id']] = messages[i]; }
          for (let i in users) {
            let uid = users[i]['_id'];
            let data = {};
            if (uid in msgMap) { data = msgMap[uid]; }
            data['status'] = users[i].status.status;
            data['username'] = users[i].username;
            data['location'] = users[i].location;
            // data['location'] = {
            //   longitude: data['geoLocation'].coordinates[0].toString(),
            //   latitude: data['geoLocation'].coordinates[1].toString()
            // };
            data['phoneNumber'] = users[i].phoneNumber;
            data['uid'] = uid;
            result.push(data);
          }

          res.status(200).json(result);
        });
      }
    });
  }

  // Get utils.
  getUtils (req, res, next) {
    let role = req.session.user.role;
    let types = accessibleTypes(role);
    let incidentUtils = [];
    let hospitalUtils = [];

    getIncidentUtilsByUser(req.session.user)
      .then(utils => {
        incidentUtils = utils;
        return getHostipleUtils();
      })
      .then(utils => {
        hospitalUtils = utils;
        return UtilDAO.getByTypes(types);
      })
      .then(utils => {
        let json = sortUtilsByType(utils, types);
        json.incident = incidentUtils;
        json.hospital = hospitalUtils;
        res.json(json);
      })
      .catch(err => next(err));
  }

  // Create a new util.
  createUtil (req, res, next) {
    if (req.body.type === undefined ||
        req.body.latitude === undefined ||
        req.body.longitude === undefined ||
        req.body.note === undefined) {
      return res.sendStatus(422);
    }

    let role = req.session.user.role;
    let {type, latitude, longitude, note} = req.body;

    latitude = Number.parseFloat(latitude);
    longitude = Number.parseFloat(longitude);

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      return res.sendStatus(422);
    }

    // Check the privilege.
    if (!canEdit(role, type)) {
      return res.sendStatus(403);
    }

    let attrs = {
      type,
      location: {latitude, longitude},
      note
    };

    UtilDAO.create(attrs)
      .then(utils => {
        res.status(201).json(utils);
      })
      .catch(err => next(err));
  }

  // Remove a util.
  removeUtil (req, res, next) {
    let role = req.session.user.role;
    let utilId = req.params.utilId;

    UtilDAO.getById(utilId)
      .then(util => {
        if (!canEdit(role, util.type)) {
          res.sendStatus(403);
        } else {
          UtilDAO.remove(utilId)
            .then(() => res.sendStatus(204))
            .catch(err => res.sendStatus(404));
        }
      })
      .catch(err => res.sendStatus(404));
  }
};
