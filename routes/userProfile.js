'use strict';

var express = require('express');
var router = express.Router();
var userProfile = require('../controllers/userProfileController');
var userProfileController = new userProfile();

/* Get user personal info */
router.get('/personalInfo/:userId', userProfileController.getPersonalInfo);
/* Create or update user personal info */
router.post('/personalInfo', userProfileController.savePersonalInfo);

/* Get user Medical info */
router.get('/medicalInfo/:userId', userProfileController.getMedicalInfo);
/* Create or update user Medical info */
router.post('/medicalInfo', userProfileController.saveMedicalInfo);

/* Get all user Emergency Contacts */
router.get('/emergencyContacts/:userId', userProfileController.getAllEmergencyContacts);
/* Create or update user Emergency Contact */
router.post('/emergencyContacts/:userId', userProfileController.saveEmergencyContacts);

module.exports = router;