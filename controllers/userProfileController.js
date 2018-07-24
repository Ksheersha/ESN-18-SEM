'use strict';

var UserProfileDAO = require('../util/dao/userProfileDAO');
var searcher = require('../util/searcher');

/* Class UserProfileController */
class UserProfileController {

	getPersonalInfo (req, res) {
		UserProfileDAO.getPersonalInfo(req.params.userId)
		.then(function (user) {
			res.status(200).send(user);
		})
		.catch(function (err) {
			res.status(500).send(err);
		});
	}

	savePersonalInfo (req, res) {
		UserProfileDAO.savePersonalInfo(req.body)
		.then(function () {
			res.status(200).end();
		})
		.catch(function (err) {
			res.status(500).send(err);
		});
	}

	getMedicalInfo (req, res) {
		UserProfileDAO.getMedicalInfo(req.params.userId)
		.then(function (user) {
			res.status(200).send(user);
		})
		.catch(function (err) {
			res.status(500).send(err);
		});
	}

	saveMedicalInfo (req, res) {
		UserProfileDAO.saveMedicalInfo(req.body)
		.then(function () {
			res.status(200).end();
		})
		.catch(function (err) {
			res.status(500).send(err);
		});
	}

	getAllEmergencyContacts (req, res) {
		UserProfileDAO.getAllEmergencyContacts(req.params.userId)
		.then(function (contacts) {
			res.status(200).send(contacts);
		})
		.catch(function (err) {
			res.status(500).send(err);
		});
	}

	saveEmergencyContacts (req, res) {
    UserProfileDAO.saveEmergencyContacts(req.params.userId, req.body.emergencyContacts)
		.then(function () {
			res.status(200).end();
		})
		.catch(function (err) {
			res.status(500).send(err);
		});
	}
};

module.exports = UserProfileController;