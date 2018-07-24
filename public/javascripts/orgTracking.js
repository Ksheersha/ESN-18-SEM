/* PAGE OBJECT & LOAD STATES */
let orgTrackingPage = {};
orgTrackingPage.elements = {};
orgTrackingPage.states = {
  chiefId: undefined
};

/* MAP STATES */
let orgMap;
let mapLoaded = false;
let mapInfoWindow, mapCircle;

/* OTHER STATES */
let lastPosition;

/* EVENT SCHEDULER */
let locationCollector;

orgTrackingPage.load = function (chiefId) {
  orgTrackingPage.states.chiefId = chiefId;
  locateElements(orgTrackingPage.elements);
  let elements = orgTrackingPage.elements;
  elements.container.show();
  initMap();
  initMapGeoData(true);
};

function locateElements (elements) {
  elements.container = $('#org-tracking-map-window');
  elements.mapArea = $('#div-map-area');
  elements.listLayer = $('#org-tracking-list');
  elements.listLayerToggle = $('#org-tracking-list-trigger');
  elements.listLayerToggleButton = $('#map_tracking_trigger_button');
  elements.listLayerPeopleList = $('#org-people-list');
  elements.listLayerVehicleList = $('#org-vehicle-list');
}

function initMap () {
  if (mapLoaded) return;
  let goog = {lat: 37.4219999, lng: -122.0862515};
  orgMap = new google.maps.Map(document.getElementById('div-map-area'), {
    zoom: 13,
    center: goog,
    streetViewControl: false,
    fullscreenControl: false,
    zoomControl: false,
    mapTypeControl: false
  });
  mapInfoWindow = new google.maps.InfoWindow({content: ''});
  mapCircle = new google.maps.Circle({
    strokeColor: '#049eff',
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: '#049eff',
    fillOpacity: 0.1
  });
  mapLoaded = true;
}

function initMapGeoData (center) {
  getOrganizationByIdChief(orgTrackingPage.states.chiefId, function(res) {
    let geoJsonList = {
      'type': 'FeatureCollection',
      'features': []
    };
    let bounds = new google.maps.LatLngBounds();
    let persons = res.persons;
    let vehicles = res.vehicles;

    google.maps.event.clearListeners(orgMap.data, 'addfeature');
    if (center) {
      orgMap.data.addListener('addfeature', function (event) {
        bounds.extend(event.feature.getGeometry().get());
        orgMap.setCenter(bounds.getCenter());
        orgMap.fitBounds(bounds);
      });
    }
    orgTrackingPage.elements.listLayerPeopleList.empty();
    orgTrackingPage.elements.listLayerVehicleList.empty();
    persons.forEach(function (eachPerson) {
      if (validateGeoJSON(eachPerson.location)) {
        let type = eachPerson.role;
        geoJsonList.features.push(
          {
            'type': 'Feature',
            'properties': {
              'id': eachPerson._id,
              'isPersonnel': true,
              'type': type,
              content: eachPerson
            },
            'geometry': eachPerson.location
          });
        addUserToLayerList(orgTrackingPage.elements.listLayerPeopleList,
          eachPerson, true);
      } else {
        addUserToLayerList(orgTrackingPage.elements.listLayerPeopleList,
          eachPerson, false);
      }
    });

    // TODO: do the same thing as in person
    vehicles.forEach(function (eachVehicle) {
      if (validateGeoJSON(eachVehicle.location)) {
        let type = eachVehicle.type;
        geoJsonList.features.push(
          {
            'type': 'Feature',
            'properties': {
              'id': eachVehicle._id,
              'isPersonnel': false,
              'type': type,
              content: eachVehicle
            },
            'geometry': eachVehicle.location
          });
        addVehicleToLayerList(orgTrackingPage.elements.listLayerVehicleList,
          eachVehicle, true);
      } else {
        addVehicleToLayerList(orgTrackingPage.elements.listLayerVehicleList,
          eachVehicle, false);
      }
    });

    orgMap.data.addGeoJson(geoJsonList,
      {
        idPropertyName: 'id'
      });
    stylizeMapData();
    orgMap.data.addListener('click', onClickMarker);
  });
}

function buildOneInfoHTML (str) {
  return '<div style=\'font-size:13px; font-weight:normal\'>' +
    str + '</div>';
}

function buildChatHTML (user) {
  let html = '<a href="javascript:void(0);" onclick="showPrivateChatModal(this);">' +
    '<span> Chat </span>' +
    '<div class=\'page-hidden-info hidden-name\'>' + user.username + '</div>' +
    '<div class=\'page-hidden-info hidden-id\'>' + user._id + '</div>' +
    ' </a>';
  return html;
}

function joinArray (arr) {
  let str = arr.join(',');
  if (str === '') {
    str = 'None';
  }
  return str;
}

function buildPersonDetailInfoHTML (user) {
  let html = buildOneInfoHTML(getDisplayName(user) + buildChatHTML(user));
  let incident = [];
  let car = [];
  user.myIncidents.forEach(function (eachIncident) {
    incident.push(eachIncident.displayId);
  });
  html += buildOneInfoHTML('Incident: ' + joinArray(incident));
  user.vehicles.forEach(function (eachVehicle) {
    car.push(eachVehicle.name);
  });
  html += buildOneInfoHTML('Vehicle: ' + joinArray(car));
  return html;
}

