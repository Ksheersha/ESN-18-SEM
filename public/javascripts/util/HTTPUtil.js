function sendPrivateMsgFormat (data) {
  return {
    uid: data.toID,
    sendUid: data.id,
    username: data.username,
    content: data.chatContent,
    status: data.userStatus
  };
}

function sendGroupMsgFormat (data) {
  return {
    uid: data.groupId,
    sendUid: data.id,
    username: data.username,
    content: data.chatContent,
    status: data.userStatus
  };
}

function logoutHTTP (responseHandler) {
  $.ajax({
    url: '/logout',
    type: 'GET',
    statusCode: responseHandler
  });
}

function postUsersHTTP (username, hash, register, responseHandler) {
  $.ajax({
    url: '/users',
    type: 'POST',
    data: {userName: username, passWord: hash, register: register},
    statusCode: responseHandler
  });
}

function getUsersHTTP (responseHandler, keywords, includeInactives = false) {
  $.ajax({
    url: '/users',
    data: keywords
      ? {keywords: keywords, includeInactives: includeInactives}
      : {includeInactives: includeInactives},
    type: 'GET',
    statusCode: responseHandler,
    success: responseHandler
  });
}

function getPublicMessagesHTTP (responseHandler, keywords, start) {
  $.ajax({
    url: '/messages/public',
    data: keywords ? {keywords: keywords, start: start} : null,
    type: 'GET',
    success: responseHandler
  });
}

function getUserByIdHTTP (id, responseHandler) {
  $.ajax({
    url: '/users/id/' + id,
    type: 'GET',
    success: responseHandler
  });
}

function postUserByIdHTTP (userid, data, responseHandler) {
  $.ajax({
    url: '/users/id/' + userid,
    type: 'POST',
    data: data,
    statusCode: {
      200: responseHandler,
      404: function (err) {
        console.log(err);
      }
    }
  });
}

/**
 * Warning: this function returns users IN THE CORRESPONDING NETWORK, not
 * just users in the specified group.
 * @param role
 * @param includeInactives
 * @returns {*|void}
 */
function getUsersInNetworkByRoleHTTP (role, includeInactives = false) {
  return $.ajax({
    url: '/users/contacts/role/' + role,
    type: 'GET'
  });
}

function postStatusHTTP (userID, userStatus, responseHandler) {
  $.ajax({
    url: '/users/status/id/' + userID,
    type: 'POST',
    data: {
      status: userStatus
    },
    statusCode: responseHandler
  });
}

function postPrivateMessageHTTP (data, responseHandler) {
  $.ajax({
    url: '/messages/private',
    type: 'POST',
    data: sendPrivateMsgFormat(data),
    statusCode: responseHandler
  });
}

function getPrivateMessageHTTP (id, toID, responseHandler, keywords, start) {
  $.ajax({
    url: '/messages/private/' + id + '/' + toID,
    data: keywords ? {keywords: keywords, start: start} : null,
    type: 'GET',
    success: responseHandler
  });
}

function postPublicAnnouncementHTTP (user, chatContent, userStatus, responseHandler) {
  $.ajax({
    url: '/announcements/public',
    type: 'POST',
    data: {userName: user, content: chatContent, status: userStatus},
    success: responseHandler
  });
}

function getPublicAnnouncementsHTTP (responseHandler, keywords, start) {
  $.ajax({
    url: '/announcements/public',
    data: keywords ? {keywords: keywords, start: start} : null,
    type: 'GET',
    success: responseHandler
  });
}

function postLocationHTTP (userID, location, responseHandler) {
  $.ajax({
    url: '/map/' + userID + '/location',
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify(location),
    success: responseHandler
  });
}

function postUtilHTTP (type, location, note, responseHandler) {
  $.ajax({
    url: '/map/utils',
    type: 'POST',
    data: {type: type, latitude: location.lat, longitude: location.lng, note: note},
    success: responseHandler
  });
}

function getSupplyHTTP (responseHandler, keywords, start) {
  $.ajax({
    url: '/supply',
    data: keywords ? {keywords: keywords, start: start} : null,
    type: 'GET',
    success: responseHandler
  });
}

