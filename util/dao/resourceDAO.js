const dbUtil = require('../dbUtil');
const User = dbUtil.getModel('User');
const Incident = dbUtil.getModel('Incident');
const Vehicle = dbUtil.getModel('Vehicle');
const async = require('async');

const _ = require('lodash');

function sortByName (a,b) {
  if (a.name < b.name) {
    return -1;
  }
  else if (a.name > b.name) {
    return 1;
  }
  else {
    return 0;
  }
}

class ResourceDAO {

  static newVehicle(resource) {
    return new Vehicle({
      name: resource.name,
      type: resource.type,
      allocated: {
        kind: resource.allocated.kind,
        to: resource.allocated.to,
      },
      persons: resource.persons
    });
  }

  // Adding this function for the sake of unit tests
  static createResources(resourcesInfo) {
    var functions = [];
    resourcesInfo.forEach(function (resource) {
      let vehicle = ResourceDAO.newVehicle(resource);
      functions.push(vehicle.save());
    });

    return new Promise(function(resolve, reject) {
      Promise.all(functions).then(function (resources) {
        resolve(resources);
      }).catch(function (err) {
        reject(err);
      });
    });
  }

  static updateResources(resourcesInfo) {
    var resources;
    if (typeof resourcesInfo != "object") {
      resources = JSON.parse(resourcesInfo);
    } else {
      resources = resourcesInfo;
    }
    var functions = [];
    for (let i = 0; i < resources.length; i++) {
      let resource = resources[i];

      functions.push(Vehicle.findByIdAndUpdate(resource._id, {
        $set: {
          allocated: resource.allocated,
        }
      }, {new: false}));
    }

    return new Promise(function(resolve, reject) {
      Promise.all(functions).then(function (oldResources) {
        resources.sort(sortByName);
        oldResources.sort(sortByName);
        let updatedVehicles = [];

        for (let i = 0; i < resources.length; i++) {
          if (resources[i].allocated) {
            if (!oldResources[i].allocated || (resources[i].allocated.to != oldResources[i].allocated.to)) {
              updatedVehicles.push(resources[i]);
            }
          }
        }
        resolve(updatedVehicles);
      }).catch(function (err) {
        reject(err);
      });
    });
  }

  static getResources() {
    return new Promise(function (resolve, reject) {
      Vehicle.find({}).populate('persons')
        .then(function (resources) {
          resolve(resources);
        })
        .catch(function (err) {
          reject(err);
        });
    });
  }

  static findPersonnelForIncident(incidentId) {
    return new Promise(function (resolve, reject) {
      var personnelIds = [];
      Vehicle.find({})
        .then(function (vehicles) {
          vehicles.forEach(function (vehicle) {
            if (vehicle.allocated.kind == 'Incident' && vehicle.allocated.to == incidentId) {
              personnelIds.push(vehicle.persons);
            }
          });
          resolve(personnelIds);
        })
        .catch(function (err) {
          reject(err);
        });
    });
  }

  static deallocateResourcesForIncident(incidentId) {
    return new Promise(function (resolve, reject) {
      Vehicle.find({})
        .then(function (vehicles) {
          vehicles.forEach(function (vehicle) {
            if (vehicle.allocated.kind == 'Incident' && vehicle.allocated.to == incidentId) {
              Vehicle.findByIdAndUpdate(vehicle._id, {
                $set: {
                  allocated: null,
                }
              }, {new: false})
                .then(function (){
                  console.log('deallocated vehicle ' + vehicle.name);
                })
                .catch(function (err) {
                  console.log('err in deallocating vehicle' + err);
                });
            }
          });
          resolve();
        })
        .catch(function (err) {
          reject(err);
        });
    });
  }
}

module.exports = ResourceDAO;
