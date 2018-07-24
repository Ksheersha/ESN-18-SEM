let map;
let infowindow;
let userLocs = {};
let markerList = {};

//Initial function called
function getLocationAndShowMap() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showMap, locationError);
  } else {
    console.log('<p>Geolocation is not supported by your browser</p>');
  }
}

//Shows map, together with positions on it
function showMap(position) {
  let userID = $("#id").html();
  let loc = buildGeoJSONfromCoordinates(position.coords);
  postLocationHTTP(userID, loc, setMap(position));
  //Initial layer
  google.maps.event.addListenerOnce(map, 'tilesloaded', function(){
    getMapInfoHTTP(initializeMap);
  });
  map.addListener('dblclick', function(e) {
    map.panTo(e.latLng);
    placeMarker('pin', e.latLng.lat(), e.latLng.lng(), '');
  });
}

function buildGeoJSONfromCoordinates(coords) {
  return {
    type: 'Point',
    coordinates: [coords.longitude, coords.latitude]
  };
}

function placeMarker(type, lat, lng, note) {
    postUtilHTTP(type, {lat: lat, lng: lng}, note, postUtilResponse); // note to be added
}

function postUtilResponse(result) {
  utilsList[result.type].push(result);
  marker = setMarker(result, result.type);
    //Activates the util layer, after you place a new util
  $('#mapUtilList').find(`label:contains(${result['type']})`).children('input').prop('checked', true);
  showUtilLayer(result['type']);
  if (result['type'] === 'pin' && result['note'] === '') {
      new google.maps.event.trigger(marker, 'click' );
  }
}

//Called in showMap()
function initializeMap(data) {
  restoreUserLocs(data);
  showSingleUser(id);
}

function restoreUserLocs(data) {
  userLocs = {};
  for (let i in data) {
    userLoc = data[i];
    userLocs[userLoc["uid"]] = userLoc;
  }
}

function showSingleUser(uid) {
  userLoc = userLocs[uid];
  if (userLoc && validateGeoJSON(userLoc["location"])) {
    setMarker(userLoc);
    userLocs[uid]["isShown"] = true;
  }
}

function validateGeoJSON(geoJson) {
  if (geoJson && geoJson.coordinates && geoJson.coordinates.length === 2) {
    if (geoJson.coordinates[0] && geoJson.coordinates[1]) {
      return true;
    }
  }
  return false;
}

function removeSingleUser(uid) {
  markers = markerList["user"];
  for (let i in markers) {
    marker = markers[i];
    if (marker["_id"] === uid) {
      marker.setMap(null);
      delete marker;
      userLocs[uid]["isShown"] = false;
    }
  }
}

function updateUserCheckbox(uidList, checked) {
  mapContactList.find('.user-check-box').each(function() {
    let uid = $(this).parent().find('.hidden-id').text();
    if (uidList.indexOf(uid) > -1) {
      $(this).prop('checked', checked);
    }
  });
}

function showGroup(gid) {
  uidList = groupInfos[gid];
  for (let i in uidList) {
    uid = uidList[i];
    if (userLocs[uid]["isShown"] !== true) {
      showSingleUser(uid);
    }
  }
  updateUserCheckbox(uidList, true);
}

function removeGroup(gid) {
  uidList = groupInfos[gid];
  for (let i in uidList) {
    uid = uidList[i];
    if (userLocs[uid]["isShown"] === true) {
      removeSingleUser(uid);
    }
  }
  updateUserCheckbox(uidList, false);
}

function showUtilLayer(type) {
  pins = utilsList[type];
  for (let i in pins) {
    pin = pins[i];
    setMarker(pin, type);
  }
}

function removeUtilLayer(type) {
  markers = markerList[type];
  for (let i in markers) {
    markers[i].setMap(null);
  }
  markerList[type] = [];
}

function locationError(error) {
  console.log(error);
  APIGeolocation();
}

function APIGeolocation() {
  jQuery.post( "https://www.googleapis.com/geolocation/v1/geolocate?key=AIzaSyD8CxGINkAxCl4XTw0escUp9l7PM5hUfWg", function(success) {
    showMap({coords: {latitude: success.location.lat, longitude: success.location.lng}});
  })
  .fail(function(err) {
    alert("API Geolocation error! \n\n"+err);
  });
}

