'use strict';

const ResourceDAO = require('../util/dao/resourceDAO');
const dbUtil = require('../util/dbUtil');
const Incident = dbUtil.getModel('Incident');

class ResourceController {

  updateResources (req, res) {
    ResourceDAO.updateResources(req.body.resources)
      .then(function(resourcesInfo) {
        global.io.emit('new assignment', resourcesInfo);
        res.status(200).send(resourcesInfo);
      })
      .catch (function (err) {
        console.log('err in controller ' + err);
        res.status(500).send(err);
      });
  }

  getResources (req, res) {
    ResourceDAO.getResources()
      .then(function(resourcesInfo) {
        res.status(200).send(resourcesInfo);
      })
      .catch(function (err) {
        res.status(500).send(err);
      });
  }
  
  findPersonnelForIncident(req, res){
    ResourceDAO.findPersonnelForIncident(req.params.incidentId)
      .then(function(personnelIds) {
        res.status(200).send(personnelIds);
      })
      .catch (function (err) {
        res.status(500).send(err);
      });
  }

  deallocateResourcesForIncident(req, res) {
    ResourceDAO.deallocateResourcesForIncident(req.params.incidentId)
      .then(function () {
        res.status(200).send();
      })
      .catch(function (err) {
        res.status(500).send(err);
      });
  }


}

module.exports = ResourceController;
