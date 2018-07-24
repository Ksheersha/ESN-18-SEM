let findHospitalPage = {};
findHospitalPage.DOMs = {};
findHospitalPage.states = {};
findHospitalPage.handlers = {};
findHospitalPage.functions = {};

/* Helper functions */
findHospitalPage.functions.showErrorModalForList = function (name) {
  showMessageModal('Error!', 'Sorry, there was an error retrieving ' + name + ' list. Please refresh the page and try again.');
};

findHospitalPage.functions.getHTMLForPatient = function (patient) {
  let highlightClass = '';
  if (patient.priority === 'E') {
    highlightClass = 'patient-highlighted';
  }
  return '<div id="find-hospital-' + patient._id + '"class="find-hospital-patient-list">'
    + '<li class="list-group-item ' + highlightClass + '"'
    + 'style="word-break: break-all">' + patient.displayId + '</li>'
    + '</div>';
};

findHospitalPage.functions.getHospitalDisplayInformation = function (hospital) {
  let distance =  Number(parseFloat(hospital.distance) / 1609.34).toFixed(1).toString();
  let beds = hospital.beds !== undefined ? hospital.beds.toString() : '?';
  return distance + ' M - ' + beds + ' beds'
};

findHospitalPage.functions.getHTMLForHospital = function (hospital) {
  let html = '<div class="card card-body">'
    + '<div class="card-header"><h5>' + hospital.hospitalName +'</h5>'
    + '<div id="find-hospital-hospitalInfo-' + hospital._id + '" class="text-center">' + findHospitalPage.functions.getHospitalDisplayInformation(hospital) + '</div></div>'
    + '<ul id="find-hospital-' + hospital._id + '"class="list-group list-group-flush sortable">';
  for (let i = 0; i < hospital.patients.length; i++) {
    html += findHospitalPage.functions.getHTMLForPatient(hospital.patients[i]);
  }
  html += '</ul><button class="btn btn-primary btn-raised" id="showNursesOfHospital-' + hospital._id + '">Nurses'
        + '<div class="ripple-container"></div></button>';
  html += '</div><div class="card-spacer"></div>';
  return html;
};

findHospitalPage.functions.getObjectId = function (elementId) {
  return elementId.substring(elementId.lastIndexOf('-') + 1);
};

findHospitalPage.functions.initSortablePatients = function () {
  let destinationList, originList, item;
  $('#find_hospital_window .sortable').sortable({
    start: function(event, ui) {
      item = ui.item;
      destinationList = originList = item.parent();
    },
    stop: function(event, ui) {
      let origin = findHospitalPage.functions.getObjectId(originList.attr('id'));
      let destination = findHospitalPage.functions.getObjectId(destinationList.attr('id'));
      let patientId = findHospitalPage.functions.getObjectId(item[0].id);
      findHospitalPage.functions.movePatients(patientId, origin, destination);
    },
    change: function(event, ui) {
      if(ui.sender) {
        destinationList = ui.placeholder.parent();
      }
    },
    connectWith: ".sortable"
  }).disableSelection();
};

findHospitalPage.functions.updateBedsNumber = function (hospitalId, delta) {
  let hospital = findHospitalPage.states.hospitals[hospitalId];
  if (hospital.beds !== undefined) {
    hospital.beds += delta;
    // If beds number is less than 0, the operation is not allowed
    if (hospital.beds < 0) {
      showMessageModal('Error!', 'You are not allowed to assign patient to this hospital. Bed is not enough in this hospital!');
    }
    // Refresh beds numbers
    let infoElement = $('#find-hospital-hospitalInfo-' + hospitalId);
    let currentInfo = infoElement.html();
    currentInfo = currentInfo.substring(0, currentInfo.indexOf('-') + 2);
    currentInfo += hospital.beds !== undefined ? hospital.beds.toString() : '?';
    currentInfo += ' beds';
    infoElement.html(currentInfo);
  }
};

findHospitalPage.functions.removeIfExists = function (item, list) {
  if (list.indexOf(item) > -1) {
    list.splice(list.indexOf(item), 1);
  }
};

findHospitalPage.functions.assignPatient = function (patientId, hospitalId) {
  let hospital = findHospitalPage.states.hospitals[hospitalId];
  findHospitalPage.functions.updateBedsNumber(hospitalId, -1);
  findHospitalPage.functions.removeIfExists(patientId, hospital.unassignList);
  if (hospital.assignList.indexOf(patientId) === -1 && hospital.initial.indexOf(patientId) === -1) {
    hospital.assignList.push(patientId);
  }
};

findHospitalPage.functions.unassignPatient = function (patientId, hospitalId) {
  let hospital = findHospitalPage.states.hospitals[hospitalId];
  findHospitalPage.functions.updateBedsNumber(hospitalId, 1);
  findHospitalPage.functions.removeIfExists(patientId, hospital.assignList);
  if (hospital.unassignList.indexOf(patientId) === -1 && hospital.initial.indexOf(patientId) > -1) {
    hospital.unassignList.push(patientId);
  }
};
