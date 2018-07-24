let resources = [];
let areas = [];
let incidents = [];

// hardcoded values until we get woring areas
areas = [
  {
    name: "Area 1",
    _id: "5ac0290e2371396af88d3edf",
    vehicles: []
  },
  {
    name: "Area 2",
    _id: "5ac0290e2371396af88d3ee2",
    vehicles: []
  }
];

let vehicleList = $("#vehicleList");
let areaList = $("#areaList");
let incidentList = $("#incidentList");
let submitResourcesBtn = $('#submitResourcesBtn');
let cancelResourcesBtn = $('#cancelResourcesBtn');

function addVehicleToList(list, vehicle) {
  for (let i = 0; i < list.length; i++) {
    if (vehicle.allocated.to === list[i]._id) {
      list[i].vehicles.push(vehicle);
    }
  }
}

let getResourcesHandler = {
  200: function(resourcesInfo) {
    resources = [];
    for (let i = 0; i < areas.length; i++) {
      areas[i].vehicles = [];
    }
    for (let i = 0; i < incidents.length; i++) {
      incidents[i].vehicles = [];
    }
    for (let i = 0; i < resourcesInfo.length; i++) {
      let vehicle = resourcesInfo[i];
      if (!isPoliceChief(role) || (isPoliceChief(role) && vehicle.type != "truck")) {
        if (vehicle.allocated == null) {
          resources.push(vehicle);
        } else if (vehicle.allocated.kind === "Area") {
          addVehicleToList(areas, vehicle);
        } else {
          addVehicleToList(incidents,vehicle);
        }
      } else {
        continue;
      }
    }

    displayResources(resources);
    displayAreas(areas);
    displayIncidents(incidents);
    initSortableResources();
  },
  500: function () {
    showMessageModal("Error!", "Something went wrong when trying to get the resources. Please try again.");
  }
};

let getAreasHandler = {
  200: function(areasInfo) {
    areas = areasInfo;
  },
  500: function () {
    showMessageModal("Error!", "Something went wrong when trying to get the areas. Please try again.");
  }
};

let getOpenIncidentsHandler = {
  200: function(incidentsInfo) {
    incidents = incidentsInfo;
  },
  500: function () {
    showMessageModal("Error!", "Something went wrong when trying to get the open incidents. Please try again.");
  }
};

let updateResourcesHandler = {
  200: function () {
    showMessageModal("Success!", "The resources have been updated.");
  },
  500: function () {
    showMessageModal("Error!", "Something went wrong when trying to update the resources. Please try again.");
  }
};

function getHtmlForResource(resource) {
  let vehicleHtml = "<ul id='" + resource._id + "' class='list-group list-group-flush vehicle-list'>";
  vehicleHtml += "<li class='list-group-item active'>" + resource.name + "</li>";
  if (resource && resource.persons) {
    for (let j = 0; j < resource.persons.length; j++) {
      // vehicleHtml += "<li class='list-group-item'>" + resource.persons[j] + "</li>";
      vehicleHtml += "<li class='list-group-item'>" + resource.persons[j].username + "</li>"; // for when it is done properly
    }
  }
  vehicleHtml += "</ul>";
  return vehicleHtml;
}

function addResourceToDestination (resource, list, destinationId) {
  for (let i = 0; i < list.length; i++) {
    if (list[i]._id === destinationId) {
      list[i].vehicles.push(resource);
      sortResourcesBy(resources, "name");
    } else {
      continue;
    }
  }
}

function getResourceToMove (listToRemoveFrom, idOfObjectToRemove) {
  let resourceToMove = _.remove(listToRemoveFrom, function (resource) {
    return resource._id === idOfObjectToRemove;
  });
  return resourceToMove[0];
}

function allocateResource (resourceId, origin, destination) {
  let resourceToMove = getResourceToMove(origin, resourceId);
  addResourceToDestination(resourceToMove, areas, destination);
  addResourceToDestination(resourceToMove, incidents, destination);
}

function findListContainingResourceId (resourceId, list) {
  for (let i = 0; i < list.length; i++) {
    let resources = list[i].vehicles;
    let resource = _.find(resources, { '_id': resourceId });
    if (resource != null) {
      return list[i];
    } else {
      continue;
    }
  }
}

function sortResourcesBy(resources, key) {
  resources.sort(function (a, b) {
    if (a[key] < b[key]) {
      return -1;
    } else if (a[key] > b[key]) {
      return 1;
    } else {
      return 0;
    }
  });
}

function deallocateResource (resourceId, origin, destination) {
  let area = findListContainingResourceId(resourceId, areas);
  let resourceToMove = {};
  if (area == null) {
    let incident = findListContainingResourceId(resourceId, incidents);
    resourceToMove = getResourceToMove(incident.vehicles,resourceId);
  } else {
    resourceToMove = getResourceToMove(area.vehicles, resourceId);
  }
  destination.push(resourceToMove);
  sortResourcesBy(destination, "name");
}

function moveResource (resourceId, origin, destination) {
  if (origin == destination) {
    return;
  }
  if (origin === "vehicleList") {
    allocateResource(resourceId, resources, destination);
  } else {
    deallocateResource(resourceId, origin, resources);
  }
}

function initSortableResources () {
  let newList, oldList, item;
  $('#resource_window .sortable').sortable({
    start: function(event, ui) {
      item = ui.item;
      newList = oldList = item.parent();
    },
    stop: function(event, ui) {
      let origin = oldList.attr('id');
      let destination = newList.attr('id');
      let resourceId = item[0].id;
      moveResource(resourceId, origin, destination);
    },
    change: function(event, ui) {
      if(ui.sender) {
        newList = ui.placeholder.parent();
      }
    },
    connectWith: ".sortable"
  }).disableSelection();
}
// Drag and drop on mobile inspired by http://jsfiddle.net/39ZvN/9/
