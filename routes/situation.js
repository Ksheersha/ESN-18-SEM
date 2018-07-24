'use strict';

let express = require('express');
let router = express.Router();
let Situation = require('../controllers/situationController');
let situationController = new Situation();

/* Create new Situation info */
router.post('/', situationController.createNewSituation);

/* Update a Situation info */
router.put('/:situationId', situationController.updateSituationInfo);

/* Get one situation info */
router.get('/:situationId', situationController.getSituationInfo);

/* Get  all situation  */
router.get('/', situationController.getAllSituation);

/* Delete  a situation  */
router.put('/close/:situationId', situationController.closeSituation);

/* Get  list of affected users  */
router.get('/:situationId/affectedUsers', situationController.getAffectedUserList);

/* Add  affected users to the list */
router.put('/:situationId/affectedUsers', situationController.updateAffectedUserList);

/* Get situations while user was offline */
router.get('/offline/user/:userId', situationController.getSituationsWhileOffline);

/* Get nearby situations by user */
router.get('/nearby/user/:userId', situationController.getNearbySituations);
module.exports = router;