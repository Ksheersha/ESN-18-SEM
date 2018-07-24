'use strict';
let HTTPStatus = require('http-status');
let OrganizationDAO = require('../util/dao/organizationDAO');
let VehicleDAO = require('../util/dao/vehicleDAO');
let ControllerUtil = require('./utils/ControllerUtil');

class OrganizationController {
  updateOrganization(req, res) {

    let org = req.body;
    let chiefId = req.params.chiefId;
    OrganizationDAO.updateOrganization(chiefId, org).then(function (org) {
      res.status(201).send(org);
    }).catch(function (err) {
      res.status(500).send(err);
    });
  }

  getOrganizationByChiefId(req, res) {
    let chiefId = req.params.chiefId;
    OrganizationDAO.getOrganizationByChiefId(chiefId).then(function (org) {
      res.status(200).send(org);
    }).catch(function (err) {
      res.status(500).send(err);
    });
  }

  getOrganizationAreasByChiefId(req, res) {
    let chiefId = req.params.chiefId;
    OrganizationDAO.getOrganizationAreasByChiefId(chiefId).then(function (areas) {
      res.status(200).send(areas);
    }).catch(function (err) {
      res.status(500).send(err);
    });
  }

  getAllOrganizations(req, res) {
    OrganizationDAO.getChiefList().then(function (orgs) {
      res.status(200).send(orgs);
    }).catch(function (err) {
      res.status(500).send(err);
    });
  }

  getOrganizationByPersonnelId(req, res) {
    let userId = req.params.userId;
    OrganizationDAO.getOrganizationByPersonnelId(userId).then(org => {
      if (org) {
        res.status(HTTPStatus.OK).json(org);
      } else {
        res.sendStatus(HTTPStatus.OK);
      }
    }).catch(function (err) {
      res.status(HTTPStatus.INTERNAL_SERVER_ERROR).send(err);
    });
  }

  static updateVehicle (req, res) {
    let vehicleId = req.params.vehicleId;
    if (vehicleId === '') {
      return res.status(HTTPStatus.BAD_REQUEST).send('Invalid vehicle ID.');
    }
    let updateVehicleTasks = [];
    let userId = req.body.persons;
    let location = req.body.location;
    if (userId) {
      updateVehicleTasks.push(VehicleDAO.putPersonnelIntoVehicle(vehicleId, userId));
    }

    if (ControllerUtil.validateGeoJSON(location)) {
      updateVehicleTasks.push(VehicleDAO.updateVehicleLocation(vehicleId, location));
    }

    updateVehicleTasks.reduce((promiseChain, currentPromise) => {
      return promiseChain.then(() => currentPromise);
    }, Promise.resolve())
    .then(vehicle => {
      global.io.emit('location updated');
      res.status(HTTPStatus.OK).json(vehicle);
    }).catch(err => {
      res.status(HTTPStatus.INTERNAL_SERVER_ERROR).send(err);
    });
  }

  static getVehicleByUserId(req, res) {
    let userId = req.params.userId;
    VehicleDAO.getVehicleByUserId(userId).then(vehicle => {
      res.status(200).send(vehicle);
    }).catch(function (err) {
      res.status(500).send(err);
    })
  }

  static getVehicleById (req, res) {
    let vehicleId = req.params.vehicleId;
    VehicleDAO.getVehicleById(vehicleId).then(vehicle => {
      res.status(200).send(vehicle);
    }).catch(function (err) {
      res.status(500).send(err);
    })
  }

  static getTruckById(req, res) {
    VehicleDAO.getTruckById(req.params.id)
      .then((data) => {
        res.status(200).send(data);
      })
      .catch(function (err) {
        res.status(500).send(err);
      });
  }
}

module.exports = OrganizationController;
