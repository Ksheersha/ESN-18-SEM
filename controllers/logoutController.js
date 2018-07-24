'use strict';
let UserDAO = require('../util/dao/userDAO').UserDAO;
let IncidentDAO = require('../util/dao/incidentDAO');
let LocationDAO = require('../util/dao/locationDAO').LocationDAO;
let VehicleDAO = require('../util/dao/vehicleDAO');

function clearSessionAndRedirect(req, res, success) {
  console.log(success);
  if (success !== false) {
    req.session.user = null;
    // res.redirect('/');   
    res.sendStatus(200);
  } else {
    res.sendStatus(501);
  }
}

function isFirstResponder(role) {
  let firstReponder = ['PoliceChief', 'PatrolOfficer', 'FireChief', 
                  'Firefighter', 'Paramedic'];
  return firstReponder.includes(role);
}

function isDispatcher(role) {
  return role === 'Dispatcher';
}

class LogoutController {
  logout (req, res) {
    if (req.session.user !== undefined) {
      let id = req.session.user.id;
      UserDAO.recordLogoutTime(id)
      .then(function () {
        let role = req.session.user.role;
        if (isFirstResponder(role)) {
          let logoutOperations = [];
          logoutOperations.push(IncidentDAO.transferFirstResponderCommand(id));
          logoutOperations.push(VehicleDAO.getPersonnelOutOfVehicle(id));
          logoutOperations.push(LocationDAO.removeLocationById(id));
          Promise.all(logoutOperations)
          .then((success) => {clearSessionAndRedirect(req, res, success)});
        } else if (isDispatcher(role)) {
          IncidentDAO.transferDispatcherCommand(id)
          .then((success) => {clearSessionAndRedirect(req, res, success)});
        } else {
          clearSessionAndRedirect(req, res, true);
        }
      });
    } else {
      clearSessionAndRedirect(req, res, true);
    }
  }
}

module.exports = LogoutController;