function setMap(position) {
  let mapInfo= {
    center:new google.maps.LatLng(position.coords.latitude,position.coords.longitude),
    zoom:15,
    gestureHandling: 'greedy'
  };
  map = new google.maps.Map(document.getElementById("googleMap"),mapInfo);
  infowindow = new google.maps.InfoWindow({content: ""});
}

const generateMarkerIcon = {
  'user': getStatusMarker,
  'pin': getPinMarker,
  'block': getBlockMarker,
  'incident': getIncidentMarker,
  'hospital': getHospitalMarker
};

function setMarker(data, type = "user") {
  // FIXME: hardcode. Maps API supports feeding in a GeoJSON to add a marker.
  let latitude;
  let longitude;

  if ('coordinates' in data.location) {
    latitude = parseFloat(data.location.coordinates[1]);
    longitude = parseFloat(data.location.coordinates[0]);
  } else {
    latitude = parseFloat(data.location.latitude);
    longitude = parseFloat(data.location.longitude);
  }

  let marker = new google.maps.Marker({
    position: new google.maps.LatLng(latitude, longitude),
    map:map,
    icon: generateMarkerIcon[type](data),
    data : (type === "user") ? infoWindowContent(data) : utilInfoWindowContent(data, type),
    _id: (type === "user") ? data["uid"] : data["_id"]
  });
  markerList[type] = markerList[type] || [];
  markerList[type].push(marker);

  marker.addListener('click', function() {
    infowindow.setContent(this.data);
    infowindow.open(map, this);
  });
  return marker;
}

function getStatusMarker(data) {
  if (data.username === user) {
    // user himself: blue spot
    return 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png';
  }
  if (data.status === 'OK') {
    return 'https://maps.google.com/mapfiles/ms/icons/ltblue-dot.png';
  } else if (data.status === 'Help') {
    return 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
  } else if (data.status === 'Emergency') {
    return 'https://maps.google.com/mapfiles/ms/icons/red-dot.png';
  } else {
    // default: purple spot
    return 'https://maps.google.com/mapfiles/ms/icons/purple-dot.png';
  }
}

function getPinMarker() {
  return 'https://maps.google.com/mapfiles/ms/icons/blue-pushpin.png';
}

function getBlockMarker() {
  return 'https://maps.google.com/mapfiles/ms/icons/caution.png';
}

function getIncidentMarker() {
  return 'https://maps.google.com/mapfiles/ms/icons/flag.png';
}

function getHospitalMarker() {
  return 'https://maps.gstatic.com/mapfiles/ms2/micons/hospitals.png';
}

function removeUtilById(utils, utilId) {
  for (let i in utils) {
    if (utils[i]["_id"] === utilId) {
      delete utils[i];
    }
  }
}

function removeUtilMarkersById(markers, utilId) {
  for (let i in markers) {
    if (markers[i]["_id"] === utilId && markers[i].map !== null) {
      markers[i].setMap(null);
    }
  }
}

function deleteUtil(element) {
  let utilId = $(element).parent().parent().find('.hidden-id').text();
  let type = $(element).parent().parent().find('.hidden-name').text();
  let utils = utilsList[type];
  let markers = markerList[type];
  deleteUtilHTTP(utilId)
  .done(() => {
    removeUtilById(utils, utilId);
    removeUtilMarkersById(markers, utilId);
  });
}

function utilInfoWindowContent(data, type) {
  let divStr = "<div class='text-center'>" + data["note"] + "</div>";
  if (type === 'pin') {
    divStr += "<div class='text-center'><label for='pinTitle'>Pin Label </label><input type='text' id='pinTitle' placeholder=' Enter Label Here'></div>";
    divStr += "<div><button class='btn-sm btn-raised btn-success' onclick='saveUtil(\"pin\", this, $(pinTitle)[0].value.trim());'> Save </button>";
    if((data['note'] === '' && isFirstResponder(role))) {
        divStr += "<button class='btn-sm btn-raised btn-primary' onclick='saveUtil(\"block\", this);'> Save As Road Block </button>";
    }
    divStr += "<button class='btn-sm btn-raised btn-danger' onclick='deleteUtil(this);'> Delete </button></div>";
  }
  if (type === 'block' && isFirstResponder(role)) {
    divStr += "<div><button class='btn-sm btn-raised btn-danger' onclick='deleteUtil(this);'> Delete </button></div>";
  }
  divStr += "<div class='page-hidden-info hidden-name'>" + data["type"] + "</div>";
  divStr += "<div class='page-hidden-info hidden-id'>" + data["_id"] +"</div>";
  return divStr;
}

