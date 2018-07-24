let emergencyAddress = $('#emergencyAddress');

let displayIncidentOnMap = function (location) {
  let map = new google.maps.Map(document.getElementById('incidentStep1Map'), {
    zoom: 15,
    center: {lat: location.latitude, lng: location.longitude}
  });
  let marker = new google.maps.Marker({
    position: { lat: location.latitude, lng: location.longitude },
    draggable: true,
    map: map });

  google.maps.event.addListener(marker, 'dragend', function (event) {
    let newLocation = { latitude: this.getPosition().lat(), longitude: this.getPosition().lng() };
    $.get("https://maps.googleapis.com/maps/api/geocode/json?latlng=" + this.getPosition().lat()
      + "," + this.getPosition().lng() + "&key=AIzaSyD8CxGINkAxCl4XTw0escUp9l7PM5hUfWg", function (data) {
      if (data.results && data.results.length) {
        newLocation.address = data.results[0].formatted_address;
      } else {
        newLocation.address = "";
      }
      saveIncidentAddress(newLocation);
    });
  });
};

let saveOrUpdateIncidentAddressHandler = {
  200: function (incident) {
    emergencyAddress.val(incident.address);
    displayIncidentOnMap(incident.location);
  },
  500: function () {
    showMessageModal('Error!', 'There was an error. Please try calling 911 again.');
  }
};

function incidentLocationIsValid(incident) {
  if (incident.location && incident.location.latitude && incident.location.longitude) {
    return true;
  } else {
    return false;
  }
}

function disableEmergencyAddress(incident) {
  if((isCitizen(role) && incident.state !== 0)||(incident.state === 3) ||(isFirstResponder(role) && incident.commanderId!== id)){
    return true;
  } else {
    return false;
  }
}

let getIncidentAddressHandler = {
  200: function (incident) {
    // getIncidentState();
    emergencyAddress.val(incident.address);
    if (incidentLocationIsValid(incident)) {
      displayIncidentOnMap(incident.location);
    }
    if(disableEmergencyAddress(incident)) {
      emergencyAddress.prop("disabled", true);
    } else {
      emergencyAddress.removeAttr('disabled');
      initIncidentMap();
      getLocation();
    }
  },
  500: function () {
    showMessageModal('Error!', 'There was an error. Please try calling 911 again.');
  }
};

function createIncident (userId, responseHandler) {
  $.ajax({
    url: '/incidents',
    data: {
      'role': role,
      'callerId': userId
    },
    type: 'POST',
    statusCode: responseHandler
  });
}

// Location and Map stuff
let autocomplete;
function initIncidentMap () {
  let input = document.getElementById('emergencyAddress');
  let incidentMapOptions = { componentRestrictions: {country: 'us'} };

  autocomplete = new google.maps.places.Autocomplete(input, incidentMapOptions);
  autocomplete.addListener('place_changed', function () {
    if (!isCitizen(role)) {
      updateIncidentAddressAsNonCitizen();
    } else {
      let locationLatLng = {};
      let place = autocomplete.getPlace();
      locationLatLng.address = place.formatted_address;
      locationLatLng.latitude = place.geometry.location.lat();
      locationLatLng.longitude = place.geometry.location.lng();
      saveIncidentAddress(locationLatLng);
    }
  });
}

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      let locationForMap = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      displayIncidentOnMap(locationForMap);
    });
  }
}


function saveIncidentAddress (newLocation) {
  $.ajax({
    url: '/incidents/location',
    data: {
      'incidentId': incidentId,
      'address': newLocation.address,
      'latitude': newLocation.latitude,
      'longitude': newLocation.longitude
    },
    type: 'PUT',
    statusCode: saveOrUpdateIncidentAddressHandler
  });
}

function updateIncidentAddressAsNonCitizen () {
  let place = autocomplete.getPlace();
  let address = place.formatted_address;
  let locationLatLng = place.geometry.location;
  locationLatLng.latitude = locationLatLng.lat();
  locationLatLng.longitude = locationLatLng.lng();
  console.log(locationLatLng);
  $.ajax({
    url: '/incidents/location',
    data: {
      'incidentId': incidentId,
      'address': address,
      'latitude': locationLatLng.lat(),
      'longitude': locationLatLng.lng()
    },
    type: 'PUT',
    statusCode: saveOrUpdateIncidentAddressHandler
  });
}

function getIncidentAddress () {
  $.ajax({
    url: '/incidents/location/' + incidentId,
    type: 'GET',
    statusCode: getIncidentAddressHandler
  });
}
