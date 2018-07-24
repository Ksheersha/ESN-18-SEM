let requestResourcePage = {};
requestResourcePage.DOMs = {};
requestResourcePage.states = {};
requestResourcePage.handlers = {};
requestResourcePage.functions = {};

requestResourcePage.functions.currentCount = function (item) {
  return parseInt(requestResourcePage.DOMs.currentCounts[item].val());
};

requestResourcePage.functions.expectedCount = function (item) {
  return parseInt(requestResourcePage.DOMs.expectedCounts[item].val());
};

requestResourcePage.functions.countDifference = function (item) {
  let currentCount = requestResourcePage.functions.currentCount(item);
  let expectedCount = requestResourcePage.functions.expectedCount(item);

  return Math.max(expectedCount - currentCount, 0);
};

requestResourcePage.functions.updateCheckbox = function (item) {
  let countDifference = requestResourcePage.functions.countDifference(item);

  requestResourcePage.DOMs.checkboxes[item].prop('checked', countDifference > 0);
  requestResourcePage.DOMs.checkboxes[item].prop('disabled', countDifference <= 0);
};

requestResourcePage.functions.resetItemCounts = function () {
  inventory = requestResourcePage.states.inventory;

  currentCounts = requestResourcePage.DOMs.currentCounts;
  expectedCounts = requestResourcePage.DOMs.expectedCounts;
  checkboxes = requestResourcePage.DOMs.checkboxes;

  // Fill in counts.
  currentCounts['bandage'].val(inventory.bandageCurrentCount);
  expectedCounts['bandage'].val(inventory.bandageExpectedCount);

  currentCounts['antibiotics'].val(inventory.antibioticsCurrentCount);
  expectedCounts['antibiotics'].val(inventory.antibioticsExpectedCount);

  currentCounts['pain-killer'].val(inventory.painKillerCurrentCount);
  expectedCounts['pain-killer'].val(inventory.painKillerExpectedCount);

  currentCounts['ointment'].val(inventory.ointmentCurrentCount);
  expectedCounts['ointment'].val(inventory.ointmentExpectedCount);

  currentCounts['aspirin'].val(inventory.aspirinCurrentCount);
  expectedCounts['aspirin'].val(inventory.aspirinExpectedCount);

  currentCounts['cold-compress'].val(inventory.coldCompressCurrentCount);
  expectedCounts['cold-compress'].val(inventory.coldCompressExpectedCount);

  currentCounts['sanitizer'].val(inventory.sanitizerCurrentCount);
  expectedCounts['sanitizer'].val(inventory.sanitizerExpectedCount);

  // Fill in checkboxes.
  for (let item in checkboxes) {
    requestResourcePage.functions.updateCheckbox(item);
  }
};

requestResourcePage.functions.updateInventory = function () {
  inventory = requestResourcePage.states.inventory;
  inventory.inventoryId = inventory._id;

  console.log('Updating inventory...');
  console.log(inventory);

  saveUpdateInventoryInfo(inventory, {
    200: inventory => {
      console.log('Inventory updated: ', inventory);
    }
  });
};

