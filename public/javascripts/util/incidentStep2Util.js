let fireTypeButton = $("#fireTypeButton");
let medicalTypeButton = $("#medicalTypeButton");
let policeTypeButton = $("#policeTypeButton");
var emergencyType = '';
let incident;

let saveIncidentTypeHandler = {
  200: function (incident) {
    showIncidentType(incident.emergencyType);
    emergencyType = incident.emergencyType;
    getQuestionsForEmergency();
  },
  500: function () {
    showMessageModal("Error!", "There was an error. Please try calling 911 again.");
  }
}

let getIncidentTypeHandler = {
  200: function (incident) {
    emergencyType = incident.emergencyType;
    showIncidentType(emergencyType);
    if ((isCitizen(role) && incident.state !== 0)) {
      makeReadOnly();
    }
    else if((incident.state===3) ||(isFirstResponder(role) && incident.commanderId!== id)) {
      disableEmergencyTypeEdit();
    }
  },
  500: function () {
    showMessageModal("Error!", "There was an error. Please try calling 911 again.");
  }
}

function makeReadOnly() {
  fireTypeButton.addClass("disabled");
  fireTypeButton.unbind();
  medicalTypeButton.addClass("disabled");
  medicalTypeButton.unbind();
  policeTypeButton.addClass("disabled");
  policeTypeButton.unbind();
}

function disableEmergencyTypeEdit() {
  fireTypeButton.addClass("disabled");
  fireTypeButton.attr('disabled','disabled');
  medicalTypeButton.addClass("disabled");
  medicalTypeButton.attr('disabled','disabled');
  policeTypeButton.addClass("disabled");
  policeTypeButton.attr('disabled','disabled');
}

function saveIncidentType(typeVal) {
  $.ajax({
    url: "/incidents/type",
    data: {
      'incidentId': incidentId,
      'emergencyType': typeVal
    },
    type: "PUT",
    statusCode: saveIncidentTypeHandler
  });
}

function getIncidentType () {
  $.ajax({
    url: "/incidents/incidentType/" + incidentId,
    type: "GET",
    statusCode: getIncidentTypeHandler
  });
}

function resetIncidentTypeButtons() {
  medicalTypeButton.removeClass("btn-success");
  medicalTypeButton.addClass("btn-primary");
  medicalTypeButton.removeAttr('disabled');
  medicalTypeButton.removeClass("disabled");
  fireTypeButton.removeClass("btn-success");
  fireTypeButton.addClass("btn-primary");
  fireTypeButton.removeAttr('disabled');
  fireTypeButton.removeClass("disabled");
  policeTypeButton.removeClass("btn-success");
  policeTypeButton.addClass("btn-primary");
  policeTypeButton.removeAttr('disabled');
  policeTypeButton.removeClass("disabled");
}

function showIncidentType(typeVal) {
  resetIncidentTypeButtons();
  switch (typeVal) {
    case 1:
      fireTypeButton.removeClass("btn-primary");
      fireTypeButton.addClass("btn-success");
      break;
    case 2:
      medicalTypeButton.removeClass("btn-primary");
      medicalTypeButton.addClass("btn-success");
      break;
    case 3:
      policeTypeButton.removeClass("btn-primary");
      policeTypeButton.addClass("btn-success");
      break;
  }
}
