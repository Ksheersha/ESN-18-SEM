'use strict';

const IncidentDAO = require('../util/dao/incidentDAO');
const IncidentAnswerDAO = require('../util/dao/incidentAnswerDAO');
const IncidentResponderDAO = require('../util/dao/incidentResponderDAO');
const searcher = require('../util/searcher');
const dbUtil = require('../util/dbUtil');
const Incident = dbUtil.getModel('Incident');
const User = dbUtil.getModel('User');
const IncidentAnswer = dbUtil.getModel('IncidentAnswer');

function createIncidentNonResponder(callerId, res) {
  IncidentDAO.getOpenIncidentForNonResponder(callerId)
  .then(function (openIncidents) {
    if (openIncidents.length < 1) {
      IncidentDAO.createNewIncident(callerId)
      .then(function (incident) {
        res.status(201).send({incidentId: incident._id, callerId: incident.callerId, creatorId: incident.creatorId, displayId: incident.displayId});
      })
      .catch(function (err) {
        res.status(500).end();
      });
    } else {
      // there already exists an open incident.
      res.status(200).send({incidentId: openIncidents[0]._id, displayId: openIncidents[0].displayId});
    }
  })
  .catch(function (err) {
    res.status(500).send(err);
  });
}

function createIncidentResponder(userId, res) {
  IncidentResponderDAO.getOpenIncidentForFirstResponder(userId)
  .then(function (openIncidents) {
    if (openIncidents.length < 1) {
      IncidentResponderDAO.createNewIncidentFirstResponder(userId)
      .then(function (incident) {
        res.status(201).send({incidentId: incident._id, callerId: incident.callerId, creatorId: incident.creatorId});
      });
    } else {
      // there already exists an open incident.
      res.status(200).send({incidentId: openIncidents[0]._id, displayId: openIncidents[0].displayId});
    }
  })
  .catch(function (err) {
    res.status(500).send(err);
  });
}

/* Class IncidentController */
class IncidentController {
  createNewIncident (req, res) {
    if ((req.body.role === 'Citizen') || (req.body.role === 'Administrator')) {
      createIncidentNonResponder(req.body.callerId, res);
    } else {
      createIncidentResponder(req.body.userId, res);
    }
  }

  updateIncidentLocation (req, res) {
    let location = {
      latitude: req.body.latitude,
      longitude: req.body.longitude
    };

    IncidentDAO.updateIncidentLocation(req.body.incidentId, req.body.address, location)
      .then(function (incident) {
        res.status(200).send(incident);
      })
      .catch(function (err) {
        res.status(500).send(err);
      });
  }

  getIncidentLocation (req, res) {
    IncidentDAO.getIncidentLocation(req.params.incidentId)
      .then(function (incident) {
        res.status(200).send(incident);
      })
      .catch(function (err) {
        res.status(500).send(err);
      });
  }

  updateIncidentType (req, res) {
    IncidentDAO.updateIncidentType(req.body.incidentId, req.body.emergencyType)
      .then(function (incident) {
        res.status(200).send(incident);
      })
      .catch(function (err) {
        res.status(500).send(err);
      });
  }

  getIncidentType (req, res) {
    IncidentDAO.getIncidentType(req.params.incidentId)
      .then(function (incident) {
        res.status(200).send(incident);
      })
      .catch(function (err) {
        res.status(500).send(err);
      });
  }

  updateAnswer (req, res) {
    let answerInfo = JSON.parse(req.body.answerInfo);
    IncidentAnswerDAO.saveAnswerInfo(req.body.incidentId, answerInfo)
      .then(function (answer) {
        res.status(200).send(answer);
      })
      .catch(function (err) {
        res.status(500).send(err);
      });
  }

  getAnswer (req, res) {
    IncidentAnswerDAO.getAnswerInfo(req.params.incidentId)
      .then(function (answer) {
        res.status(200).send(answer);
      })
      .catch(function (err) {
        res.status(500).send(err);
      });
  }

  emitEventForStepThree (req, res) {
    global.io.emit('Dispatcher opened step 3', req.params.incidentId);
  }

  getIncidentInfoForStep5 (req, res) {
    IncidentResponderDAO.getIncidentInfoForStep5(req.params.incidentId)
      .then(function (incident) {
        res.status(200).send(incident);
      })
      .catch(function (err) {
        res.status(500).send(err);
      });
  }

  updateIncidentPriority (req, res) {
    IncidentResponderDAO.updateIncidentPriority(req.body.incidentId, req.body.priority)
      .then(function (incident) {
        res.status(200).send(incident);
      })
      .catch(function (err) {
        res.status(500).send(err);
      });
  }

