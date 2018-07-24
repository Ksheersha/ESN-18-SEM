let medicalQuestions = $('#medicalQuestions');
let fireQuestions = $('#fireQuestions');
let policeQuestions = $('#policeQuestions');
let modalGroup911Chat = $('#modalGroup911Chat');
let smokeFormDiv = $('#smokeFormDiv');
let seeSmokeYes = $('#seeSmokeYes');

// form for medical emergency
let patientForm = $('#patientForm');
let ageForm = $('#ageForm');
let sexForm = $('#sexForm');
let conscientForm = $('#conscientForm');
let smokeColor = $('#smokeColor');
let smokeQuantity = $('#smokeQuantity');
let breathingForm = $('#breathingForm');
let chiefComplaintForm = $('#chiefComplaintForm');
let patientsProfileForm = $('#patientsProfileForm');

// form for fire emergency
let flameForm = $('#flameForm');
let smokeForm = $('#smokeForm');
let fireInjuryForm = $('#fireInjuryForm');
let hazardousForm = $('#hazardousForm');
let peopleForm = $('#peopleForm');
let getOutForm = $('#getOutForm');

// form for police
let weaponForm = $('#weaponForm');
let weaponInjuryForm = $('#weaponInjuryForm');
let suspectDescriptionForm = $('#suspectDescriptionForm');
let suspectLeftForm = $('#suspectLeftForm');
let safeForm = $('#safeForm');
let crimeDetailForm = $('#crimeDetailForm');

let citizenPatientYes = $('#citizenPatientYes');
let citizenPatientNo = $('#citizenPatientNo');
let citizenAge = $('#citizenAge');
let citizenMale = $('#citizenMale');
let citizenFemale = $('#citizenFemale');
let citizenOther = $('#citizenOther');
let citizenConscientYes = $('#citizenConscientYes');
let citizenConscientNo = $('#citizenConscientNo');
let citizenSmokeYes = $('#citizenSmokeYes');
let citizenSmokeNo = $('#citizenSmokeNo');
let citizenBreathingYes = $('#citizenBreathingYes');
let citizenBreathingNo = $('#citizenBreathingNo');
let citizenChiefComplaint = $('#citizenChiefComplaint');
let citizenPatientsProfile = $('#citizenPatientsProfile');

let citizenFlameYes = $('#citizenFlameYes');
let citizenFlameNo = $('#citizenFlameNo');
let citizenFireInjuryYes = $('#citizenFireInjuryYes');
let citizenFireInjuryNo = $('#citizenFireInjuryNo');
let citizenHazardousYes = $('#citizenHazardousYes');
let citizenHazardousNo = $('#citizenHazardousNo');
let citizenPeople = $('#citizenPeople');
let citizenGetOutYes = $('#citizenGetOutYes');
let citizenGetOutNo = $('#citizenGetOutNo');

let citizenWeaponYes = $('#citizenWeaponYes');
let citizenWeaponNo = $('#citizenWeaponNo');
let citizenWeaponInjuryYes = $('#citizenWeaponInjuryYes');
let citizenWeaponInjuryNo = $('#citizenWeaponInjuryNo');
let citizenSuspectDescription = $('#citizenSuspectDescription');
let citizenSuspectVehicleDescription = $('#citizenSuspectVehicleDescription');
let citizenSuspectDirection = $('#citizenSuspectDirection');
let citizenSuspectLeftYes = $('#citizenSuspectLeftYes');
let citizenSuspectLeftNo = $('#citizenSuspectLeftNo');
let citizenSafeYes = $('#citizenSafeYes');
let citizenSafeNo = $('#citizenSafeNo');
let citizenCrimeDetail = $('#citizenCrimeDetail');

let treatPatientBtn = $('#treatPatientBtn');

let answers = {
  'patient': '',
  'sex': '',
  'citizenAge': '',
  'conscient': '',
  'smoke': '',
  'breathing': '',
  'citizenChiefComplaint': '',
  'citizenPatientsProfile': '',
  'flame': '',
  'fireInjury': '',
  'hazardous': '',
  'citizenPeople': '',
  'getOut': '',
  'weapon': '',
  'weaponInjury': '',
  'citizenSuspectDescription': '',
  'suspectLeft': '',
  'safe': '',
  'citizenCrimeDetail': ''
};

let dispatcherEventHandler = {
  200: function () {
    console.log('Emitted event for step 3');
  },
  500: function () {
    showMessageModal('Error!', 'There was an error. Please try again.');
  }
};

function updateAnswers (userPersonalInfo) {
  name.val(userPersonalInfo.name);
  var dateOfBirth = new Date(userPersonalInfo.dob);
  dob.val(dateOfBirth.getFullYear() + '-' + completeMonthOrDate(dateOfBirth.getMonth() + 1) + '-' + completeMonthOrDate(dateOfBirth.getDay()));
  setUserSex(userPersonalInfo.sex);
  address.val(userPersonalInfo.address);
  phone.val(userPersonalInfo.phoneNumber);
  email.val(userPersonalInfo.email);
}

function fillSmokeDetails (seeSmokeYes) {
  if (seeSmokeYes.value === 1) {
    $('#smokeFormDiv').show();
  } else {
    $('#smokeFormDiv').hide();
  }
}

function showQuestions (typeVal) {
  switch (typeVal) {
    case 1:
      hideAllForms();
      selectFire();
      break;
    case 2:
      hideAllForms();
      selectMedical();
      break;
    case 3:
      hideAllForms();
      selectPolice();
      break;
  }
}

function getQuestionsForEmergency () {
  generateQuestionAnswersForEmergency(emergencyType);
}

function generateQuestionAnswersForEmergency (emergencyTypeValue) {
  showQuestions(emergencyTypeValue);
  if (emergencyTypeValue === 1) {
    medicalQuestions.hide();
    fireQuestions.show();
    policeQuestions.hide();
  } else if (emergencyTypeValue === 2) {
    medicalQuestions.show();
    fireQuestions.hide();
    policeQuestions.hide();
  } else if (emergencyTypeValue === 3) {
    medicalQuestions.hide();
    fireQuestions.hide();
    policeQuestions.show();
  }
}

function displayQuestionsAnswers (typeVal) {
  switch (typeVal) {
    case 1:
      step3card.val('1');
      break;
    case 2:
      policeQuestions.remove();
      medicalQuestions.remove();
      break;
    case 3:
      fireQuestions.disable();
      medicalQuestions.disable();
      break;
  }
}

function makeReadOnlyStep3_4_5(incident) {
    if((incident.state===3)||(isFirstResponder(role) && incident.commanderId!== id)) {
      $('#incident_window input').attr('disabled', true);
      $('#incident_window textarea').attr('readonly', true);
      $('#incident_chat_content').attr('disabled',true);
      $('#incident_team_chat_content').attr('disabled',true);
      $('#commander').prop('disabled', true);
      $('#priority').prop('disabled', true);
    }
    else{
      $('#incident_window input').removeAttr('disabled');
      $('#incident_window textarea').attr('readonly', false);
      $('#incident_chat_content').removeAttr('disabled');
      $('#incident_team_chat_content').removeAttr('disabled');
    }
    if (isFirstResponder(role) && incident.commanderId!== id) {
      $('#chatWithResponders').prop('disabled', true);
      $('#allocateResourcesButton').prop('disabled', true);
      $('#closeIncidentButton').prop('disabled', true);
    }
    else {
      $('#allocateResourcesButton').removeAttr('disabled');
    }
}
