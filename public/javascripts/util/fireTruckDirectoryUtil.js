function clickFireTruckDirectory (isBack = false) {
  refreshPage(isBack, TRUCK_DIRECTORY_WINDOW_TITLE);
  truckDirectoryWindow.show();
  $('#truckDirectory').html('');

  if (isFireChief(role)) {
    getOrganizationByIdChief(id, onSuccess, onError);
  } else if (isFirefighter(role) || isParamedic(role)) {
    getVehicleByUserId(id, {200: function (vehicles) {
      let trucks = vehicles;
      for (let i = 0; i < trucks.length; i++) {
        appendTruck('#truckDirectory', trucks[i]);
      }
    }});
  }
  truckWindow.hide();
}

function onSuccess (response) {
  let vehicles = response.vehicles;
  for (let i = 0; i < response.vehicles.length; i++) {
    appendTruck('#truckDirectory', response.vehicles[i]);
  }
}

let onError = function () {
  showMessageModal('Error!', 'Truck information could not be loaded. Please try again.');
};
function appendTruck (elementID, truck) {
  let divStr = '';
  divStr += truckListing(truck);
  $(elementID.toString()).append(divStr);
}

function showTruck (element) {
  let id = $(element).find('.hidden-truckId').text();
  setTruckId(id);
  clickTruckResourcePage(false);
}

function setTruckId (id) {
  $('#truckId').text(id);
}

function getTruckId () {
  return $('#truckId').text();
}

function truckListing (truck) {
  let divStr = '';
  divStr += "<div class = 'card supply-card'><div class='row' onclick='showTruck(this);'><div class='col-10 card-title supplyName'>" + truck.name + '</div>';
  divStr += "<i class='col-2 pull-right material-icons md-24'>keyboard_arrow_right</i>";
  divStr += "<div class='page-hidden-info hidden-truckId'>" + truck._id + '</div>';
  return divStr;
}