requestResourcePage.functions.bindAutoSaves = function () {
  expectedCounts = requestResourcePage.DOMs.expectedCounts;

  expectedCounts['bandage'].on('input', () => {
    inventory.bandageExpectedCount = requestResourcePage.functions.expectedCount('bandage');
    requestResourcePage.functions.updateCheckbox('bandage');
    requestResourcePage.functions.updateInventory();
  });

  expectedCounts['antibiotics'].on('input', () => {
    requestResourcePage.states.inventory.antibioticsExpectedCount = requestResourcePage.functions.expectedCount('antibiotics');
    requestResourcePage.functions.updateCheckbox('antibiotics');
    requestResourcePage.functions.updateInventory();
  });

  expectedCounts['pain-killer'].on('input', () => {
    requestResourcePage.states.inventory.painKillerExpectedCount = requestResourcePage.functions.expectedCount('pain-killer');
    requestResourcePage.functions.updateCheckbox('pain-killer');
    requestResourcePage.functions.updateInventory();
  });

  expectedCounts['ointment'].on('input', () => {
    requestResourcePage.states.inventory.ointmentExpectedCount = requestResourcePage.functions.expectedCount('ointment');
    requestResourcePage.functions.updateCheckbox('ointment');
    requestResourcePage.functions.updateInventory();
  });

  expectedCounts['aspirin'].on('input', () => {
    requestResourcePage.states.inventory.aspirinExpectedCount = requestResourcePage.functions.expectedCount('aspirin');
    requestResourcePage.functions.updateCheckbox('aspirin');
    requestResourcePage.functions.updateInventory();
  });

  expectedCounts['cold-compress'].on('input', () => {
    requestResourcePage.states.inventory.coldCompressExpectedCount = requestResourcePage.functions.expectedCount('cold-compress');
    requestResourcePage.functions.updateCheckbox('cold-compress');
    requestResourcePage.functions.updateInventory();
  });

  expectedCounts['sanitizer'].on('input', () => {
    requestResourcePage.states.inventory.sanitizerExpectedCount = requestResourcePage.functions.expectedCount('sanitizer');
    requestResourcePage.functions.updateCheckbox('sanitizer');
    requestResourcePage.functions.updateInventory();
  });
};

requestResourcePage.functions.getHospitalDistance = function (hospital) {
  return Number(parseFloat(hospital.distance) / 1609.34).toFixed(1).toString();
};

requestResourcePage.functions.showHospitalDropdown = function (hospitals) {
  let html = '';
  let selected = 'selected="selected"';
  for (let i = 0; i < hospitals.length; i++) {
    if (i > 0) {
      selected = '';
    }
    html += '<option value="' + hospitals[i]._id + '" ' + selected + '>' +
      hospitals[i].hospitalName + ' - ' +
      requestResourcePage.functions.getHospitalDistance(hospitals[i]) + ' M' +
      '</option>';
  }
  requestResourcePage.DOMs.hospitalSelect.html(html);
};

requestResourcePage.functions.getHospitalId = function () {
  return requestResourcePage.DOMs.hospitalSelect.val();
};

requestResourcePage.functions.calculateRequestCounts = function () {
  let requestCounts = {};
  checkboxes = requestResourcePage.DOMs.checkboxes;

  for (let item in checkboxes) {
    if (!checkboxes[item].prop('checked')) continue;

    let countDifference = requestResourcePage.functions.countDifference(item);
    if (countDifference <= 0) continue;

    requestCounts[item] = countDifference;
  }

  return requestCounts;
};

requestResourcePage.functions.bindFormSubmit = function () {
  return requestResourcePage.DOMs.requestResourceForm.submit(event => {
    event.preventDefault();

    let requestCounts = requestResourcePage.functions.calculateRequestCounts();
    if (Object.keys(requestCounts).length === 0) {
      showMessageModal('Form Incomplete!', 'You have to select at least one item.');
      return;
    }

    let truckId = requestResourcePage.states.truck._id;
    let hospitalId = requestResourcePage.functions.getHospitalId();

    console.log('Submitting request...');
    console.log(truckId, hospitalId, requestCounts);
    postResourceRequests(truckId, hospitalId, requestCounts, {
      201: request => {
        console.log('Request created: ', request);
        clickBackBtn();
      },
      403: err => {
        showMessageModal('Unauthorized!', err.responseJSON.message);
      },
      404: err => {
        showMessageModal('Not Existed!', err.responseJSON.message);
      },
      409: err => {
        console.log(err);
        showMessageModal('Request Existed!', err.responseJSON.message);
      },
      422: err => {
        showMessageModal('Invalid Parameters!', err.responseJSON.message);
      }
    });
  });
};
