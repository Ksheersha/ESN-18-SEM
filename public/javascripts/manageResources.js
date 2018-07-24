let bandageCurrentCount = $('#bandageCurrentCount');
let antibioticsCurrentCount = $('#antibioticsCurrentCount');
let painKillerCurrentCount = $('#painKillerCurrentCount');
let ointmentCurrentCount = $('#ointmentCurrentCount');
let aspirinCurrentCount = $('#aspirinCurrentCount');
let coldCompressCurrentCount = $('#coldCompressCurrentCount');
let sanitizerCurrentCount = $('#sanitizerCurrentCount');

let requestResourceButton = $('#submitButtonRequestResource');

function clickTruckResourcePage (isBack = false, state) {
  let id = isBack ? state.id : getTruckId();
  refreshPage(isBack, TRUCK_WINDOW_TITLE, {id: id});
  getTruck(id);
  setTruckPageTitle(id);
  requestResourceButton.prop('disabled', true); // Avoid early clicks.

  truckWindow.show();
}

function setTruckPageTitle (id) {
  let title = 'Truck Resource Inventory';
  $('#inventoryTitle').text(title);
}

function getTruck (id) {
  let getTruckResponseHandler = {
    200: function (truck) {
      setTruckId(truck._id);
      getTruckInventory(truck);
      disableRequestButtonIfNeeded(truck._id);
    },
    500: function () {
      showMessageModal('Error!', 'Truck does not exist. Please try again.');
    }
  };

  getTruckById(id, getTruckResponseHandler);
}

function getTruckInventory (truck) {
  let getInventoryResponseHandler = {
    200: function (inventory) {
      fillInventoryInfo(inventory);
      setRequestPageStates(truck, inventory);
    },
    500: function () {
      showMessageModal('Error!', 'Inventory does not exist. Please try again.');
    }
  };
  // let inventoryId = truck.inventory;
  setInventoryId(truck.inventory);
  getInventoryById(getInventoryId(), getInventoryResponseHandler);
}

function disableRequestButtonIfNeeded (truckId) {
  getResourceRequests(truckId, null, {
    200: requests => {
      let shouldDisable = false;

      for (let request of requests) {
        if (request.status !== 'on-truck') {
          shouldDisable = true;
          break;
        }
      }

      requestResourceButton.prop('disabled', shouldDisable);
    }
  });
}

function setInventoryId (id) {
  $('#inventoryId').text(id);
}

function getInventoryId () {
  return $('#inventoryId').text();
}

function fillInventoryInfo (inventory) {
  bandageCurrentCount.val(inventory.bandageCurrentCount);
  antibioticsCurrentCount.val(inventory.antibioticsCurrentCount);
  painKillerCurrentCount.val(inventory.painKillerCurrentCount);
  ointmentCurrentCount.val(inventory.ointmentCurrentCount);
  aspirinCurrentCount.val(inventory.aspirinCurrentCount);
  coldCompressCurrentCount.val(inventory.coldCompressCurrentCount);
  sanitizerCurrentCount.val(inventory.sanitizerCurrentCount);
}

function setRequestPageStates (truck, inventory) {
  requestResourcePage.states.truck = truck;
  requestResourcePage.states.inventory = inventory;
}

function getInventoryInfo () {
  return {
    inventoryId: getInventoryId(),
    bandageCurrentCount: $('#bandageCurrentCount').val(),
    antibioticsCurrentCount: $('#antibioticsCurrentCount').val(),
    painKillerCurrentCount: $('#painKillerCurrentCount').val(),
    ointmentCurrentCount: $('#ointmentCurrentCount').val(),
    aspirinCurrentCount: $('#aspirinCurrentCount').val(),
    coldCompressCurrentCount: $('#coldCompressCurrentCount').val(),
    sanitizerCurrentCount: $('#sanitizerCurrentCount').val()

  };
}

$(function () {
  let saveUpdateInventoryResponseHandler = {
    200: function (data) {
      setInventoryId(data._id);
      clickTruckResourcePage(false, data._id);
      showMessageModal('Successful!', 'Inventory information has been updated succesfully.');
    },
    500: function () {
      showMessageModal('Error!', 'Inventory information was not updated. Please try again.');
    }
  };

  function calcVal (currVal) {
    return (currVal - 1);
  }

  $('#bandageButton').click(function () {
    let bandageVal = $('#bandageCurrentCount').val();
    if (bandageVal == 0) {
      showMessageModal('Error!', 'Inventory count for this item is 0. Please request this item.');
      return false;
    } else {
      bandageCurrentCount.val(calcVal(bandageVal));
      saveUpdateInventoryInfo(getInventoryInfo(), saveUpdateInventoryResponseHandler);
      return false;
    }
  });

  $('#antibioticsButton').click(function () {
    let antibioticsVal = $('#antibioticsCurrentCount').val();
    if (antibioticsVal == 0) {
      showMessageModal('Error!', 'Inventory count for this item is 0. Please request this item.');
      return false;
    } else {
      antibioticsCurrentCount.val(calcVal(antibioticsVal));
      saveUpdateInventoryInfo(getInventoryInfo(), saveUpdateInventoryResponseHandler);
      return false;
    }
  });

  $('#painKillerButton').click(function () {
    let painKillerVal = $('#painKillerCurrentCount').val();
    if (painKillerVal == 0) {
      showMessageModal('Error!', 'Inventory count for this item is 0. Please request this item.');
      return false;
    } else {
      painKillerCurrentCount.val(calcVal(painKillerVal));
      saveUpdateInventoryInfo(getInventoryInfo(), saveUpdateInventoryResponseHandler);
      return false;
    }
  });

  $('#ointmentButton').click(function () {
    let ointmentVal = $('#ointmentCurrentCount').val();
    if (ointmentVal == 0) {
      showMessageModal('Error!', 'Inventory count for this item is 0. Please request this item.');
      return false;
    } else {
      ointmentCurrentCount.val(calcVal(ointmentVal));
      saveUpdateInventoryInfo(getInventoryInfo(), saveUpdateInventoryResponseHandler);
      return false;
    }
  });

  $('#aspirinButton').click(function () {
    let aspirinVal = $('#aspirinCurrentCount').val();
    if (aspirinVal == 0) {
      showMessageModal('Error!', 'Inventory count for this item is 0. Please request this item.');
      return false;
    } else {
      aspirinCurrentCount.val(calcVal(aspirinVal));
      saveUpdateInventoryInfo(getInventoryInfo(), saveUpdateInventoryResponseHandler);
      return false;
    }
  });

  $('#coldCompressButton').click(function () {
    let coldCompressVal = $('#coldCompressCurrentCount').val();
    if (coldCompressVal == 0) {
      showMessageModal('Error!', 'Inventory count for this item is 0. Please request this item.');
      return false;
    } else {
      coldCompressCurrentCount.val(calcVal(coldCompressVal));
      saveUpdateInventoryInfo(getInventoryInfo(), saveUpdateInventoryResponseHandler);
      return false;
    }
  });

  $('#sanitizerButton').click(function () {
    let sanitizerVal = $('#sanitizerCurrentCount').val();
    if (sanitizerVal == 0) {
      showMessageModal('Error!', 'Inventory count for this item is 0. Please request this item.');
      return false;
    } else {
      sanitizerCurrentCount.val(calcVal(sanitizerVal));
      saveUpdateInventoryInfo(getInventoryInfo(), saveUpdateInventoryResponseHandler);
      return false;
    }
  });

  requestResourceButton.click(() => {
    requestResourcePage.load();
  });
});
