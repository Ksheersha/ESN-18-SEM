/*
* Set of helpers for the incident DAO
* */

const dbUtil = require('../util/dbUtil');
const User = dbUtil.getModel('User');
const Incident = dbUtil.getModel('Incident');
const async = require('async');
const _ = require('lodash');

class IncidentHelper {
  // Helper function that returns an instance of an incident
  static newIncident (incidentInfo) {
    return new Incident({
      callerId: incidentInfo.callerId,
      displayId: incidentInfo.displayId,
      openingDateTime: new Date(),
      creatorId: incidentInfo.creatorId,
      commanderId: incidentInfo.commanderId,
      state: incidentInfo.state
    });
  }

  // helper function, returns promise of unique incident id for display
  static generateDisplayId (callerId) {
    return new Promise(function (resolve, reject) {
      let id = 'I_';
      User.findOne({_id: callerId}, 'username')
      .then(function (user) {
        id += user.username;
      })
      .then(function () {
        Incident.count({callerId: callerId})
        .then(function (count) {
          id += '_' + (count + 1);
          resolve(id);
        });
      })
      .catch(function (err) {
        reject(err);
      });
    });
  }

  // helper function, returns promise of unique incident id for display
  static generateDisplayIdFirstResponder (userId) {
    return new Promise(function (resolve, reject) {
      let id = 'I_';
      User.findOne({_id: userId}, 'username')
      .then(function (user) {
        id += user.username;
      })
      .then(function () {
        Incident.count({creatorId: userId, callerId: null})
        .then(function (count) {
          id += '_' + (count + 1);
          resolve(id);
        });
      })
      .catch(function (err) {
        reject(err);
      });
    });
  }

  // helper function, returns promise of waiting + triange count for a dispatcher
  static getWaitingTriageIncidentCountForDispatcher (dispatcherId) {
    return new Promise(function (resolve, reject) {
      Incident.count({
        creatorId: dispatcherId,
        state: {$in: [Incident.incidentState.WAITING, Incident.incidentState.TRIAGE]}
      })
        .then(function (count) {
          let dispatcher = {
            id: dispatcherId,
            count: count
          };
          resolve(dispatcher);
        })
        .catch(function (err) {
          reject(err);
        });
    });
  }

  // helper function, returns promise of the least busy dispatcher's id
  static findLeastBusyDispatcherId () {
    return new Promise(function (resolve, reject) {
      let dispatchers = [];
      // get all dispatchers
      User.find({role: 'Dispatcher'}, '_id')
        .then(function (users) {
        // for each dispatcher
          async.each(users, function (user, cb) {
          // count all waiting and triage incidents
            IncidentHelper.getWaitingTriageIncidentCountForDispatcher(user._id)
              .then(function (dispatcher) {
                dispatchers.push(dispatcher);
                cb();
              });
          }, function () {
          // get the least busy dispatcher
            if (dispatchers.length) {
              let availableDispatcher = _.minBy(dispatchers, 'count');
              resolve(availableDispatcher.id);
            } else {
              reject('No dispatchers found');
            }
          });
        });
    });
  }

  static getAvailableFirstResponder(emergencyType) {
    // get the first responder according to emergency type, available first
    // responders should be online and have not assigned to an incident
    let roles;
    if (emergencyType === Incident.emergencyType.FIRE) {
      roles = [User.roleType.FIRE_CHIEF, User.roleType.FIREFIGHTER];
    } else if (emergencyType === Incident.emergencyType.MEDICAL) {
      roles = [User.roleType.PARAMEDIC];
    } else if (emergencyType === Incident.emergencyType.POLICE) {
      roles = [User.roleType.PATROL_OFFICER, User.roleType.POLICE_CHIEF];
    }
    return Incident.find({state: { $ne: Incident.incidentState.CLOSED }}).select('commanderId').exec()
    .then(function(busy) {
      // console.log("first responder with Incident");
      let busyId = [];
      for (let i in busy) {
        busyId.push(busy[i].commanderId);
      }
      // console.log(busyId);
      return User.find({role: {$in: roles}, isOnline: true, _id: {$nin: busyId}}).exec();
    });
  }

  static getAvailableDispatcher() {
    // get all the online dispatcher and rank them by the waiting+triage calls
    return User.find({role: User.roleType.DISPATCHER, isOnline: true})
    .then(function(users) {
      let query = [];
      if (users !== null) {
        for (let i in users) {
          query.push(IncidentHelper.getWaitingTriageIncidentCountForDispatcher(users[i]._id));        
        }
        return Promise.all(query);
      } else return [];
    })
    .then(function(count) {
      return count.sort(function(a,b) {
        let x = a.count;
        let y = b.count;
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
      });
    });
  }  
}

module.exports = IncidentHelper
