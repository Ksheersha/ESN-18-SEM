'use strict';

let express = require('express');
let router = express.Router();
let AlertController = require('../controllers/alertController');
let alertController = new AlertController();

router.post('/', alertController.createAlertMessage);

router.get('/:alertId',alertController.getAlertMessage);

router.post('/list',alertController.updateAlertMessage);

module.exports = router;