function postPhoneNumberHTTP (userID, phoneNumber, responseHandler) {
  $.ajax({
    url: '/map/' + userID + '/phone',
    type: 'POST',
    data: {phoneNumber: phoneNumber},
    success: responseHandler
  });
}

function getMapInfoHTTP (responseHandler) {
  $.ajax({
    url: '/map',
    type: 'GET',
    success: responseHandler
  });
}

function postSupplyHTTP (data, responseHandler) {
  $.ajax({
    url: '/supply',
    type: 'POST',
    data: {
      name: data.name,
      quantity: data.quantity,
      ownerId: data.ownerId,
      location: data.location,
      description: data.description
    },
    statusCode: responseHandler
  });
}

function postSupplyRequestHTTP (supplyId, requesterId, responseHandler) {
  $.ajax({
    url: '/supply/request',
    type: 'POST',
    data: {supplyId: supplyId, requesterId: requesterId},
    statusCode: {
      200: responseHandler,
      400: function () {
        showMessageModal('Request Fail',
          'This supply is no longer available.');
      },
      401: function () {
        showMessageModal('Request Fail',
          'Cannot Request your own supply.');
      },
      404: function (err) {
        console.log(err);
      }
    }
  });
}

function getSupplyByIdHTTP (supplyId, responseHandler) {
  $.ajax({
    url: '/supply/' + supplyId,
    type: 'GET',
    success: responseHandler
  });
}

function postSupplyDeletionHTTP (ownerId, supplyId, responseHandler) {
  $.ajax({
    url: '/supply/delete',
    data: {ownerId: ownerId, supplyId: supplyId},
    type: 'POST',
    statusCode: responseHandler
  });
}

// Personal information Get and save
function loadPersonalInfo (userId, responseHandler) {
  $.ajax({
    url: '/profile/personalInfo/' + userId,
    type: 'GET',
    statusCode: responseHandler
  });
}

function loadMedicalInfo (userId, responseHandler) {
  $.ajax({
    url: '/profile/medicalInfo/' + userId,
    type: 'GET',
    statusCode: responseHandler
  });
}

function loadEmergencyContacts (userId, responseHandler) {
  $.ajax({
    url: '/profile/emergencyContacts/' + userId,
    type: 'GET',
    statusCode: responseHandler
  });
}

function savePersonalInfo (personalInfo, responseHandler) {
  $.ajax({
    url: '/profile/personalInfo',
    data: personalInfo,
    type: 'POST',
    statusCode: responseHandler
  });
}

function saveMedicalInfo (medicalInfo, responseHandler) {
  $.ajax({
    url: '/profile/medicalInfo',
    data: medicalInfo,
    type: 'POST',
    statusCode: responseHandler
  });
}

function saveEmergencyContacts (userId, emergencyContacts, responseHandler) {
  $.ajax({
    url: '/profile/emergencyContacts/' + userId,
    data: {'emergencyContacts': JSON.stringify(emergencyContacts)},
    type: 'POST',
    statusCode: responseHandler
  });
}

function createGroupAjax (userId, newGroupData, responseHandler) {
  $.ajax({
    url: '/group/create/' + userId,
    data: newGroupData,
    type: 'POST',
    statusCode: responseHandler
  });
}

function getGroupListAjax (userId, onSuccess, onError) {
  $.ajax({
    url: '/group/list/' + userId,
    type: 'GET',
    success: onSuccess,
    error: onError
  });
}

function deleteGroupAjax (groupId, onSuccess, onError) {
  $.ajax({
    url: '/group/delete/' + groupId,
    type: 'DELETE',
    success: onSuccess,
    error: onError
  });
}

function quitGroupAjax (userId, groupId, onSuccess, onError) {
  $.ajax({
    url: '/group/quit/' + userId + '/' + groupId,
    type: 'POST',
    success: onSuccess,
    error: onError
  });
}

