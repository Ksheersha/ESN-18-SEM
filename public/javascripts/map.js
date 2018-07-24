let googleMap = $('#googleMap');
let mapContactList = $('#mapContactList');
let mapUtilList = $('#mapUtilList');
let mapGroupList = $('#mapGroupList');
let utilsList = {};
let groupInfos = {};

function reloadPhoneNumber () {
  let phone = $('#userPhone').html();
  $('#phone_content').val(phone);
}

function displayOrRemoveUser (element) {
  let uid = $(element).parent().find('.hidden-id').text();
  if ($(element).is(':checked')) {
    showSingleUser(uid);
  } else {
    removeSingleUser(uid);
  }
}

function reloadMapContactsDirectory (userList) {
  userList = sortUserListByName(userList);
  mapContactList.html('');
  for (let i = 0; i < userList.length; i++) {
    appendUserEntryOnMap(userList[i], 'showPrivateChatModal');
  }
}

function displayOrRemoveUtil (element) {
  let type = $(element).parent().find('span').text().trim();
  if ($(element).is(':checked')) {
    showUtilLayer(type);
  } else {
    removeUtilLayer(type);
  }
}

function reloadMapUtilsDirectory (utils) {
  utilsList = utils;
  let mapUtilListHTML = '';
  for (let type in utils) {
    if (type === 'incident') {
      mapUtilListHTML += appendUtilEntry(type, 'clickIncident()');
    } else {
      mapUtilListHTML += appendUtilEntry(type);
    }
  }
  mapUtilList.html(mapUtilListHTML);
}

function displayOrRemoveGroup (element) {
  let gid = $(element).parent().find('.hidden-id').text();
  if ($(element).is(':checked')) {
    showGroup(gid);
  } else {
    removeGroup(gid);
  }
}

function reloadMapGroupsDirectory (groups) {
  groupInfos = {};
  groupList = sortGroups(groups);
  mapGroupList.html('');
  for (let i in groupList) {
    groupInfos[groupList[i]['_id']] = groupList[i]['participants'];
    groupInfos[groupList[i]['_id']].push(groupList[i]['owner']);
    appendGroupEntryOnMap(groupList[i], 'showGroupChatModal');
  }
}

let mapGroupResponder = {
  200: reloadMapGroupsDirectory,
  500: function (err) {
    console.log(err);
  }
};

function clickMapInfo (isBack = false) {
  refreshPage(isBack, MAP_WINDOW_TITLE);
  mapWindow.show();

  getGroupInfoById(id, mapGroupResponder);
  getUsersInNetworkByRoleHTTP(role, role === "Administrator")
  .done(userList => {
    reloadMapContactsDirectory(userList);
  });
  getUtilsHTTP(reloadMapUtilsDirectory);

  getLocationAndShowMap();
  reloadPhoneNumber();
}

function mapTriggerClick () {
  if($('#map_trigger_button').text() === 'indeterminate_check_box') {
    $('#mapLayers').hide();
    $('#map_trigger_button').text('add_box');
  }
  else if($('#map_trigger_button').text() === 'add_box') {
    $('#mapLayers').show();
    $('#map_trigger_button').text('indeterminate_check_box');
  }
}

$(function () {
  // Setting phone format as (xxx) xxx-xxxx
  setPhoneMask();

  mapTab.click(function () {
    clickMapInfo();
  });

  mapBtn.click(function () {
    clickMapInfo();
  });

  socket.on('reload map', function (data) {
    getLocationAndShowMap();
  });

  $('#phone_button').click(sendPhoneNumber);

  $(document).on('click', '#phoneCall', function () {
    // console.log($(this).attr('phone'));
    window.open('tel:' + $(this).attr('phone'));
  });

  $('#mapTrigger').click(mapTriggerClick);
});
