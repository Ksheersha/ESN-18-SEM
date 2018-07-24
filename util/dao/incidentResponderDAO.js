const dbUtil = require('../dbUtil');
const User = dbUtil.getModel('User');
const Incident = dbUtil.getModel('Incident');
const Vehicle = dbUtil.getModel('Vehicle');
const _ = require('lodash');

const IncidentHelper = require('../../helpers/incidentHelper');

class IncidentResponderDAO {
  static createNewIncidentFirstResponder(userId) {
    return new Promise(function (resolve, reject) {
      let incidentInfo = {
        creatorId: userId,
        commanderId: userId,
        state: Incident.incidentState.ASSIGNED
      };
      IncidentHelper.generateDisplayIdFirstResponder(userId)
      .then(function (displayId) {
        incidentInfo.displayId = displayId;
        return IncidentHelper.newIncident(incidentInfo).save();
      })
      .then(function (incident) {
        resolve(incident);
      })
      .catch(function (err) {
        reject(err);
      });
    });
  }

  static updateIncidentState(incidentId) {
    return new Promise(function (resolve, reject) {
      Incident.findOne({_id: incidentId})
        .then(function (incident) {
          User.findOne({_id: incident.creatorId})
            .then(function (creator) {
              User.findOne({_id: incident.commanderId})
                .then(function (commander) {
                  if (incident.state === Incident.incidentState.WAITING) {
                    incident.state = Incident.incidentState.TRIAGE;
                    incident.save()
                      .then(function (incident) {
                        resolve(incident);
                      })
                      .catch(function (err) {
                        reject(err);
                      });
                  } else if (incident.state === Incident.incidentState.TRIAGE && creator.username !== commander.username && commander.username !== null) {
                    incident.state = Incident.incidentState.ASSIGNED;
                    incident.save()
                      .then(function (incident) {
                        resolve(incident);
                      })
                      .catch(function (err) {
                        reject(err);
                      });
                  } else if (incident.state === incident.state.CLOSED) {
                    resolve(incident);
                  }
                  else {
                    resolve(incident);
                  }
                });
            });
        })
        .catch(function (err) {
          reject(err);
        });
    });
  }

  static updateIncidentPriority(incidentId, newPriority) {
    return Incident.findByIdAndUpdate(incidentId, {$set: {priority: newPriority}}, {new: true});
  }

  static updateIncidentCommander(incidentId, newCommanderId) {
    return Incident.findByIdAndUpdate(incidentId, {$set: {commanderId: newCommanderId}}, {new: true});
  }

  static updateIncidentDispatcherGroupId(incidentId, newDispatcherGroupId) {
    return Incident.findByIdAndUpdate(incidentId, {$set: {dispatcherGroupId: newDispatcherGroupId}}, {new: true});
  }

  static updateIncidentResponderGroupId(incidentId, newResponderGroupId) {
    return Incident.findByIdAndUpdate(incidentId, {$set: {responderGroupId: newResponderGroupId}}, {new: true});
  }

  static getIncidentCommander(incidentId) {
    return new Promise ((resolve, reject ) => {
      Incident.findOne({_id: incidentId})
      .then(incident => resolve(incident.commanderId))
      .catch(err => reject(err));
    });
  }

  static getIncidentInfoForStep5(incidentId) {
    return new Promise(function (resolve, reject) {
      Incident.findOne({_id: incidentId})
        .then(function (incident) {
          let incidentInfo = {
            commanderId: incident.commanderId,
            creatorId: incident.creatorId,
            openingDateTime: incident.openingDateTime,
            priority: incident.priority,
            displayId: incident.displayId,
            state: incident.state,
            closingDateTime: incident.closingDateTime,
            dispatcherGroupId: incident.dispatcherGroupId,
            responderGroupId: incident.responderGroupId
          };
          let firstResponders = [];

          User.findOne({_id: incident.commanderId})
            .then(function (commander) {
              incidentInfo.commanderName = commander.username;
              User.findOne({_id: incident.creatorId})
                .then(function (creator) {
                  incidentInfo.creatorName = creator.username;
                  Vehicle.find({}).populate('persons')
                    .then(function (vehicles) {
                      vehicles.forEach(function (vehicle) {
                        if (vehicle.allocated.kind == 'Incident' && vehicle.allocated.to == incidentId) {
                          vehicle.persons.forEach(function (currentPerson) {
                            firstResponders.push(currentPerson);
                          });
                        }
                      });
                      incidentInfo.firstResponders = firstResponders;
                      resolve(incidentInfo);
                    });

                });
            });
          if (incident.callerId) {
            User.findOne({_id: incident.callerId})
              .then(function (caller) {
                incidentInfo.callerName = caller.username;
              });
          } else {
            incidentInfo.callerName = 'No caller';
          }
        })
        .catch(function (err) {
          reject(err);
        });
    });
  }

  static getIncidentsForDispatcher(dispatcherId, state) {
    let query = {creatorId: dispatcherId};
    if (state !== undefined) {
      query.state = state;
    }
    return Incident.find(query).sort('openingDateTime');
  }

  static getOpenIncidentForFirstResponder(responderId) {
    var openIncidentsList = [];

    return new Promise(function (resolve, reject) {
      Incident.find({commanderId: responderId, state: {$ne: Incident.incidentState.CLOSED}})
        .then(function (openIncidents) {
          openIncidents.forEach(function (currentOpenIncident) {
            openIncidentsList.push(currentOpenIncident);
          });
          Vehicle.find({"allocated.kind": "Incident"}).populate('allocated.to')
            .then(function (vehicles) {
              vehicles.forEach(function (vehicle) {
                for (let i = 0; i < vehicle.persons.length; i++) {
                  let incident = vehicle.allocated.to;
                  if ((responderId == vehicle.persons[i]) && (incident.state != Incident.incidentState.CLOSED)) {
                    openIncidentsList.push(incident);
                  }
                }
              })
              resolve(openIncidentsList);
            });
          })
          .catch(function (err) {
            reject(err);
          });
      });
    }

  static getOtherOpenIncidents(responderId) {
    return new Promise(function (resolve, reject) {
      Incident.find({closingDateTime: null, state: Incident.incidentState.ASSIGNED})
        .sort('priority')
        .then(function (openIncidents) {
          // filter the responderId
          openIncidents = _.remove(openIncidents, function (incident) {
            return incident.commanderId != responderId; // for not equal != instead of !==
          });
          resolve(openIncidents);
        })
        .catch(function (err) {
          reject(err);
        });
    });
  }

  static getClosedIncidents () {
    return Incident.find({state: Incident.incidentState.CLOSED}).sort('openingDateTime')
  }

  static getIncidentState (incidentId) {
    return Incident.findOne({_id: incidentId});
  }

  static responderClosedIncident (incidentId) {
    return new Promise(function (resolve, reject) {
      Incident.findOne({_id: incidentId})
      .then(function (incident) {
        User.findOne({_id: incident.creatorId})
        .then(function (creator) {
          User.findOne({_id: incident.commanderId})
          .then(function (commander) {
            if (incident.state === Incident.incidentState.TRIAGE || incident.state === Incident.incidentState.ASSIGNED) {
              incident.state = Incident.incidentState.CLOSED;
              incident.closingDateTime = new Date();
              incident.save()
              .then(function (incident) {
                resolve(incident);
              })
              .catch(function (err) {
                reject(err);
              });
            }
            else {
              resolve(incident);
            }
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
}
module.exports = IncidentResponderDAO;
