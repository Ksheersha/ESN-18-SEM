const VALUE_FIELDS = [
  'displayId',
  'priority',
  'name',
  'dob',
  'age',
  'chiefComplaint',
  'condition',
  'drags',
  'allergies'
];

const RADIO_FIELDS = [
  'location',
  'sex',
  'conscious',
  'breathing'
];

fillHospitalNameHandler = {
  200: function (hospital) {
    $('#sectionHospital').text('Hospital: ' + hospital.hospitalName);
  },
  500: function () {
    showMessageModal('Error!', 'Hospital not found!');
  }
};

function getIncidentPatient (incidentId, done) {
  $.ajax({
    url: '/incidents/' + incidentId + '/patient',
    type: 'GET',
    success: done
  });
}

function updateIncidentPatient (incidentId, attrs, done) {
  $.ajax({
    url: '/incidents/' + incidentId + '/patient',
    type: 'PATCH',
    data: attrs,
    success: done
  });
}

function fieldSelector (field) {
  return '#patient_window [name="' + field + '"]';
}

function refreshPatientPage () {
  let incidentId = $('#incidentId').text();
  getIncidentPatient(incidentId, fillPatientForm);
}

function needFindHospital (patient) {
  return (patient.priority === 'E' || patient.priority === '1') && patient.location === 'road';
}

function fillPatientForm (patient) {
  for (let field of VALUE_FIELDS) {
    let value = patient[field];
    if(field === 'dob' && patient[field]) {value = moment(value).format('Y-MM-DD');}
    $(fieldSelector(field)).val(value);
  }

  for (let field of RADIO_FIELDS) {
    let value = patient[field];
    // Uncheck all the radios first, otherwise will do nothing if value = null.
    $(fieldSelector(field)).prop('checked', false);
    $(fieldSelector(field) + '[value="' + value + '"]').prop('checked', true);
  }

  if (patient.hospital != null) {
    getHospitalById(patient.hospital, fillHospitalNameHandler);
  }
  else {
    $('#sectionHospital').text('Hospital: None');
  }

  findHospitalPage.DOMs.patientPageFindHospitalBtn.show();
  if (!needFindHospital(patient) || !isFirstResponder(role) ) {
    findHospitalPage.DOMs.patientPageFindHospitalBtn.hide();
  }
}

function savePatientFormField (incidentId, fieldToSave, done) {
  let attrs = {};

  for (let field of VALUE_FIELDS) {
    if (field === fieldToSave) {
      attrs[field] = $(fieldSelector(field)).val();
      return updateIncidentPatient(incidentId, attrs, refreshPatientPage);
    }
  }

  for (let field of RADIO_FIELDS) {
    if (field === fieldToSave) {
      attrs[field] = $(fieldSelector(field) + ':checked').val();
      return updateIncidentPatient(incidentId, attrs, refreshPatientPage);
    }
  }
}

function unbindAutoSaves () {
  for (let field of VALUE_FIELDS) {
    $(fieldSelector(field)).off('input');
  }

  for (let field of RADIO_FIELDS) {
    $(fieldSelector(field)).off('change');
  }
}

function bindAutoSaves (incidentId) {
  for (let field of VALUE_FIELDS) {
    $(fieldSelector(field)).on('input', () => savePatientFormField(incidentId, field));
  }

  for (let field of RADIO_FIELDS) {
    $(fieldSelector(field)).change(() => savePatientFormField(incidentId, field));
  }
}

function showPatientPage (isBack = false, state) {
  unbindAutoSaves(); // Unbind previous autosaves.

  let incidentId = isBack ? state.incidentId : $('#incidentId').text();
  getIncidentPatient(incidentId, fillPatientForm);

  bindAutoSaves(incidentId); // Bind new autosaves.

  // Show the page and scroll to the top.
  refreshPage(isBack, PATIENT_WINDOW_TITLE, {incidentId: incidentId});
  patientWindow.show();
  window.scrollTo(0, 0);
}

$(() => {
  socket.on('patients assign/unassign to hospitals', function () {
    if (currentWindow === PATIENT_WINDOW_TITLE) {
      refreshPatientPage();
    }
  });
});
