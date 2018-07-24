'use strict';

let express = require('express');
let router = express.Router();
let PatientController = require('../controllers/patientController');
let patientController = new PatientController();

router.get('/:role/:userId/patientsDirOrder', patientController.getPatientsForRole);
router.get('/paramedic/:paramedicId/findHospitalOrder', patientController.getPatientsForParamedicFindHospital);
router.put('/:patientId/bedStatus', patientController.updateBedStatus);
module.exports = router;
