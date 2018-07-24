function showResourcePage(isBack = false) {
  refreshPage(isBack, RESOURCE_WINDOW_TITLE);
  getAreas();
  getOpenIncidents();
  getResources();
  resourceWindow.show();
}

function displayResources(resources) {
  let resourcesHtml = "";
  for (let i = 0; i < resources.length; i++) {
    resourcesHtml += getHtmlForResource(resources[i], "resource-" + i);
  }
  vehicleList.html(resourcesHtml);
}

function displayAreasOrIncidents(array) {
  let resultHtml = "";

  for (let i = 0; i < array.length; i++) {
    let name = "";
    if (array[i].name) {
      name = array[i].name;
    } else {
      name = array[i].displayId;
    }

    let html = "<div class='card'>";
    html += "<div id='" + array[i]._id + "-head' class='card-header'><h5>" + name + "</h5></div>";
    html += "<div id='" + array[i]._id + "' class='card-body sortable'>";
    html += "<ul class='list-group list-group-flush sortable'>";
    for (let j = 0; j < array[i].vehicles.length; j++) {
      html += getHtmlForResource(array[i].vehicles[j], "areaResource" + j);
    }
    html += "</div>";
    html += "</div><div class='card-spacer'></div>";
    resultHtml += html;
  }
  return resultHtml;
}

function displayAreas(areas) {
  areaList.html(displayAreasOrIncidents(areas));
}

function displayIncidents(incidents) {
  incidentList.html(displayAreasOrIncidents(incidents));
}

function addAllocatedVehicles (array, destinationArray, type) {
  for (let i = 0; i < array.length; i++) {
    for (let j = 0; j < array[i].vehicles.length; j++) {
      let vehicle = array[i].vehicles[j];
      let allocated = {
        kind: type,
        to: array[i]._id
      }
      vehicle.allocated = allocated;
      destinationArray.push(vehicle);
    }
  }
}

// goes through the areas and the incidents and assigns the correct information
// returns a list of only the newly allocated vehicles
function getAllocatedResources() {
  let allocatedVehicles = [];
  addAllocatedVehicles(areas, allocatedVehicles, "Area");
  addAllocatedVehicles(incidents, allocatedVehicles, "Incident");
  return allocatedVehicles;
}

// goes through the resources and assigns the correct information
// returns a list of only the deallocated vehicles
function getDeallocatedResources() {
  for (let i = 0; i < resources.length; i++) {
    let vehicle = resources[i];
    delete vehicle["allocated"];
  }
  return resources;
}

function getResources() {
  $.ajax({
    url: "/resource",
    type: "GET",
    statusCode: getResourcesHandler
  });
}

function getAreas() {
  let url = "";
  if (isFireChief(role) || isPoliceChief(role)) {
    url = "/organization/chief/" + id + "/areas";
  } else {
    url = "/areas"
  }
  $.ajax({
    url: url,
    type: "GET",
    statusCode: getAreasHandler
  });
}

function getOpenIncidents() {
  $.ajax({
    url: "/incidents/open",
    type: "GET",
    statusCode: getOpenIncidentsHandler
  });
}

function updateResources(resources) {
  $.ajax({
    url: "/resource",
    data: {
      resources: JSON.stringify(resources),
    },
    type: "PUT",
    statusCode: updateResourcesHandler
  });
}

function deallocateResourcesForIncident(incidentId) {
  $.ajax({
    url: "/resource/deallocate/" + incidentId,
    type: "GET",
    statusCode: {
      200: function () {
        console.log('Resources deallocated');
      },
      500: function () {
        showMessageModal("Error!", "Something went wrong when trying to close the incident. Please try again.");
      }
    }
  });
}

$(function () {
  submitResourcesBtn.click(function () {
    let newResources = [];
    newResources = newResources.concat(getAllocatedResources());
    newResources = newResources.concat(getDeallocatedResources());
    updateResources(newResources);
    createTeamGroupAjax();
  });

  cancelResourcesBtn.click(function () {
    resources = [];
    clickBackBtn();
  });
});
