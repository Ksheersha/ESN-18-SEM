const dbUtil = require('../dbUtil');
const User = dbUtil.getModel('User');
const Incident = dbUtil.getModel('Incident');
const IncidentAnswer = dbUtil.getModel('IncidentAnswer');
const _ = require('lodash');

const IncidentHelper = require('../../helpers/incidentHelper');

class IncidentDAO {
  static createNewIncident (callerId) {
    return new Promise(function (resolve, reject) {
      let incidentInfo = { callerId: callerId };
      IncidentHelper.generateDisplayId(callerId)
        .then(function (displayId) {
          incidentInfo.displayId = displayId;
          IncidentHelper.findLeastBusyDispatcherId()
            .then(function (dispatcherId) {
              for (let n in clients_list) {
                if (clients_list[n].id == dispatcherId) {
                  var targetSocket = clients_list[n].Socket;
                  targetSocket.emit("Received New Incident");
                }
              }
              incidentInfo.creatorId = dispatcherId;
              incidentInfo.commanderId = dispatcherId;
              IncidentHelper.newIncident(incidentInfo)
                .save()
                .then(function (incident) {
                  resolve(incident);
                });
            })
          .catch(function (err) {
            reject(err);
          });
        })
        .catch(function (err) {
          reject(err);
        });
    });
  }

  static updateIncidentLocation (incidentId, incidentAddress, location) {
    return new Promise(function (resolve, reject) {
      Incident.findByIdAndUpdate(incidentId, {$set: {
        address: incidentAddress,
        location: location
      }}, { new: true })
        .then(function (incident) {
          resolve(incident);
        })
        .catch(function (err) {
          reject(err);
        });
    });
  }

  static getIncidentLocation (incidentId) {
    return new Promise(function (resolve, reject) {
      Incident.findOne({_id: incidentId})
        .then(function (incident) {
          resolve(incident);
        })
        .catch(function (err) {
          reject(err);
        });
    });
  }

  static getOpenIncidentForNonResponder (callerId) {
    return new Promise(function (resolve, reject) {
      Incident.find({ callerId: callerId, state: { $ne: Incident.incidentState.CLOSED }})
        .then(function (openIncidents) {
          resolve(openIncidents);
        })
        .catch(function (err) {
          reject(err);
        });
    });
  }

  static updateIncidentType (incidentId, incidentType) {
    return new Promise(function (resolve, reject) {
      Incident.findByIdAndUpdate(incidentId, {$set: {emergencyType: incidentType}}, { new: true })
        .then(function (incident) {
          resolve(incident);
        })
        .catch(function (err) {
          reject(err);
        });
    });
  }

  static getIncidentType (incidentId) {
    return new Promise(function (resolve, reject) {
      Incident.findOne({_id: incidentId})
        .then(function (incident) {
          resolve(incident);
        })
        .catch(function (err) {
          reject(err);
        });
    });
  }

  static getIncidentDisplayId (incidentId) {
    return new Promise(function (resolve, reject) {
      Incident.findOne({_id: incidentId})
        .then(function (incident) {
          resolve(incident.displayId);
        })
        .catch(function (err) {
          reject(err);
        });
    });
  }

  static setIncidentState (incidentId, state) {
    return new Promise(function (resolve, reject) {
      Incident.findByIdAndUpdate(incidentId, {$set: {state: state}}, { new: true })
        .then(function (incident) {
          resolve(incident);
        })
        .catch(function (err) {
          reject(err);
        });
    });
  }

  static getByType (emergencyType) {
    return Incident.find({emergencyType}).exec();
  }

  static getAll () {
    return Incident.find({}).exec();
  }

  static getAllOpenIncidents () {
    return Incident.find({state: { $ne: Incident.incidentState.CLOSED }}).exec();
  }

  static transferDispatcherCommand(id) {
    // transfers the Command of the incident to the less busy online 
    // dispatcher (who has less --waiting+triage-- calls) who becomes the temporary 
    // Incident Commander
    // step 1 check if the role has incident
    // step 2 check if there are online dispatcher
    // step 3 rank the dispatcher by their work
    // step 4 transfer command  
    let incidents;  
    return Incident.find({creatorId: id}).exec()
    .then(function(docs) {
      // console.log("dispatcher incidents");
      // console.log(docs);
      incidents = docs;
      return IncidentHelper.getAvailableDispatcher();
    })
    .then(function(users) {
      // console.log("AvailableDispatcher");
      // console.log(users);
      // if there is available dispatcher
      if (users && users.length > 1) {
        let query = [];
        let transferId = users[0].id;
        if (transferId === id) {
          transferId = users[1].id;
        }
        for (let i in incidents) {
          query.push(Incident.update({_id: incidents[i]._id}, {creatorId: transferId}).exec());
        }
        if (query.length > 0) {
          return Promise.all(query);
        } else {
          return incidents.length === 0;
        }
      }
    })
  }  

  static transferFirstResponderCommand(id) {
    // transfers the Command of the Incident to an un-assigned 
    // First Responder who becomes the new Incident Commander
    // step 1 check if the role has an incident
    // step 2 check if there are online first responder that have no incident
    // step 3 transfer command  
    let incident; 
    return Incident.findOne({commanderId: id}).exec()
    .then(function(doc) {
      // console.log("First responder incident");
      // console.log(doc);
      incident = doc;
      if (incident !== null) {
        return IncidentHelper.getAvailableFirstResponder(incident.emergencyType);
      } else {
        return [];
      }
    })
    .then(function(users) {
      // console.log("AvailableFirstResponder");
      // console.log(users);
      if (users.length > 0) {
        return Incident.update({_id: incident._id}, {commanderId: users[0]._id}).exec();
      } else {
        return incident === null;
      }
    });
  } 

}

module.exports = IncidentDAO;
