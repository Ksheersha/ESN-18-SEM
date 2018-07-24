let patientsListTitles = [$('#patientsListFirstTableTitle'), $('#patientsListSecondTableTitle'), $('#patientsListThirdTableTitle')];
let patientsListTables = [$('#patientsListFirstTableBody'), $('#patientsListSecondTableBody'), $('#patientsListThirdTableBody')];
let patientsListTitlesText = [];
let patients = [];

let getPatientsDirectoryHandler = {
  200: function (patientsFromDB) {
    patients = patientsFromDB;
    generatePatientsTable(patientsFromDB);
    generatePatientsClickHandler(patientsFromDB);
  },
  500: function () {
    showMessageModal('Error!', 'Sorry, there was an error retrieving patients directory. Please refresh the page and try again.')
  }
};

let updateBedStatusHandler = {
  500: function (err) {
    console.log("error while updating patient bed state", err);
    clickPatients(false);
    showMessageModal('Error!', 'Sorry, there was an error updating the bed status for this patient. Please try' +
      ' the page and try' +
      ' again.');
  }
}

function accessPatientDataFromDirectory(incidentId) {
  $('#incidentId').text(incidentId);
  showPatientPage();
}

function setPatientsListTitle() {
  patientsListTitlesText = [];
  if(isFirstResponder(role)) {
    patientsListTitlesText.push('To Take To ER');
    patientsListTitlesText.push('At ER');
    patientsListTitlesText.push('Others');
  } else if (isNurse(role)) {
    patientsListTitlesText.push('Beds Requested');
    patientsListTitlesText.push('Beds Ready');
    patientsListTitlesText.push('Beds Occupied');
  }
  for (let i = 0; i < 3; i++) {
    patientsListTitles[i].html(patientsListTitlesText[i]);
  }
}

function generatePatientsEntry(patient) {
  return '<tr id="patient-' + patient.incident + '" data-patientId="' + patient._id + '">' +
    '<td>' + patient.displayId +'</td>' +
    '<td>' + patient.priority +'</td>' +
    '<td><i class="material-icons md-24">chevron_right</i></td>' +
    '</tr>';
}

function generatePatientsClickHandler (patients) {
  for (let i = 0; i < 3; i++) {
    let type = patientsListTitlesText[i];
    if (patients[type]) {
      for (let k = 0; k < patients[type].length; k++) {
        $('#patient-' + patients[type][k].incident).click(function() {
          accessPatientDataFromDirectory(patients[type][k].incident);
        });
      }
    }
  }
}

function generatePatientsTable(patients) {
  for (let i = 0; i < patientsListTitlesText.length; i++) {
    let patientsTableHTML = '';
    let type = patientsListTitlesText[i];
    if (patients[type]) {
      for (let k = 0; k < patients[type].length; k++) {
        patientsTableHTML += generatePatientsEntry(patients[type][k]);
      }
    }
    if (patientsTableHTML == "") {
      patientsTableHTML = "<tr style='background-color: white;'><td></td><td></td><td></td></tr>"
    }
    patientsListTables[i].html(patientsTableHTML);
    initSortablePatients();
  }
}

function clickPatients(isBack = false) {
  if (isParamedic(role) || isNurse(role)) {
    refreshPage(isBack, PATIENTS_WINDOW_TITLE);
    setPatientsListTitle();
    getPatientsDirectoryHTTP(role, getPatientsDirectoryHandler);
    patientsDirectoryWindow.show();
  }
  if (isNurse(role)) {
    patientsListTables.forEach(table => table.addClass('sortable'));
  }
}

function findWithAttr(array, attr, value) {
  for(var i = 0; i < array.length; i += 1) {
    if(array[i][attr] === value) {
      return i;
    }
  }
  return -1;
}

function getArrayFromState (originState) {
  let state = "";
  if (originState === "patientsListFirstTableBody") state = 'Beds Requested';
  else if (originState === "patientsListSecondTableBody") state = 'Beds Ready';
  else if (originState === "patientsListThirdTableBody") state = 'Beds Occupied';
  return state;
}

function sortPatientByPriority(patientsToSort) {
  console.log("patientsToSort", patientsToSort);
  patientsToSort.sort(function (a, b) {
    if (a.priority == 'E') {
      return -1;
    } else {
      return 1;
    }
  });
}

function saveNewStateForPatientBed (patientId, newState) {
  $.ajax({
    url: "/patients/" + patientId + "/bedStatus",
    type: "PUT",
    data: {bedStatus: newState},
    statusCode: updateBedStatusHandler
  });
}

function movePatient (patientId, originState, destinationState) {
  let fromState = getArrayFromState(originState);
  let toState = getArrayFromState(destinationState);
  console.log(patients[fromState]);
  let patientIndex = findWithAttr(patients[fromState], "_id", patientId);
  console.log("patient index", patientIndex);
  let patient = patients[fromState][patientIndex];
  console.log(patient);
  patients[fromState].splice(patientIndex, 1);
  patients[toState].push(patient);

  sortPatientByPriority(patients[fromState]);
  sortPatientByPriority(patients[toState]);

  generatePatientsTable(patients);
  saveNewStateForPatientBed(patientId, toState);
}

function initSortablePatients () {
  let newList, oldList, item;
  $('#patients_directory_window .sortable').sortable({
    start: function(event, ui) {
      item = ui.item;
      newList = oldList = item.parent();
    },
    stop: function(event, ui) {
      let origin = oldList.attr('id');
      let destination = newList.attr('id');
      let patientId = $("#" + item[0].id).attr('data-patientId');
      console.log("before move patientId", patientId);
      movePatient(patientId, origin, destination);
    },
    change: function(event, ui) {
      if(ui.sender) {
        newList = ui.placeholder.parent();
      }
    },
    connectWith: ".sortable"
  }).disableSelection();
}

$(function() {
  patientsBtn.click(function() {
    clickPatients();
  });

  patientsTab.click(function() {
    clickPatients();
  });

  socket.on('reload patients directory', function() {
    if (currentWindow === PATIENTS_WINDOW_TITLE) {
      getPatientsDirectoryHTTP(role, getPatientsDirectoryHandler);
    }
  });
});