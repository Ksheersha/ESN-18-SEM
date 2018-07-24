'use strict';

const express = require('express');
let router = express.Router();
const incident = require('../controllers/incidentController');
let IncidentController = new incident();

const PatientController = require('../controllers/patientController');
let patientController = new PatientController();

/* Create new incident */
router.post('/', IncidentController.createNewIncident);

/* Update the incident */
router.put('/location', IncidentController.updateIncidentLocation);
router.get('/location/:incidentId', IncidentController.getIncidentLocation);
router.put('/type', IncidentController.updateIncidentType);
router.get('/incidentType/:incidentId', IncidentController.getIncidentType);
router.get('/incidentInfo/:incidentId', IncidentController.getIncidentInfoForStep5);
router.put('/priority', IncidentController.updateIncidentPriority);
router.get('/display/:incidentId', IncidentController.getIncidentDisplayId);
router.put('/state', IncidentController.updateIncidentState);
router.put('/closedState/:incidentId',IncidentController.responderClosedIncident);
router.get('/state/:incidentId', IncidentController.getIncidentState);
router.put('/commander', IncidentController.updateIncidentCommander);

/* Update the dispatcher and responder group */
router.put('/dispatcherGroup', IncidentController.updateIncidentDispatcherGroupId);
router.put('/responderGroup', IncidentController.updateIncidentResponderGroupId);

router.get('/open', IncidentController.getOpenIncidents);

/* Update the questionaire of an incident */
router.put('/answer', IncidentController.updateAnswer);
router.get('/answer/:incidentId', IncidentController.getAnswer);

/* incidents for dispatchers */
router.get('/dispatcherEvent/:incidentId', IncidentController.emitEventForStepThree);
router.get('/dispatcher/:dispatcherId', IncidentController.getIncidentsForDispatcher);

/* incidents for first responders */
router.get('/firstResponder/:responderId', IncidentController.getIncidentsForFirstResponder);

// Operations on the patient of the incident.
router.get('/:incidentId/patient', patientController.getIncidentPatient);
router.patch('/:incidentId/patient', patientController.updateIncidentPatient);

module.exports = router;
