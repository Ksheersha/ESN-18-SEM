"use strict";

var express = require('express');
var router = express.Router();
var resource = require('../controllers/resourceController');
var ResourceController = new resource();

router.put('/', ResourceController.updateResources);
router.get('/', ResourceController.getResources);

router.get('/personnel/:incidentId', ResourceController.findPersonnelForIncident);
router.get('/deallocate/:incidentId', ResourceController.deallocateResourcesForIncident);

module.exports = router;