function displayAnswer(value, first, second, third) {
  switch (value) {
    case '1':
      first.prop('checked', true);
      break;
    case '2':
      second.prop('checked', true);
      break;
    case '3':
      third.prop('checked', true);
      break;
    default:
      first.prop('checked', false);
      second.prop('checked', false);
  }
}

function showAnswerSmoke (smoke) {
  if(smoke === '1'){
    citizenSmokeYes.prop('checked', true);
    smokeFormDiv.show();
    smokeColor.val(answers.smokeColor);
    smokeQuantity.val(answers.smokeQuantity);
  } else if(smoke === '2'){
    citizenSmokeNo.prop('checked', true);
    smokeFormDiv.hide();
  }
}

let saveAnswersHandler = {
  200: function (answers) {
    showAnswers(answers);
    if (answers.patient === '1') {
      displayAnswersFromProfile();
    }
  },
  500: function () {
    showMessageModal("Error!", "There was an error. Please try calling 911 again.");
  }
};

function saveAnswers(answers) {
  let data = {
    incidentId: incidentId, 
    answerInfo: JSON.stringify(answers)
  };
  
  $.ajax({
    url: "/incidents/answer",
    data: data,
    type: "PUT",
    statusCode: saveAnswersHandler
  });
}

function showAnswers(answers){
  getIncidentState();
  getQuestionsForEmergency();
  displayAnswer(answers.patient, citizenPatientYes, citizenPatientNo);
  displayAnswer(answers.sex, citizenMale, citizenFemale, citizenOther);
  displayAnswer(answers.conscient, citizenConscientYes, citizenConscientNo);
  displayAnswer(answers.breathing, citizenBreathingYes, citizenBreathingNo);
  displayAnswer(answers.flame, citizenFlameYes, citizenFlameNo);
  displayAnswer(answers.fireInjury, citizenFireInjuryYes, citizenFireInjuryNo);
  displayAnswer(answers.hazardous, citizenHazardousYes, citizenHazardousNo);
  displayAnswer(answers.getOut, citizenGetOutYes, citizenGetOutNo);
  displayAnswer(answers.weapon, citizenWeaponYes, citizenWeaponNo);
  displayAnswer(answers.weaponInjury, citizenWeaponInjuryYes, citizenWeaponInjuryNo);
  displayAnswer(answers.suspectLeft, citizenSuspectLeftYes, citizenSuspectLeftNo);
  displayAnswer(answers.safe, citizenSafeYes, citizenSafeNo);
  showAnswerSmoke(answers.smoke);

  citizenChiefComplaint.text(answers.citizenChiefComplaint);
  citizenPatientsProfile.text(answers.citizenPatientsProfile);
  citizenSuspectDescription.text(answers.citizenSuspectDescription);
  citizenCrimeDetail.text(answers.citizenCrimeDetail);
  citizenAge.text(answers.citizenAge);
  citizenPeople.text(answers.citizenPeople);

  if (answers.patient === '1') {
    displayAnswersFromProfile();
  }
}

let getAnswersHandler = {
  200: function (answers) {
    showAnswers(answers);
  },
  500: function () {
    showMessageModal("Error!", "There was an error. Please try calling 911 again.");
  }
};

function getAnswers() {
  if(isDispatcher(role)) {
    $.ajax({
      url: "/incidents/dispatcherEvent/" + incidentId,
      type: "GET",
      statusCode: dispatcherEventHandler
    });
  }
  $.ajax({
    url: "/incidents/answer/" + incidentId,
    type: "GET",
    statusCode: getAnswersHandler
  });
}

function showForms (formsToShow) {
  for (let i = 0; i < formsToShow.length; i++) {
    formsToShow[i].show();
  }
}

function selectMedical() {
  hideAllForms();
  showForms([
    patientForm,
    ageForm,
    sexForm,
    conscientForm,
    breathingForm,
    chiefComplaintForm,
    patientsProfileForm
  ]);
}

function selectFire() {
  hideAllForms();
  showForms([
    flameForm,
    smokeForm,
    smokeFormDiv,
    fireInjuryForm,
    hazardousForm,
    peopleForm,
    getOutForm
  ]);
}

function selectPolice() {
  hideAllForms();
  showForms([
    weaponForm,
    weaponInjuryForm,
    suspectDescriptionForm,
    suspectLeftForm,
    safeForm,
    crimeDetailForm
  ]);
}

function hideAllForms() {
  patientForm.hide();
  ageForm.hide();
  sexForm.hide();
  conscientForm.hide();
  breathingForm.hide();
  chiefComplaintForm.hide();
  patientsProfileForm.hide();
  flameForm.hide();
  smokeForm.hide();
  smokeFormDiv.hide();
  fireInjuryForm.hide();
  hazardousForm.hide();
  peopleForm.hide();
  getOutForm.hide();
  weaponForm.hide();
  weaponInjuryForm.hide();
  suspectDescriptionForm.hide();
  suspectLeftForm.hide();
  safeForm.hide();
  crimeDetailForm.hide();
}
function getAgeFromDOB(birthday) {
  birthday = new Date(birthday);
  let ageDifMs = Date.now() - birthday.getTime();
  let ageDate = new Date(ageDifMs); // miliseconds from epoch
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

let displayPersonalInfoAnswersHandler = {
  200: function (userPersonal) {
    $("#citizenAnswerName").html($("#citizenAnswerName").html() + userPersonal.name);
    $("#citizenAnswerAddress").html($("#citizenAnswerAddress").html() + userPersonal.address);
    $("#citizenAnswerPhoneNumber").html($("#citizenAnswerPhoneNumber").html() + userPersonal.phoneNumber);
    $("#citizenAnswerPhoneNumber").attr('href', 'tel:' + userPersonal.phoneNumber);
    $("#citizenAnswerEmail").html($("#citizenAnswerEmail").html() + userPersonal.email);
    $("#citizenAnswerEmail").attr('href', 'mailto:' + userPersonal.email);
    displayAnswer(userPersonal.sex.toString(), citizenMale, citizenFemale, citizenOther);
    $("#citizenAge").val(getAgeFromDOB(userPersonal.dob));
  }
};
let displayMedicalInfoAnswersHandler = {
  200: function (userMedical) {
    $("#citizenAnswerMedicalAllergies").html("<b>Allergies: </b>" + userMedical.medAllergies);
    $("#citizenAnswerMedicalCondition").html("<b>Condition: </b>" + userMedical.medCondition);
    $("#citizenAnswerMedicalDrugs").html("<b>Drugs: </b>" + userMedical.medDrugs);
  }
};
let displayEmergencyContactsAnswersHandler = {
  200: function (userEmergencyContacts) {
    let contactsHtml = "";
    for (let i = 0; i < userEmergencyContacts.length; i++) {
      contactsHtml += "<b>Name: </b>" + userEmergencyContacts[i].name + "<br>";
      contactsHtml += "<b>Phone Number: </b><a href='tel:'\"" + userEmergencyContacts[i].phoneNumber + "\">" + userEmergencyContacts[i].phoneNumber + "</a><br>";
      contactsHtml += "<b>Email: </b><a href='mailto:'\"" + userEmergencyContacts[i].email + "\">" + userEmergencyContacts[i].email + "</a><br><hr>";
    }
    $("#citizenAnswerEmergencyContacts").html(contactsHtml);
  }
};
function displayAnswersFromProfile () {
  loadPersonalInfo(id, displayPersonalInfoAnswersHandler);
  loadMedicalInfo(id, displayMedicalInfoAnswersHandler);
  loadEmergencyContacts(id, displayEmergencyContactsAnswersHandler);
}
