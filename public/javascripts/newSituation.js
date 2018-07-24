let newSituationMap;
let newSituationMarker;
let newSituationAddressAutocomplete;
let newSituationArea;
let situationName = $('#situationName');
let affectedAreaRadius = $('#affectedAreaRadius');
let newSituationDescription = $('#newSituationDescription');
let newSituationSpecialNotes = $('#newSituationSpecialNotes');
let situationAddress = '';
let submitNewSituationBtn = $('#submitNewSituationBtn');
let newSituationForm = $('#newSituationForm');
let locationLatLng = {};
let affectedUserListButton = $('#affectedUserListButton');
let affectedUsersGroup = $('#affectedUsersGroup');
let modalAffectedUserList = $('#modalAffectedUserList');
let newSituationTitle = $('#newSituationTitle');
let situationNameForm = $('#situationNameForm');
let situationAddressForm = $('#situationAddressForm');
let situationRadiusForm = $('#situationRadiusForm');
let situationDetail = $('#situationDetail');
let affectedUserTitle = $('#affectedUserTitle');

function initNewSituationMap () {
  let defaultPosition = {lat: 37.41065, lng: -122.0585042};
  newSituationMap = new google.maps.Map(document.getElementById('newSituationMap'), {
    center: defaultPosition,
    zoom: 12
  });
  newSituationMarker = new google.maps.Marker({
    position: defaultPosition,
    map: newSituationMap
  });

  newSituationArea = new google.maps.Circle({
    strokeColor: '#009688',
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: '#009688',
    fillOpacity: 0.15,
    map: newSituationMap,
    center: defaultPosition,
    radius: 500
  });
}

function displaySituationOnMap(situationLocation) {
  let newPosition = new google.maps.LatLng(situationLocation.latitude, situationLocation.longitude);
  newSituationMap.setCenter(newPosition);
  newSituationMarker.setPosition(newPosition);
  newSituationArea.setCenter(newPosition);
}

function initNewSituationAddressAutocomplete () {
  let situationAddressElement = document.getElementById('situationAddress');
  let newSituationMapOptions = {
    componentRestrictions: {
      country: 'us'
    }
  };

  newSituationAddressAutocomplete = new google.maps.places.Autocomplete(situationAddressElement, newSituationMapOptions);
  newSituationAddressAutocomplete.addListener('place_changed', function () {
      let place = newSituationAddressAutocomplete.getPlace();
      situationAddress = place.formatted_address;
      locationLatLng.latitude = place.geometry.location.lat();
      locationLatLng.longitude = place.geometry.location.lng();
      displaySituationOnMap(locationLatLng);
  });
}

function loadNewSituationPage () {
  initNewSituationAddressAutocomplete();
  initNewSituationMap();
}

affectedAreaRadius.change(function () {
  let radiusInMiles = affectedAreaRadius.val();
  let radiusInMeters = radiusInMiles * 1609.34;
  newSituationArea.setRadius(radiusInMeters);
});

newSituationForm.submit(function (e) {
  e.preventDefault();

  let situation = {
    creatorId: userId.html(),
    name: situationName.val(),
    address: situationAddress,
    affectedRadius: affectedAreaRadius.val(),
    description: newSituationDescription.val(),
    specialNotes: newSituationSpecialNotes.val(),
    location: {
      longitude: locationLatLng.longitude,
      latitude: locationLatLng.latitude
    },
  };

  if(updateSituationCondition === 'true'){
    situation.address = $('#situationAddress').val();
    updateSituation(curSituationId, situation);
  } else {
    saveNewSituation(situation);
  }
});

let saveSituationHandler = {
  200: function () {
    showMessageModal("Successful!", "Your situation has been saved succesfully.");
    clickSituations(true);
  },
  500: function () {
    showMessageModal("Error!", "Your situation was not saved. Please try again.");
  }
};

function saveNewSituation (situationInfo) {
  $.ajax({
    url: "/situations/",
    data: {situation: JSON.stringify(situationInfo)},
    type: "POST",
    statusCode: saveSituationHandler
  });
}

let updateSituationHandler = {
  200: function () {
    showMessageModal("Successful!", "Your situation has been update succesfully.");
    clickSituations(true);
  },
  500: function () {
    showMessageModal("Error!", "Your situation was not saved. Please try again.");
  }
};

let loadAffectedUserListHandler = {
  200: function (affectedUserList) {
    modalAffectedUserList.modal('show');
    displayListOfAffectedUsers(affectedUserList);
  },
  500: function () {
    showMessageModal("Error!", "Affected User List is not loaded. Please try again.");
  }
};

function updateSituation (situationId, situationInfo) {
  $.ajax({
    url: "/situations/" + situationId,
    data: {situation: JSON.stringify(situationInfo)},
    type: "PUT",
    statusCode: updateSituationHandler
  });
}

function loadAffectedUserList(situationId) {
  $.ajax({
    url: "/situations/" + situationId + "/affectedUsers",
    type: "GET",
    statusCode: loadAffectedUserListHandler
  })
}

function getAffectedUserHTML (affectedUser) {
  let affectedhtml = '';
  affectedhtml += '<li class="list-group-item">'  +
    '<a class="group_info_button nav-item nav-link nav-link" >';
  getUserByIdHTTP(affectedUser, function(user){
    affectedhtml += getStatusIcon(user.status.status) + '</a><a>' + user.username + '</a></li>';
    affectedUsersGroup.append(affectedhtml);
  });
}

function displayListOfAffectedUsers (affectedUserList) {
  affectedUsersGroup.empty();
  affectedUserTitle.text('Affected User List');
  if(affectedUserList.length == 0){
    affectedUserTitle.text('No Affected User');
  }
  for (let i = 0; i < affectedUserList.length; i++) {
    getAffectedUserHTML(affectedUserList[i]);
  }
}

affectedUserListButton.click(function () {
  loadAffectedUserList(curSituationId);
});