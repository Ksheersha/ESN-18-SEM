'use strict';

var express = require('express');
var router = express.Router();
var AreaController = require('../controllers/areaController');
var areaController = new AreaController();

/**
 * Get all areas
 */
router.get('/', areaController.getAllAreas);

module.exports = router;
