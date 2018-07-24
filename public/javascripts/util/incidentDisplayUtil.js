function getIncidentTypeDisplay (incidentType) {
  let displayChar = '';
  switch (incidentType) {
    case 0:
      displayChar = ' ';
      break;
    case 1:
      displayChar = 'F';
      break;
    case 2:
      displayChar = 'M';
      break;
    case 3:
      displayChar = 'P';
      break
    default:
      displayChar = ' ';
  }
  return displayChar;
}

function generateTableContent (incidents, link) {
  let result = '';
  for (i = 0; i < incidents.length; i++) {
    let date = new Date(incidents[i].openingDateTime);
    incidents[i].displayDate = (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear() + ' ' + (date.getHours() +1) + ':' + date.getMinutes();
    result +=
      '<tr id="incident-' + incidents[i]._id + '">' +
        '<td>' + incidents[i].displayId + '</td>' +
        '<td>' + incidents[i].displayDate + '</td>' +
        '<td>' + getIncidentTypeDisplay(incidents[i].emergencyType) + '</td>' +
        '<td>' + (incidents[i].priority) + '</td>';
    if (link) {
      result += '<td><i class="material-icons md-24">chevron_right</i></td>';
    }
        
    result += '</tr>';
  }
  return result;
}

function generateClickHandlerForIncident (incident) {
  return function () {
    displayIncidentDetail(incident._id,incident.state);
  }
}

function generateIncidentClickHandlers(incidents) {
  for (i = 0; i < incidents.length; i++) {
    $("#incident-" + incidents[i]._id).click(generateClickHandlerForIncident(incidents[i]));
  }
}

// API calls for First Responders
let createIncidentResponseHandler = {
  200: function (result) {
    showMessageModal('Error!', 'There already is an open incident assigned to you. Please check Incident ' + result.displayId + '.');
  },
  201: function (incident) {
    hideAllWindows();
   $('#incidentId').html(incident.incidentId);
    incidentId = incident.incidentId;
    incidentWindow.show();
    displayIncidentId();
    initIncidentMap();
    showStep(1);
  },
  500: function () {
    showMessageModal('Error!', 'There was an error. Please try creating a new incident again.');
  }
}

function createIncidentFirstResponder (userId) {
  $.ajax({
    url: "/incidents",
    data: {
      'role': role,
      'userId': userId
    },
    type: "POST",
    statusCode: createIncidentResponseHandler
  });
}

function getIncidentsForRole (role, userId, callback) {
  $.ajax({
    url: "/incidents/" + role + "/" + userId,
    type: "GET",
    statusCode: {
      200: function (incidents) {
        callback(incidents);
      },
      500: function (err) {
        showMessageModal("Error!", "There was an error. Please try reloading the page.");
      }
    }
  });
}