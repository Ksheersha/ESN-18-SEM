'use strict';

let express = require('express');
let router = express.Router();
let OrganizationController = require('../controllers/organizationController');

router.patch('/id/:vehicleId', OrganizationController.updateVehicle);
router.get('/truck/:id', OrganizationController.getTruckById);

router.get('/user/:userId', OrganizationController.getVehicleByUserId);
router.get('/id/:vehicleId', OrganizationController.getVehicleById);

module.exports = router;
