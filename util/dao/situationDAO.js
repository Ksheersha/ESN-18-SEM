const dbUtil = require('../dbUtil');
const Situation = dbUtil.getModel('Situation');

class situationDAO {

  static updateSituationInfo (situationId, situationInfo) {
    let loc = {
      type: "Point",
      coordinates: [situationInfo.location.longitude, situationInfo.location.latitude]
    };
    return new Promise(function (resolve) {
      Situation.findByIdAndUpdate(situationId, {
        $set: {
          name: situationInfo.name,
          creatorId: situationInfo.creatorId,
          address: situationInfo.address,
          affectedRadius: situationInfo.affectedRadius,
          location: loc,
          description: situationInfo.description,
          specialNotes: situationInfo.specialNotes,
          affectedUsers: situationInfo.affectedUsers,
          state: Situation.situationState.OPEN,
        }
      }, {new: true})
        .then(function (updatedAnswer) {
          resolve(updatedAnswer);
        });
    })
  }

  static getAllSituationByDistance(userLocation) {
    return new Promise(function (resolve, reject) {
      if (!userLocation) return reject("no user location");
      Situation.aggregate([{
        $geoNear: {
          near: { type: "Point", coordinates: [ userLocation.longitude, userLocation.latitude ] },
          distanceField: "distance",
          spherical: true
        }
      }])
      .then(function (situations) {
        situations = situations.filter(function (situation) {
          return parseInt(situation.state) === parseInt(Situation.situationState.OPEN);
        });
        for (let i = 0; i < situations.length; i++) {
          situations[i].distance = (situations[i].distance * 0.000621371).toFixed(2);
        }
        resolve(situations);
      });
    });
  }

  static getAllSituationsByDate () {
    return new Promise(function (resolve) {
      Situation.find({state: Situation.situationState.OPEN})
        .sort({creationTime: -1})
        .then(function (situationList) {
          resolve(situationList);
        });
    })
  }

  static getSituationInfo (situationId) {
    return new Promise(function (resolve, reject) {
      Situation.findOne({_id: situationId})
        .then(function (situation) {
          resolve(situation);
        })
        .catch(function (err) {
          reject(err);
        });
    });
  }

  static closeSituation (situationId) {
    return new Promise(function (resolve, reject) {
      Situation.findOneAndUpdate(
        { _id: situationId },
        { $set: { state: Situation.situationState.CLOSED}},
        {new: true}
      )
        .then(function (situation) {
          resolve(situation);
        })
        .catch(function (err) {
          reject(err);
        })
    })
  }

  static getAffectedUserList (situationId) {
    return new Promise(function (resolve, reject) {
      Situation.findOne({_id: situationId})
        .then(function (situation) {
          resolve(situation.affectedUsers);
        })
        .catch(function (err) {
          reject(err);
        })
    })
  }

  static updateAffectedUserList (situationId, userId) {
    return new Promise(function (resolve, reject) {
      Situation.findOne({ _id: situationId})
      .then(function (situation) {
        if (situation && !situation.affectedUsers) {
          situation.affectedUsers = [];
        }

        let newAffectedUsers = situation.affectedUsers;
        let index = newAffectedUsers.indexOf(userId);
        if (index > -1) {
          newAffectedUsers.splice(index, 1);
        } else {
          newAffectedUsers.push(userId);
        }
        Situation.findByIdAndUpdate( situationId,
          { $set: { affectedUsers: newAffectedUsers} },
          { new: true })
          .then(function (newSituation) {
            resolve(newSituation);
          })
          .catch(function (err) {
            reject(err);
          })
      })
      .catch(function (err) {
        reject(err);
      })
    })
  }

  static createNewSituation (situationInfo){
    return new Promise(function (resolve) {
      situationDAO.newSituation(situationInfo)
        .save()
        .then(function (situation) {
          resolve(situation);
        })
        .catch(function (err) {
          reject(err);
        });
    })
  }

  static newSituation(situationData) {
    return new Situation({
      name: situationData.name,
      creatorId: situationData.creatorId,
      address: situationData.address,
      affectedRadius: situationData.affectedRadius,
      location: {
        type: "Point",
        coordinates: [situationData.location['longitude'], situationData.location['latitude']]
      },
      description: situationData.description,
      specialNotes: situationData.specialNotes,
      affectedUsers: situationData.affectedUsers,
      creationTime: new Date()
    });
  }

  static getSituationsAfterDate (date, location) {
    return new Promise (function (resolve) {
      situationDAO.getAllSituationByDistance(location)
        .then(function (situations) {
          let limitDate = new Date(date);
          situations = situations.filter(function (situation) {
            let situationDate = new Date(situation.creationTime);
            return (situationDate > limitDate) && (situation.distance < situation.affectedRadius);
          });
          resolve(situations);
        });
    });
  }
}

module.exports = situationDAO;