function buildVehicleDetailInfoHTML (vehicle) {
  let html = buildOneInfoHTML(vehicle.name);
  let persons = [];
  let area = [];
  let incident = [];
  vehicle.persons.forEach(function (eachPerson) {
    persons.push(getDisplayName(eachPerson));
  });
  html += buildOneInfoHTML('Personnel: ' + joinArray(persons));
  if (vehicle.allocated && vehicle.allocated.to) {
    if (vehicle.allocated.kind === 'Area') {
      area.push(vehicle.allocated.to.name);
    } else {
      incident.push(vehicle.allocated.to.displayId);
    }
  }
  html += buildOneInfoHTML('Area: ' + joinArray(area));
  html += buildOneInfoHTML('Incident: ' + joinArray(incident));
  return html;
}

function addUserToLayerList (elem, user, haveLocation) {
  let disabled = haveLocation ? ' class="list-group-item-action"' : ' style=\'color:grey\'; ';
  elem.append('<a listType="personnel" featureId=' +
    user._id + disabled + '>' +
    getDisplayName(user) + '</a>');
}

function addVehicleToLayerList (elem, vehicle, haveLocation) {
  let disabled = haveLocation ? ' class="list-group-item-action"' : ' style=\'color:grey\';';
  elem.append('<a listType="vehicle" featureId=' +
    vehicle._id + disabled + '>' +
    vehicle.name + '</a>');
}

function onClickMarker (event) {
  if (event.feature.getProperty('isPersonnel') === true) {
    let thisPersonnel = event.feature.getProperty('content');
    getIncidentsForRole('firstResponder', thisPersonnel._id,
      function (incidents) {
        thisPersonnel.myIncidents = incidents.myIncidents;
        getVehicleByUserId(thisPersonnel._id, {
          200: function (vehicles) {
            thisPersonnel.vehicles = vehicles;
            setInfoWindow(buildPersonDetailInfoHTML(thisPersonnel),
              event.feature.getGeometry().get());
          }
        });
      });
  } else {
    let thisVehicle = event.feature.getProperty('content');
    getVehicleById(thisVehicle._id, {
      200: function (vehicle) {
        setInfoWindow(buildVehicleDetailInfoHTML(vehicle[0]),
          event.feature.getGeometry().get());
      }
    });

  }
}

function setInfoWindow (html, location) {
  mapInfoWindow.setContent(html);
  mapInfoWindow.setPosition(location);
  mapInfoWindow.setOptions({pixelOffset: new google.maps.Size(0, -50)});
  mapInfoWindow.open(orgMap);
}

function stylizeMapData () {
  orgMap.data.setStyle(function (feature) {
    let type = feature.getProperty('type');
    let icon = 'images/';
    if (type === 'Firefighter') {
      icon += 'firefighter.png';
    } else if (type === 'PatrolOfficer') {
      icon += 'policeman.png';
    } else if (type === 'truck') {
      icon += 'fire_truck.png';
    } else if (type === 'Paramedic') {
      icon += 'paramedic.png';
    } else {
      icon += 'police_car.png';
    }
    return {
      icon: {
        url: icon,
        scaledSize: new google.maps.Size(50, 50)
      }
    }
  });
}

function toggleOrgListLayer () {
  let listLayer = orgTrackingPage.elements.listLayer;
  let listLayerToggleButton = orgTrackingPage.elements.listLayerToggleButton;
  if (listLayer.is(':visible')) {
    listLayer.hide();
    listLayerToggleButton.text('add_box');
  } else {
    listLayer.show();
    listLayerToggleButton.text('indeterminate_check_box');
  }
}

function geolocateAndUpdate () {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      let geolocation = new google.maps.LatLng(position.coords.latitude,
        position.coords.longitude);
      let geoJson = {
        type: 'Point',
        coordinates: [geolocation.lng(), geolocation.lat()]
      };
      if (!lastPosition) {
        postLocationHTTP(id, geoJson);
      } else {
        let distance = google.maps.geometry.spherical.computeDistanceBetween(
          lastPosition, geolocation);
        if (distance > 10) {
          console.debug('Location updated with distance difference =' + distance);
          postLocationHTTP(id, geoJson);
        }
      }
      lastPosition = geolocation;
    });
  } else {
    // stop the timer
    window.clearInterval(locationCollector);
  }
}

function onClickListLayerItem () {
  let clickedFeatureId = $(this).attr('featureId');
  let selectedFeature = orgMap.data.getFeatureById(clickedFeatureId);
  orgMap.setCenter(selectedFeature.getGeometry().get());
  return false;
}

/* MAIN */
$(function () {
  locateElements(orgTrackingPage.elements);
  let elements = orgTrackingPage.elements;
  /* EVENT HANDLERS */
  elements.listLayerToggle.click(toggleOrgListLayer);
  elements.listLayerPeopleList.on('click', 'a.list-group-item-action', onClickListLayerItem);
  elements.listLayerVehicleList.on('click', 'a.list-group-item-action', onClickListLayerItem);

  /* EVENT SCHEDULER */
  locationCollector = window.setInterval(geolocateAndUpdate, 10000);

  /* SOCKET */
  socket.on('location updated', function () {
    if (mapLoaded) {
      orgMap.data.forEach((feature) => {
        // If you want, check here for some constraints.
        orgMap.data.remove(feature);
      });
      initMapGeoData(false);
    }
  });
});
