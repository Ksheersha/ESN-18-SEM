let step1button = $("#step1button");
let step2button = $("#step2button");
let step3button = $("#step3button");
let step4button = $("#step4button");
let step4buttonright = $("#step4buttonright");
let step5button = $("#step5button");
let step1card = $("#step1card");
let step2card = $("#step2card");
let step3card = $("#step3card");
let step4card = $("#step4card");
let step5card = $("#step5card");
let nextIncidentStepButton = $('#nextIncidentStepButton');
let prevIncidentStepButton = $('#prevIncidentStepButton');

let getIncidentDisplayHandler = {
  200: function (incident) {
    $('#step1title').text('Incident ID: ' + incident.displayId);
  },
  500: function () {
    showMessageModal("Error!", "There was an error. Please try again.");
  }
};

function displayIncidentId() {
  $.ajax({
    url: "/incidents/display/" + incidentId,
    type: "GET",
    statusCode: getIncidentDisplayHandler
  });
}

function displayStepperForNonResponseTeam() {
  step4buttonright.hide();
  step5button.hide();
}

function deactivateSteps() {
  for (i = 1; i < 6; i++) {
    $("#step" + i + "button").removeClass("active-step");
  }
}

function hideAllCards() {
  for (i = 1; i < 6; i++) {
    $("#step" + i + "card").hide();
  }
}

function makeStepActive(stepNumber) {
  clearPrevNextEventListeners();
  deactivateSteps();
  hideAllCards();
  $("#step" + stepNumber + "button").addClass("active-step");
  $("#step" + stepNumber + "card").show();
  showStepArrows(stepNumber);
  clickSteps(stepNumber);
}

function loadExistingData(stepNumber) {
  switch (stepNumber) {
    case 1:
      if(!isCitizen(role) && !isAdministrator(role)) {
        displayIncidentId();
      }
      getIncidentAddress();
      break;
    case 2:
      getIncidentType();
      break;
    case 3:
      getQuestionsForEmergency();
      getAnswers();
      break;
    case 5:
      getIncidentInfoForStep5();
      $('#groupResponders').hide();
      break;
  }
}

function clearPrevNextEventListeners() {
  nextIncidentStepButton.unbind();
  prevIncidentStepButton.unbind();
}

function showStep(stepNumber) {
  makeStepActive(stepNumber);
  loadExistingData(stepNumber);
}

function renderStep(stepNumber) {
  return function () {
    showStep(stepNumber);
  }
}

function clickSteps(stepNumber) {
  nextIncidentStepButton.click(function () {
    if (stepNumber == 5) {
      showStep(stepNumber);
    }
    else {
      showStep(stepNumber + 1);
    }
  });
  prevIncidentStepButton.click(function () {
    if (stepNumber == 1) {
      showStep(stepNumber);
    }
    else {
      showStep(stepNumber - 1);
    }
  });
}

function showStepArrows(stepNumber) {
  switch (stepNumber) {
    case 1:
      prevIncidentStepButton.hide();
      nextIncidentStepButton.show();
      break;
    case 4:
      prevIncidentStepButton.show();
      if (!step5button.is(':visible')) {
        nextIncidentStepButton.hide();
      }
      else {
        nextIncidentStepButton.show();
      }
      break;
    case 5:
      prevIncidentStepButton.show();
      nextIncidentStepButton.hide();
      break;
    default:
      prevIncidentStepButton.show();
      nextIncidentStepButton.show();
  }
}