function updateGroupAjax (groupId, groupData, onSuccess, onError) {
  $.ajax({
    url: '/group/update/' + groupId,
    data: groupData,
    type: 'POST',
    success: onSuccess,
    error: onError
  });
}

function checkExistingGroupNameAjax (name, onSuccess, onError) {
  $.ajax({
    url: '/group/exists',
    data: {name: name},
    type: 'POST',
    success: onSuccess,
    error: onError
  });
}

function checkGroupNamingAjax (groupId, groupName, onSuccess, onError) {
  $.ajax({
    url: '/group/naming',
    data: {_id: groupId, name: groupName},
    type: 'POST',
    success: onSuccess,
    error: onError
  });
}

function getGroupMessageById (groupId, responseHandler) {
  $.ajax({
    url: '/messages/group/' + groupId,
    type: 'GET',
    statusCode: responseHandler
  });
}

function getGroupInfoById (userId, responseHandler) {
  $.ajax({
    url: '/group/list/' + userId,
    type: 'GET',
    statusCode: responseHandler
  });
}

function postGroupMessage (data, responseHandler) {
  $.ajax({
    url: '/messages/group',
    type: 'POST',
    data: sendGroupMsgFormat(data),
    statusCode: responseHandler
  });
}

function getImageById (imageId, responseHandler) {
  $.ajax({
    url: '/image/' + imageId,
    type: 'GET',
    success: responseHandler
  });
}

function postGroupImageMessage (data, responseHandler) {
  $.ajax({
    url: '/messages/group/image',
    type: 'POST',
    data: sendGroupMsgFormat(data),
    statusCode: responseHandler
  });
}

function postPrivateImageMessage (data, responseHandler) {
  $.ajax({
    url: '/messages/private/image',
    type: 'POST',
    data: sendPrivateMsgFormat(data),
    statusCode: responseHandler
  });
}

function getUtilsHTTP (responseHandler) {
  $.ajax({
    url: '/map/utils',
    type: 'GET',
    success: responseHandler
  });
}

function deleteUtilHTTP (utilId) {
  return $.ajax({
    url: '/map/utils/' + utilId,
    type: 'DELETE'
  });
}

function getGroupMessages (groupID, responseHandler, keywords, start) {
  $.ajax({
    url: '/messages/group/' + groupID,
    data: keywords ? {keywords: keywords, start: start} : null,
    type: 'GET',
    success: responseHandler
  });
}

function getOneGroupInfoAjax (groupId, responseHandler) {
  $.ajax({
    url: '/group/info/' + groupId,
    data: groupData,
    type: 'GET',
    statusCode: responseHandler
  });
}

function saveHospitalInfo (hospitalInfo, responseHandler) {
  $.ajax({
    url: '/hospitals',
    data: JSON.stringify(hospitalInfo),
    contentType: 'application/json',
    type: 'POST',
    statusCode: responseHandler
  });
}

function updateHospitalInfo(updateInfo, responseHandler) {
  $.ajax({
    url: "/hospitals/beds",
    data: updateInfo,
    type: "PUT",
    statusCode: responseHandler
  });
}

function getPatientsDirectoryHTTP(userRole, responseHandler) {
  $.ajax({
    url: '/patients/' + userRole.toLowerCase() + '/' + id + '/patientsDirOrder',
    type: 'GET',
    statusCode: responseHandler
  });
}

// Hospital Methods
function getHospitalDirectory (responseHandler) {
  $.ajax({
    url: '/hospitals',
    type: 'GET',
    success: responseHandler
  });
}

function getChiefDetailAjax (chiefId, onSuccess, onError) {
  $.ajax({
    url: '/organization/chief/' + chiefId,
    type: 'GET',
    success: onSuccess,
    error: onError
  });
}

function updateOrganizationAjax (chiefId, organizationData, onSuccess, onError) {
  $.ajax({
    url: '/organization/chief/' + chiefId,
    data: JSON.stringify(organizationData),
    type: 'POST',
    success: onSuccess,
    error: onError,
    dataType: 'json',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  });
}

