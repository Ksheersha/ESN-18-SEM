const dbUtil = require('../dbUtil');
const User = dbUtil.getModel('User');
const UserMedical = dbUtil.getModel('UserMedical');
const UserPersonal = dbUtil.getModel('UserPersonal');
const UserEmergencyContact = dbUtil.getModel('UserEmergencyContact');
const UserProfileHelper = require('../../helpers/userProfileHelper');
const async = require('async');

class UserProfileDAO {
    
  /* Personal information */
	static newUserPersonalInfo (personalInfoData) {
		if (personalInfoData.dob) {
			personalInfoData.dob = new Date(personalInfoData.dob);
		}
    return new UserPersonal ({
			name: personalInfoData.name,
			dob: personalInfoData.dob,
			sex: personalInfoData.sex,
			address: personalInfoData.address,
			phoneNumber: personalInfoData.phoneNumber,
			email: personalInfoData.email
		});
	}

	static updateUserPersonalInfo (user, personalInfoData) {
		user.name = personalInfoData.name;
		user.dob = personalInfoData.dob;
		user.sex = personalInfoData.sex;
		user.address = personalInfoData.address;
		user.phoneNumber = personalInfoData.phoneNumber;
		user.email = personalInfoData.email;
		return user;
	}

	static savePersonalInfo (userInfo) {
		return new Promise (function (resolve, reject) {
      UserProfileHelper.saveInformation (userInfo, UserPersonal,
        'personalInfo', UserProfileDAO.newUserPersonalInfo,
        UserProfileDAO.updateUserPersonalInfo)
      .then(function(personalInfo) {
        resolve(personalInfo)
      })
			.catch(function (err) {
				reject(err);
			});
		});
	}

	static getPersonalInfo (userId) {
		return new Promise (function (resolve, reject) {
      UserProfileHelper.findInformation(userId, UserPersonal, 'personalInfo')
      .then(function (userPersonalInfo) {
        resolve(userPersonalInfo);
      })
			.catch(function (err) {
				reject(err);
			});
		});
	}

	/* Medical Info */
	static newUserMedicalInfo (medicalInfoData) {
		return new UserMedical ({
			medCondition: medicalInfoData.medCondition,
			medDrugs: medicalInfoData.medDrugs,
			medAllergies: medicalInfoData.medAllergies
		});
	}
	
	static updateUserMedicalInfo(user, medicalInfoData) {
		user.medCondition = medicalInfoData.medCondition;
		user.medDrugs = medicalInfoData.medDrugs;
		user.medAllergies = medicalInfoData.medAllergies;
		return user;
	}

	static saveMedicalInfo (userInfo) {
    return new Promise (function (resolve, reject) {
      UserProfileHelper.saveInformation (userInfo, UserMedical,
        'medicalInfo', UserProfileDAO.newUserMedicalInfo,
        UserProfileDAO.updateUserMedicalInfo)
      .then(function(personalInfo) {
        resolve(personalInfo)
      })
      .catch(function (err) {
        reject(err);
      });
    });
	}

	static getMedicalInfo (userId) {
    return new Promise (function (resolve, reject) {
      UserProfileHelper.findInformation(userId, UserMedical, 'medicalInfo')
      .then(function (userPersonalInfo) {
        resolve(userPersonalInfo);
      })
      .catch(function (err) {
        reject(err);
      });
    });
	}

	/* Emergency contact */
	static newEmergencyContactInfo (ECInfo) {
		return new UserEmergencyContact ({
			name: ECInfo.name,
			phoneNumber: ECInfo.phoneNumber,
			email: ECInfo.email
		});
	}

	static deleteAllEmergencyContactsForUser (userId) {
		return new Promise (function (resolve, reject) {
			User.findOne({_id: userId})
			.then(function (user) {
				async.eachSeries(user.emergencyContacts, function (contact, cb) {
					UserEmergencyContact.remove({_id: contact})
					.then(function () {
						cb();
					})
				}, function () {
					user.emergencyContacts = [];
					user.save()
					.then(function () {
						resolve(user)
					})
				})
			})
			.catch(function (err) {
				reject(err);
			});
		});
	}

	static createNewEmergencyContactsForUser(userId, emergencyContacts) {
		return new Promise (function (resolve, reject) {
			User.findOne({_id:userId})
			.then(function (user) {
				let emergencyContactsCreated = [];
				async.each(emergencyContacts, function (contact, cb) {
					let emergencyContact = UserProfileDAO.newEmergencyContactInfo(contact);
					emergencyContact.save()
					.then(function (contactCreated) {
						emergencyContactsCreated.push(contactCreated);
						cb();
					});
				}, function () {
					user.update({emergencyContacts: emergencyContactsCreated})
					.then(function () {
						resolve(emergencyContactsCreated.sort());
					})
				})
			})
			.catch(function (err) {
				reject(err);
			});
		});
	}

	static saveEmergencyContacts (userId, emergencyContacts) {
		return new Promise (function (resolve, reject) {
			// parse object if needed
			// This is needed for testing purposes
			if (!(emergencyContacts instanceof Object)) {
			// if (typeof emergencyContacts != 'object') {
				emergencyContacts = JSON.parse(emergencyContacts);
			}

			if (!emergencyContacts.length) {
				resolve(null);
			} else {
				UserProfileDAO.deleteAllEmergencyContactsForUser(userId)
				.then(function () {
					UserProfileDAO.createNewEmergencyContactsForUser(userId, emergencyContacts)
					.then(function (emergencyContactsCreated) {
						resolve(emergencyContactsCreated);
					})
				})
				.catch(function (err) {
					reject(err);
				});		
			}
		});
	}

	static getAllEmergencyContacts (userId) {
		return new Promise (function (resolve, reject) {
			User.findOne({_id: userId}, "emergencyContacts")
			.populate("emergencyContacts")
			.then(function (user) {
				resolve(user.emergencyContacts.sort());
			})
			.catch(function (err) {
				reject(err);
			});
		});
	}
}

module.exports = UserProfileDAO;