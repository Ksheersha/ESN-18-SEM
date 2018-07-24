'use strict';

let express = require('express');
let router = express.Router();
let hospital = require('../controllers/hospitalController');
let hospitalController = new hospital();

// Get List of Hospitals
router.get('/', hospitalController.getAllHospitals);

//Get Nurses in hospital
router.get('/nurse/list',hospitalController.getNursesFromAllHospital);
router.get('/nurse/list/:id',hospitalController.getNursesDirectoryByHospitalId);

/* Get hospital info
router.get('/hospitals/:name', hospitalController.getHospital);*/

/* Create or update hospital info */

//router.post('/hospitals', hospitalController.saveUpdateHospitalInfo);

router.post('/', hospitalController.saveUpdateHospitalInfo);

router.get('/:id', hospitalController.getHospital);

router.get('/nurse/:id', hospitalController.getHospitalByNurseId);

router.delete('/:id', hospitalController.deleteHospital);

// Get Hospitals For Responder By Distance
router.get('/responder/:responderId', hospitalController.getHospitalsByResponderId);

router.post('/patients', hospitalController.updatePatients);

router.put('/beds', hospitalController.updateHospitalBeds);

module.exports = router;
