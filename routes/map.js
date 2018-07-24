var express = require('express');
var router = express.Router();
var MapController = require('../controllers/mapController');
var mapController = new MapController();

// GET Map Information
router.get('/', mapController.getMapInfo);

// POST a new location
router.post('/:userID/location', mapController.updateLocationInfo);

// POST a new phoneNumber
router.post('/:userID/phone', mapController.updatePhoneNumber);

// POST a new phoneNumber
router.post('/:userID/phone', mapController.updatePhoneNumber);

// Get utils.
router.get('/utils', mapController.getUtils);

// Create a new util.
router.post('/utils', mapController.createUtil);

// Remove a util.
router.delete('/utils/:utilId', mapController.removeUtil);

module.exports = router;
