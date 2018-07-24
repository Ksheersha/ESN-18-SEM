// input fields
let userId = $("#id");
let name = $("#name");
let dob = $("#dob");
let malePI = $("#malePI");
let femalePI = $("#femalePI");
let otherPI = $("#otherPI");
let address = $("#address");
let phone = $("#phone");
let email = $("#email");
let condition = $("#condition");
let drugs = $("#drugs");
let allergies = $("#allergies");
let addContactButton = $("#addContactButton");
let numberOfEmergencyContacts = 0;
let allEmergencyContacts = [];
function setUserSex(userSex) {
	switch (userSex) {
		case 1 || '1':
			malePI.prop('checked', true);
			break;
		case 2 || '2':
			femalePI.prop('checked', true);
			break;
		case 3 || '3':
			otherPI.prop('checked', true);
			break;
	};
}

function completeMonthOrDate (numb) {
    return (numb < 10 ? '0' : '') + numb;
}

function setPersonalInfo (userPersonalInfo) {
	name.val(userPersonalInfo.name);
	let dateOfBirth = new Date(userPersonalInfo.dob);
  let offsetHours = (new Date().getTimezoneOffset())/60;
  dateOfBirth.setHours(dateOfBirth.getHours() + offsetHours);
  let newDoB = dateOfBirth.getFullYear() + "-" + completeMonthOrDate(dateOfBirth.getMonth() + 1) + "-" + completeMonthOrDate(dateOfBirth.getDate());
	dob.val(newDoB);
	setUserSex(userPersonalInfo.sex);
	address.val(userPersonalInfo.address);
	phone.val(userPersonalInfo.phoneNumber);
	email.val(userPersonalInfo.email);
}

function setMedicalInfo (userMedicalInfo) {
	condition.val(userMedicalInfo.medCondition);
	drugs.val(userMedicalInfo.medDrugs);
	allergies.val(userMedicalInfo.medAllergies);
}

function generateOneEmergencyContactCard (userInfo,  index) {
	var result =
		'<div class="card"><h5 class-card-title> </h5>' +
			'<div class="card-body">' +
				'<div class="form-group">' +
					'<label for="ECname' + index + '">Name</label>' +
					'<input id="ECname' + index + '" type="text" aria-describedby="First and Last Name" class="form-control" value="' + userInfo.name + '"/>' +
				'</div>' +
				'<div class="form-group">' +
					'<label for="ECphone' + index + '">Phone</label>' +
					'<input id="ECphone' + index + '" type="text" aria-describedby="Phone Number" class="form-control" value="' + userInfo.phoneNumber + '"/>' +
					'<small id="ECPhoneHelp" class="form-text text-muted">(123) 456-7890</small>' +
				'</div>' +
				'<div class="form-group">' +
					'<label for="ECemail' + index + '">Email</label>' +
					'<input id="ECemail' + index + '" type="text" aria-describedby="Email" class="form-control" value="' + userInfo.email + '"/>' +
				'</div>' +
			'</div>' +
		'</div>' +
		'<div class="spacer"></div>';
	return result;
}

function addBlankCard() {
	var existingCards = getEmergencyContacts();
	var newContact = {
		name: '',
		phoneNumber: '',
		email: ''
	};

	allEmergencyContacts = [ newContact ];
	for (i = 0; i < existingCards.length; i++) {
		allEmergencyContacts.push(existingCards[i]);
	}
	setEmergencyContacts(allEmergencyContacts);
}

function getEmergencyContacts () {
	var result = [];
	for (i = 0; i < numberOfEmergencyContacts; i++) {
		var contact = {};
		contact.userId = userId.html();
		contact.name = $("#ECname" + i).val();
		contact.phoneNumber = $("#ECphone" + i).val();
		contact.email = $("#ECemail" + i).val();
		result.push(contact);
	}
	return result;
}

function setEmergencyContacts (emergencyContacts) {
	var result = "";
	numberOfEmergencyContacts = emergencyContacts.length;
	allEmergencyContacts = emergencyContacts;

	for(var i = 0; i < emergencyContacts.length ; i++) {
		result = result + generateOneEmergencyContactCard(emergencyContacts[i], i);
	}
	$("#cardsContainer").html(result);
}

function loadUserProfile () {
  loadPersonalInfo(id, {
    200: function (data) {
      setPersonalInfo(data);
    },
    500: function () {
      showMessageModal('Error!', 'Your personal information could not be loaded. Please try again.');
    }
  });
}

function loadUserMedical () {
  loadMedicalInfo(id, {
    200: function (data) {
      setMedicalInfo(data);
    },
    500: function () {
      showMessageModal('Error!', 'Your medical information could not be loaded. Please try again.');
    }
  });
}

function loadUserEmergencyContacts () {
  loadEmergencyContacts(id, {
    200: function (data) {
      setEmergencyContacts(data);
    },
    500: function () {
      showMessageModal('Error!', 'Your emergency contact could not be loaded. Please try again.');
    }
  });
}

function clickProfile(isBack = false) {
  refreshPage(isBack, PROFILE_WINDOW_TITLE);
  profileWindow.show();
  loadUserProfile();
  loadUserMedical();
  loadUserEmergencyContacts();
}

$(function () {
  profileTab.click(function () {
    clickProfile();
  });

	$('#modalEditUserProfile #profile-save').click(editUserProfileSaveHandler);
  $('#modalEditUserProfile #profile-username').keyup(editUserProfileUsernameKeyupHandler);
  $('#modalEditUserProfile #profile-password').keyup(editUserProfilePasswordKeyupHandler);
  $('#modalEditUserProfile #profile-role').change(editUserProfileRoleChangeHandler);
	
	let submitButton = $("#submitButtonProfile");
	let cancelButton = $("#cancelButtonProfile");

	function getUserSex () {
		if (malePI.prop('checked')) {
			return malePI.val();
		} else if (femalePI.prop('checked')) {
			return femalePI.val();
		} else if (otherPI.prop('checked')) {
			return otherPI.val();
		} else {
			return 0;
		}
	}

	function getPersonalInfo () {
		return {
			userId: userId.html(),
			name: name.val(),
			dob: dob.val(),
			sex: getUserSex(),
			address: address.val(),
			phoneNumber: phone.val(),
			email: email.val()
		};
	}

	function getMedicalInfo () {
		return {
			userId: userId.html(),
			medCondition: condition.val(),
			medDrugs: drugs.val(),
			medAllergies: allergies.val()
		};
	}

	let saveResponseHandler = {
    200: function () {
      showMessageModal("Successful!", "Your personal information has been saved succesfully.");
    },
    500: function () {
      showMessageModal("Error!", "Your personal information was not saved. Please try again.");
    }
  };

	submitButton.click(function () {
		var personalInfo = getPersonalInfo();
		var medicalInfo = getMedicalInfo();
		var emergencyContacts = getEmergencyContacts();
		savePersonalInfo(personalInfo, saveResponseHandler);
		saveMedicalInfo(medicalInfo, saveResponseHandler);
		saveEmergencyContacts(userId.html(), emergencyContacts, saveResponseHandler);
	});

	cancelButton.click(function () {
		loadUserProfile();
		loadUserMedical();
		loadUserEmergencyContact();
		$(window).scrollTop(0);
	});

	addContactButton.click(function () {
		addBlankCard();
	});
});
