/* DOMs */
findHospitalPage.DOMs.window = $('#find_hospital_window');
findHospitalPage.DOMs.patientsColumn = $('#find-hospital-patientsColumn');
findHospitalPage.DOMs.hospitalsColumn = $('#find-hospital-hospitalsColumn');
findHospitalPage.DOMs.patientsList = $('#find-hospital-patientList');
findHospitalPage.DOMs.hospitalsList = $('#find-hospital-hospitalList');
findHospitalPage.DOMs.cancelBtn = $('#find-hospital-cancelBtn');
findHospitalPage.DOMs.submitBtn = $('#find-hospital-submitBtn');
findHospitalPage.DOMs.patientPageFindHospitalBtn = $('#patientPageFindHospitalBtn');
findHospitalPage.DOMs.nurseBtns = {};

/* states */
findHospitalPage.states.responderId = id;

/*
* State 'hospitals' contains information for assignments/unassignments in current page.
* Format of this object is as follows:
*
*   findHospitalPage.states.hospitals = {
*     [hospitalId]: {
*       initial: [patientId list],
*       beds: integer,
*       assignList: [patientId list to be assigned to this hospital]
*       unassignList: [patientId list to be unassigned from this hospital]
*     }
*   }
*
* */
findHospitalPage.states.hospitals = {};

/* Ajax handlers */
findHospitalPage.handlers.getPatientsHandler = {
  200: function (patients) {
    findHospitalPage.functions.showList(patients, findHospitalPage.functions.getHTMLForPatient, findHospitalPage.DOMs.patientsList);
  },
  500: function () {
    findHospitalPage.functions.showErrorModalForList('patients');
  }
};

findHospitalPage.handlers.getHospitalsHandler = {
  200: function (hospitals) {
    findHospitalPage.functions.showList(hospitals, findHospitalPage.functions.getHTMLForHospital, findHospitalPage.DOMs.hospitalsList);
    findHospitalPage.functions.initHospitals(hospitals);
    findHospitalPage.functions.initNurseBtns();
  },
  500: function () {
    findHospitalPage.functions.showErrorModalForList('hospitals');
  }
};

findHospitalPage.handlers.updatePatientsHandler = {
  200: function () {
    findHospitalPage.load();
    showMessageModal('Success!', 'Successfully assigned patients!');
  },
  500: function () {
    showMessageModal('Error!', 'Fail to assign patients. Please try again.');
  }
};

/* Ajax functions */
findHospitalPage.functions.getPatientsAjax = function (responderId, handler) {
  $.ajax({
    url: '/patients/paramedic/' + responderId + '/findHospitalOrder',
    type: 'GET',
    statusCode: handler
  });
};

findHospitalPage.functions.getHospitalsAjax = function (responderId, handler) {
  $.ajax({
    url: '/hospitals/responder/' + responderId,
    type: 'GET',
    statusCode: handler
  });
};

findHospitalPage.functions.updatePatientsAjax = function (hospitals, handler) {
  $.ajax({
    url: '/hospitals/patients',
    data: JSON.stringify(hospitals),
    contentType: 'application/json',
    type: 'POST',
    statusCode: handler
  });
}

/* Other functions */
findHospitalPage.functions.showList = function(docs, getHTML, list) {
  let html = '';
  for (let i = 0; i < docs.length; i++) {
    html += getHTML(docs[i]);
  }
  list.html(html);
  findHospitalPage.functions.initSortablePatients();
};

findHospitalPage.functions.initHospitals = function (hospitals) {
  for (let i = 0; i < hospitals.length; i++) {
    findHospitalPage.states.hospitals[hospitals[i]._id] = {};
    findHospitalPage.states.hospitals[hospitals[i]._id].assignList = [];
    findHospitalPage.states.hospitals[hospitals[i]._id].unassignList = [];
    findHospitalPage.states.hospitals[hospitals[i]._id].initial = hospitals[i].patients.map(a => a._id.toString());
    findHospitalPage.states.hospitals[hospitals[i]._id].beds = hospitals[i].beds;
  }
};

findHospitalPage.functions.initNurseBtns = function () {
  findHospitalPage.DOMs.nurseBtns = $('[id^=showNursesOfHospital]');
  findHospitalPage.DOMs.nurseBtns.click(function () {
    let hospitalId = $(this).attr('id').split('-')[1];
    NursePage.functions.loadNursesOfHospital(hospitalId);
  })
};

findHospitalPage.functions.movePatients = function (patientId, origin, destination) {
  if (origin === destination) {
    return;
  }
  if (origin !== 'patientList') {
    findHospitalPage.functions.unassignPatient(patientId, origin);
  }
  if (destination !== 'patientList') {
    findHospitalPage.functions.assignPatient(patientId, destination);
  }
  console.log(findHospitalPage.states.hospitals);
};

findHospitalPage.functions.isBedsNumberValid = function () {
  for (let id in findHospitalPage.states.hospitals) {
    let hospital = findHospitalPage.states.hospitals[id];
    if (hospital.beds && hospital.beds < 0) {
      return false;
    }
  }
  return true;
};

/* page load function */
findHospitalPage.load = function (isBack = false) {
  refreshPage(isBack, FIND_HOSPITAL_WINDOW_TITLE);
  findHospitalPage.functions.getPatientsAjax(findHospitalPage.states.responderId, findHospitalPage.handlers.getPatientsHandler);
  findHospitalPage.functions.getHospitalsAjax(findHospitalPage.states.responderId, findHospitalPage.handlers.getHospitalsHandler);
  findHospitalPage.states.hospitals = {};
  findHospitalPage.DOMs.window.show();
};

$(function() {
  findHospitalBtn.click(function () {
    findHospitalPage.load();
  });

  findHospitalTab.click(function () {
    findHospitalPage.load();
  });

  findHospitalPage.DOMs.patientPageFindHospitalBtn.click(function () {
    findHospitalPage.load();
  });

  findHospitalPage.DOMs.submitBtn.click(() => {
    if (findHospitalPage.functions.isBedsNumberValid()) {
      findHospitalPage.functions.updatePatientsAjax(findHospitalPage.states.hospitals, findHospitalPage.handlers.updatePatientsHandler);
    }
    else {
      showMessageModal('Error!', 'Bed is not enough in some hospitals. Please check and assign to other hospitals!');
    }
  });

  findHospitalPage.DOMs.cancelBtn.click(() => {
    findHospitalPage.load();
  });

  socket.on('beds number in hospitals updated by nurse', function () {
    if (currentWindow === FIND_HOSPITAL_WINDOW_TITLE) {
      findHospitalPage.load();
    }
  });

  socket.on('alert related nurses for assignment', function (nurseIds) {
    let id = $('#id').html();
    if (nurseIds.indexOf(id) >= 0) {
      showMessageModal('Alert!', 'You have been assigned one or more new patients.');
    }
  });

});