function saveUtil(type, element, label = '') {
  console.log('made it in.');
  let utilId = $(element).parent().parent().find('.hidden-id').text();
  type !== 'block' ? utils = utilsList[type] : utils = utilsList['pin'];
  for (let i in utils) {
    if (utils[i]["_id"] === utilId) {
      let lat = utils[i]["location"]["latitude"];
      let lng = utils[i]["location"]["longitude"];
      deleteUtil(element);
      placeMarker(type, lat, lng, label);
      break;
    }
  }
}

function infoWindowContent(data){
  let divStr = '';
  if (data.username === user)
    return 'My Location';

  divStr += userInfoSyntax(data);
  if ("content" in data)
    divStr += messageInfoSyntax(data);
  if ("phoneNumber" in data)
    divStr += phoneCallIcon(data);

  return divStr;
}

function userInfoSyntax(data) {
  let divStr = '<div>';
  divStr += getStatusIcon(data.status);
  divStr += ' ' + data.username;
  if ("timestamp" in data)
    divStr += ' @  '+ getTimeString(data.timestamp) + '</div>';
  else
    divStr += '</div>';
  return divStr;
}

function messageInfoSyntax(data) {
  // http://www.googlemapsmarkers.com/v1/
  divStr = '<div class="map-content card bg-light">';
  divStr += data.content + '</div>';
  return divStr;
}

function phoneCallIcon(data) {
  let phone = data.phoneNumber.split(' ').join('');
  let divStr = '<button class="btn btn-raised btn-primary" id="phoneCall" ';
  divStr += 'phone='+phone+'>';
  divStr += '<i class="material-icons icon-phone">call</i>';
  divStr += '</button>';
  return divStr;
}

function setPhoneMask() {
  $("#phone_content").mask("999 999 9999");
}

function sendPhoneNumber() {
  let userID = $("#id").html();
  let phoneNumber = $("#phone_content").val();
  if (phoneNumber === '') {
    showMessageModal('Phone Number', 'Please input your phone number before clicking send');
  } else {
    postPhoneNumberHTTP(userID, phoneNumber, function (data, status) {});
  }
  $('#userPhone').html(phoneNumber);
}

function appendUserEntryOnMap(data, func){
  let name = usertag[data.role].namePrefix;
  name += data.username;
  name += (data._id === id)? "(ME)</span>" : "</span>";
  let checked = (data._id === id)? "checked" : "";

  mapContactList.append(
    "<li>"
    + "<label>"
    + "<input class='user-check-box' type='checkbox' onchange='displayOrRemoveUser(this);'" + checked + ">"
    + "<span onclick='" + func + "($(this).parent());' style='word-break:break-all'>&nbsp;"
    + name
    + "<div class='page-hidden-info hidden-name'>"
    + name
    + "</div>"
    + "<div class='page-hidden-info hidden-id'>" + data._id + "</div>"
    + "</span>"
    + "</label>"
    + "</li>"
  );
}

function appendGroupEntryOnMap(data, func) {
  mapGroupList.append(
    "<li>"
    + "<label>"
    + "<input class='user-check-box' type='checkbox' onchange='displayOrRemoveGroup(this);'>"
    + "<span onclick='" + func + "($(this).parent());' style='word-break:break-all'>&nbsp;"
    + data.name
    + "<div class='page-hidden-info hidden-name'>"
    + data.name
    + "</div>"
    + "<div class='page-hidden-info hidden-id'>" + data._id + "</div>"
    + "</span>"
    + "</label>"
    + "</li>"
  );
}

function appendUtilEntry(utilName, func = "") {
  return (
    "<li>"
    + "<label>"
    + "<input class='util-check-box' type='checkbox' onchange='displayOrRemoveUtil(this);'>"
    + "<span onclick='" + func + "'>&nbsp;"
    + utilName + "</span>"
    + "</label>"
    + "</li>"
  );
}

function sortUserListByName(userList) {
  return userList.sort(function (a, b) {
    return a.username.localeCompare(b.username);
  })
}
