'use strict';

let SituationDAO = require('../util/dao/situationDAO');
let UserDAO = require('../util/dao/userDAO').UserDAO;

class SituationController {

	getSituationInfo (req, res) {
    SituationDAO.getSituationInfo(req.params.situationId)
		.then(function (situation) {
			res.status(200).send(situation);
		})
		.catch(function (err) {
			res.status(500).send(err);
		});
	}

	updateSituationInfo (req, res) {
    SituationDAO.updateSituationInfo(req.params.situationId, JSON.parse(req.body.situation))
		.then(function (situation) {
			res.status(200).send(situation);
		})
		.catch(function (err) {
			res.status(500).send(err);
		});
	}

	createNewSituation (req, res) {
    SituationDAO.createNewSituation(JSON.parse(req.body.situation))
			.then(function (situation) {
        global.io.emit('new situation', situation);
				res.status(200).send(situation);
			})
			.catch(function (err) {
			  console.log("err is " + err);
				res.status(500).send(err);
			})
	}

	getAllSituation (req, res) {
		let userLocation = req.query;
		if (userLocation.longitude) { // if the query contains a location
      userLocation.longitude = parseFloat(userLocation.longitude);
      userLocation.latitude = parseFloat(userLocation.latitude);

      SituationDAO.getAllSituationByDistance(userLocation)
      .then(function (situationList) {
        res.status(200).send(situationList);
      })
      .catch(function (err) {
        res.status(500).send(err);
      });
		} else { // no location in query
      SituationDAO.getAllSituationsByDate()
			.then(function (situations) {
				res.status(200).send(situations);
			})
			.catch(function (err) {
				res.status(500).send(err);
			})
		}
	}

  closeSituation(req, res) {
    SituationDAO.closeSituation(req.params.situationId)
      .then(function (data) {
        res.status(200).send(data);
      })
      .catch(function (err) {
        res.status(500).send(err);
      });
  }

  getAffectedUserList(req, res) {
    SituationDAO.getAffectedUserList(req.params.situationId)
      .then(function (affectedList) {
        res.status(200).send(affectedList);
      })
      .catch(function (err) {
        res.status(500).send(err);
      });
  }

  updateAffectedUserList(req, res) {
    SituationDAO.updateAffectedUserList(req.params.situationId, req.body.userId)
      .then(function (situation) {
        res.status(200).send(situation);
      })
      .catch(function (err) {
        res.status(500).send(err);
      });
  }

  getSituationsWhileOffline (req, res) {
    let userId = req.params.userId;
    let userLocation = req.query;
    userLocation.longitude = parseFloat(userLocation.longitude);
    userLocation.latitude = parseFloat(userLocation.latitude);
    UserDAO.getLastLogoutForUser(userId)
    .then(function (user) {
      SituationDAO.getSituationsAfterDate(user.lastLogout, userLocation)
        .then(function (situations) {
          res.status(200).send(situations);
        })
        .catch(function (err) {
          res.status(500).send(err);
        });
    })
    .catch(function (err) {
      res.status(500).send(err);
    });
  }

  getNearbySituations (req, res) {
    let userId = req.params.userId;

    UserDAO.getLastLocationById(userId)
    .then(user => {
      let userLocation = req.query;
      userLocation.longitude = parseFloat(user.location.coordinates[0]);
      userLocation.latitude = parseFloat(user.location.coordinates[1]);
      SituationDAO.getAllSituationByDistance(userLocation)
      .then(situations => {
        let situationsToSend = [];
        situations.forEach(sit => {
          if ((sit.distance && sit.affectedRadius && sit.distance < sit.affectedRadius) ||
             (!sit.affectedRadius && sit.distance <= 20)) {
            situationsToSend.push(sit);
          }
        });
        res.status(200).send(situationsToSend);
      })
    })
    .catch(err => res.status(500).send(err));
  }

};

module.exports = SituationController;