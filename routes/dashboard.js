"use strict";

var express = require('express');
var router = express.Router();
var dashboard = require('../controllers/dashboardController');
var DashboardController = new dashboard();

router.get('/:role', DashboardController.getDataForCharts);

module.exports = router;