function getOfficerAjax (onSuccess, onError) {
  $.ajax({
    url: '/users/role/PatrolOfficer',
    type: 'GET',
    success: onSuccess,
    error: onError
  });
}

function getFirefighterAjax (onSuccess, onError) {
  $.ajax({
    url: '/users/role/Firefighter',
    type: 'GET',
    success: onSuccess,
    error: onError
  });
}

function getParamedicAjax (onSuccess, onError) {
  $.ajax({
    url: '/users/role/Paramedic',
    type: 'GET',
    success: onSuccess,
    error: onError
  });
}

function getChiefListAjax (onSuccess, onError) {
  $.ajax({
    url: '/organization/',
    type: 'GET',
    success: onSuccess,
    error: onError
  });
}

function selectVehicleAjax (vehicleId, user, onSuccess, onError) {
  $.ajax({
    url: 'vehicles/id/' + vehicleId,
    type: 'PATCH',
    data: user,
    success: onSuccess,
    error: onError
  });
}

function getVehicleById (id, responseHandler) {
  $.ajax({
    url: '/vehicles/id/' + id,
    type: 'GET',
    statusCode: responseHandler
  });
}

function getVehicleByUserId (id, responseHandler) {
  $.ajax({
    url: '/vehicles/user/' + id,
    type: 'GET',
    statusCode: responseHandler
  });
}

function getTruckById (id, responseHandler) {
  $.ajax({
    url: '/vehicles/truck/' + id,
    type: 'GET',
    statusCode: responseHandler
  });
}

function getOrganizationByIdPersonnel (userId, onSuccess, onError) {
  $.ajax({
    url: 'organization/personnel/' + userId,
    type: 'GET',
    success: onSuccess,
    error: onError
  });
}

function getOrganizationByIdChief (userId, onSuccess, onError) {
  $.ajax({
    url: 'organization/chief/' + userId,
    type: 'GET',
    success: onSuccess,
    error: onError
  });
}

function getHospitalById (id, responseHandler) {
  $.ajax({
    url: '/hospitals/' + id,
    type: 'GET',
    statusCode: responseHandler
  });
}

function deleteHospitalById (id, responseHandler) {
  $.ajax({
    url: '/hospitals/' + id,
    type: 'DELETE',
    statusCode: responseHandler
  });
}

function getHospitalByNurseId (id, responseHandler) {
  $.ajax({
    url: '/hospitals/nurse/' + id,
    type: 'GET',
    statusCode: responseHandler
  });
}

// Nurses Directory Http
function getAllNurse (responseHandler) {
  $.ajax({
    url: '/hospitals/nurse/list',
    type: 'GET',
    statusCode: responseHandler
  });
}

function getNursesInOneHospital (hospitalId, responseHandler) {
  $.ajax({
    url: '/hospitals/nurse/list/' + hospitalId,
    type: 'GET',
    statusCode: responseHandler
  });
}

function getInventoryById (id, responseHandler) {
  $.ajax({
    url: '/inventories/' + id,
    type: 'GET',
    statusCode: responseHandler
  });
}

function saveUpdateInventoryInfo (inventoryInfo, responseHandler) {
  $.ajax({
    url: '/inventories',
    data: JSON.stringify(inventoryInfo),
    contentType: 'application/json',
    type: 'POST',
    statusCode: responseHandler
  });
}


function getResourceRequests (truckId, hospitalId, responseHandler) {
  $.ajax({
    url: '/inventories/requests',
    data: truckId ? {
      truckId: truckId
    }
      : (hospitalId ? {
        hospitalId: hospitalId
      }
        : null),
    type: 'GET',
    statusCode: responseHandler
  });
}

function postResourceRequests (truckId, hospitalId, itemCounts, responseHandler) {
  $.ajax({
    url: '/inventories/requests',
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({truckId, hospitalId, itemCounts}),
    statusCode: responseHandler
  });
}

function updateResourceRequest(requestId, newStatus, responseHandler) {
  $.ajax({
    url: '/inventories/requests/' + requestId,
    data: {'status': newStatus},
    type: 'PATCH',
    success: responseHandler
  });
}
