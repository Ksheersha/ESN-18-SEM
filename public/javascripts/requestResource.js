requestResourcePage.states.title = 'Request';

requestResourcePage.DOMs.window = $('#request_resource_window');
requestResourcePage.DOMs.requestResourceForm = $('#requestResourceForm');
requestResourcePage.DOMs.currentCounts = {};
requestResourcePage.DOMs.expectedCounts = {};
requestResourcePage.DOMs.checkboxes = {};
requestResourcePage.DOMs.hospitalSelect = $('#request-resource-hospital-select');

requestResourcePage.handlers.getHospitalsHandler = {
  200: function (hospitals) {
    requestResourcePage.functions.showHospitalDropdown(hospitals);
  },
  500: function () {
    showMessageModal('Error!', 'Sorry, there was an error retrieving the hospital list.');
  }
};

requestResourcePage.load = function (isBack = false, state = {}) {
  if (isBack) {
    requestResourcePage.states = state;
  } else {
    state = Object.assign(state, requestResourcePage.states);
  }
  refreshPage(isBack, requestResourcePage.states.title, state);

  requestResourcePage.functions.resetItemCounts();
  findHospitalPage.functions.getHospitalsAjax(id, requestResourcePage.handlers.getHospitalsHandler);

  requestResourcePage.DOMs.window.show();
};

$(function () {
  const ITEMS = ['bandage', 'antibiotics', 'pain-killer', 'ointment',
    'aspirin', 'cold-compress', 'sanitizer'];

  for (let item of ITEMS) {
    let suffix = '[name="' + item + '"]';
    requestResourcePage.DOMs.currentCounts[item] = $('.input-current' + suffix);
    requestResourcePage.DOMs.expectedCounts[item] = $('.input-expected' + suffix);
    requestResourcePage.DOMs.checkboxes[item] = $('.input-checkbox' + suffix);
  }

  requestResourcePage.functions.bindAutoSaves();
  requestResourcePage.functions.bindFormSubmit();

  socket.on('InventoryRequestCreatedAlert', displayId => {
    showMessageModal('New Inventory Request', displayId);
  });
});
