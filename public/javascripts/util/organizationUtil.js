// return true if I am in this organization, otherwise false
function isMyOrganization(org, id) {
  if (id === org.chief._id) {
    return true;
  }
  for (let i in org.persons) {
    if (org.persons[i]._id === id) {
      return true;
    }
  }
  return false;
}

// return the role prefix + username
function getDisplayName(user) {
  return usertag[user.role].namePrefix + " " + user.username;
}


// build view organization page
function buildChiefList(chief, myId) {
  let button = "";
  if (chief._id === myId) {
    button = '<button id="trackOrganizationButton" type="button" chiefId='+ chief._id + '>TRACK</button>';
  }
  if (isAdministrator(role)) {
    button = '<button id="editOrganizationButton" type="button" chiefId='+ chief._id + '>EDIT</button>';
  }
  return '<li class="list-group-item active justify-content-between ">' + getDisplayName(chief) + button + '</li>';
}

function buildPersonnelList(persons, chiefId) {
  let html = '<li class="list-group-item tex_muted"><i class="material-icons md-24">supervisor_account</i>Personnels</li>';
  for (let i in persons) {
    html += '<a class="list-group-item list-group-item-action" listType="personnel" chiefId=' + chiefId +' userId=' + persons[i]._id+ '>' + getDisplayName(persons[i]) +'</a>';
  }
  return html;
}

function buildVehicleList(vehicles, chiefId) {
  let html = '<li class="list-group-item tex_muted"><i class="material-icons md-24">directions_car</i>Vehicles</li>';
  for (let i in vehicles) {
    html += '<a class="list-group-item list-group-item-action" listType="vehicle" chiefId=' + chiefId +' userId=' + vehicles[i]._id+ '>' + vehicles[i].name +'</a>';
  }
  return html;
}