  getIncidentDisplayId (req, res) {
    IncidentDAO.getIncidentDisplayId(req.params.incidentId)
      .then(function (displayId) {
        let incidentDisplayId = {
          displayId: displayId
        };
        res.status(200).send(incidentDisplayId);
      })
      .catch(function (err) {
        res.status(500).send(err);
      });
  }

  updateIncidentState (req, res) {
    IncidentResponderDAO.updateIncidentState(req.body.incidentId)
      .then(function (incident) {
        res.status(200).send(incident);
      })
      .catch(function (err) {
        res.status(500).send(err);
      });
  }

  updateIncidentCommander (req, res) {
    IncidentResponderDAO.updateIncidentCommander(req.body.incidentId, req.body.commanderId)
      .then(function (incident) {
        global.io.emit('Incident assignee changed', JSON.stringify(incident));
        res.status(200).send(incident);
      })
      .catch(function (err) {
        res.status(500).send(err);
      });
  }

  updateIncidentDispatcherGroupId (req, res) {
    IncidentResponderDAO.updateIncidentDispatcherGroupId(req.body.incidentId, req.body.dispatcherGroupId)
      .then(function (incident) {
        res.status(200).send(incident);
      })
      .catch(function (err) {
        res.status(500).send(err);
      });
  }

  updateIncidentResponderGroupId (req, res) {
    IncidentResponderDAO.updateIncidentResponderGroupId(req.body.incidentId, req.body.responderGroupId)
      .then(function (incident) {
        res.status(200).send(incident);
      })
      .catch(function (err) {
        res.status(500).send(err);
      });
  }

  getIncidentsForDispatcher (req, res) {
    let dispatcherId = req.params.dispatcherId;
    let incidents = {};
    IncidentResponderDAO.getIncidentsForDispatcher(dispatcherId, Incident.incidentState.WAITING)
      .then(function (waitingIncidentsForDispatcher) {
        incidents.waitingIncidents = waitingIncidentsForDispatcher;
        IncidentResponderDAO.getIncidentsForDispatcher(dispatcherId, Incident.incidentState.TRIAGE)
          .then(function (triageIncidents) {
            incidents.triageIncidents = triageIncidents;
            IncidentResponderDAO.getIncidentsForDispatcher(dispatcherId, Incident.incidentState.ASSIGNED)
              .then(function (assignedIncidents) {
                incidents.assignedIncidents = assignedIncidents;
                IncidentResponderDAO.getIncidentsForDispatcher(dispatcherId, Incident.incidentState.CLOSED)
                  .then(function (closedIncidents) {
                    incidents.closedIncidents = closedIncidents;
                    res.status(200).send(incidents);
                  });
              });
          });
      })
      .catch(function (err) {
        console.log('error while getIncidentsForDispatcher', err);
        res.status(500).send(err);
      });
  }

  getIncidentsForFirstResponder (req, res) {
    let responderId = req.params.responderId;
    let incidents = {};

    IncidentResponderDAO.getOpenIncidentForFirstResponder(responderId)
      .then(function (responderIncidents) {
        incidents.myIncidents = responderIncidents;
        IncidentResponderDAO.getOtherOpenIncidents(responderId)
          .then(function (otherOpenIncidents) {
            incidents.otherOpenIncidents = otherOpenIncidents;
            IncidentResponderDAO.getClosedIncidents()
              .then(function (closedIncidents) {
                incidents.closedIncidents = closedIncidents;

                // send the incidents
                res.status(200).send(incidents);
              });
          });
      })
      .catch(function (err) {
        res.status(500).send(err);
      });
  }

  getIncidentState (req, res) {
    IncidentResponderDAO.getIncidentState (req.params.incidentId)
      .then(function(incident) {
         res.status(200).send(incident);
      })
      .catch (function (err){
        res.status(500).send(err);
      });
  }

  responderClosedIncident (req,res) {
    IncidentResponderDAO.responderClosedIncident(req.params.incidentId)
      .then(function(incident) {
        res.status(200).send(incident);
      })
      .catch (function (err) {
        res.status(500).send(err);
      });
  }

  getOpenIncidents (req, res) {
    IncidentDAO.getAllOpenIncidents()
    .then (function (incidents) {
      res.status(200).send(incidents);
    })
    .catch (function (err) {
      res.status(500).send(err);
    })
  }

}

module.exports = IncidentController;
