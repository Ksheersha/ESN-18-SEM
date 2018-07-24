let modalIncidentTeamChat = $("#modalIncidentTeamChat");
let incidentTeamChatContent = $("#incident_team_chat_content");
let incidentTeamHistoryMsg = $("#incidentTeamHistoryMsg");
let incidentTeamSendButton = $("#incident_team_send_button");
let chatWithRespondersButton = $('#chatWithRespondersButton');

var responderGroupId;

function updateIncidentResponderGroupId(responderGroupId) {
  $.ajax({
    url: "/incidents/responderGroup",
    data: {
      'incidentId': incidentId,
      'responderGroupId': responderGroupId
    },
    type: "PUT",
    statusCode: updateIncidentResponderGroupIdHandler
  });
}

let updateIncidentResponderGroupIdHandler = {
  200: function (incident) {
    responderGroupId = incident.responderGroupId;
    console.log("update responderGroupId is"+incident.responderGroupId);
  },
  500: function () {
    showMessageModal("Error!", "There was an error. Please try again.");
  }
};


function createTeamGroupAjax() {
  // used in step 5 in dispatcher view
  $.ajax({
    url: "/incidents/incidentInfo/" + incidentId,
    type: "GET",
    statusCode: createTeamGroupHandler
  });
}

function updateTeamGroupAjax() {
  // used in step 5 in dispatcher view
  $.ajax({
    url: "/resource/personnel/" + incidentId,
    type: "GET",
    statusCode: updateTeamGroupHandler
  });
}

let createTeamGroupHandler = {
  200: function (incident) {
    responderGroupId = incident.responderGroupId;
    createTeamGroup(incident.commanderName, incident.creatorId, incident.commanderId, incident.displayId);
  },
  500: function () {
    showMessageModal('Error!', 'There was an error. Please try again.');
  }
};

let updateTeamGroupHandler = {
  200: function (personnelIds) {
    let groupId = responderGroupId;
    console.log('personnel IDs is '+personnelIds);
    for(let i = 0; i < personnelIds.length; i++){
      getOneGroupInfo(groupId,personnelIds[i]);
    }
  },
  500: function () {
    showMessageModal('Error!', 'There was an error. Please try again.');
  }
};


function createTeamGroup(commanderName, creatorId, commanderId, displayId) {
  let index = displayId.indexOf("_");
  let number = displayId.substring(index+1, displayId.length);
  console.log("IT_" + number);
  let newGroupData =  {
    'name': "IT_" + number,
    'description': "Team Chat",
    'participants': []
  };

  newGroupData.participants.push(creatorId);

  newGroupData.participants = JSON.stringify(newGroupData.participants);

  let createNewGroupResponseHandler = {
    201: function(groupId){
      console.log("groupId in create new group"+groupId);
      // groupPageShowAlert('Group created successfully!');
      // localStorage.setItem("groupTeamId", groupId);
      responderGroupId = groupId;
      updateIncidentResponderGroupId(groupId);
      updateTeamGroupAjax();
    },
    400: function() {
      // groupPageShowAlert('Error! Group is not created.');
      updateTeamGroupAjax();
      // showIncidentTeamChatModal(localStorage.getItem("groupTeamId"));

    }
  };

  createGroupAjax(commanderId, newGroupData, createNewGroupResponseHandler);

  data = newGroupData;
  return data;
}

// function structIncidentTeamMsg() {
//   // used in step 5 in dispatcher view
//   $.ajax({
//     url: "/incidents/incidentInfo/" + incidentId,
//     type: "GET",
//     statusCode: structIncidentTeamMsgHandler
//   });
// }
//
// let structIncidentTeamMsgHandler = {
//   200: function (incident) {
//     let username = $("#userName").html();
//     let id = $("#id").html();
//     let chatContent = getEscapedInputBoxContent(incidentChatContent);
//     ///////////
//     //  Todo: Get your own group Id!!!!!!
//     //////////
//     let groupId = incident.responderGroupId;
//     let userStatus = $('#userStatus').html();
//
//     return  {username, id, chatContent, groupId, userStatus};
//   },
//   500: function () {
//     showMessageModal('Error!', 'There was an error. Please try again.');
//   }
// };

function structIncidentTeamMsg() {
  let username = $("#userName").html();
  let id = $("#id").html();
  let chatContent = getEscapedInputBoxContent(incidentTeamChatContent);
  ///////////
  //  Todo: Get your own group Id!!!!!!
  //////////
  let groupId = responderGroupId;
  let userStatus = $('#userStatus').html();

  return  {username, id, chatContent, groupId, userStatus};
}

function sendIncidentTeamMessage() {
  let chatContent = getEscapedInputBoxContent(incidentTeamChatContent);
  let data = structIncidentTeamMsg();
  getIncidentState();
  if (chatContent === '') {
    showMessageModal('Group chat message', 'Please input message before clicking send');
  } else {
    // in HTTPUtil;
    postGroupMessage(data, {
      201: function (data, status) {
      },
      500: function (response) {

      }
    });
    $('#incident_team_chat_content').val("");
  }
}

function renderIncidentTeamMessage(response) {
  for (let i = 0; i < response.length; i++) {
    appendMessage('#incidentTeamHistoryMsg', response[i], !isSearch(privateSearchInput));
  }
  scrollBottom(privateSearchInput, incidentTeamHistoryMsg);
}

function reloadIncidentTeamMessage(response) {
  incidentTeamHistoryMsg.html("");
  renderIncidentTeamMessage(response);
}

function showIncidentTeamChatModal(element) {
  // used in step 5 in dispatcher view
  $(element).parent().css("background-color", "");
  $(element).find(".list-badge").css("display", "none");
  $.ajax({
    url: "/incidents/incidentInfo/" + incidentId,
    type: "GET",
    statusCode: showIncidentTeamChatModalHandler
  });
}

let showIncidentTeamChatModalHandler = {
  200: function (incident) {
    responderGroupId = incident.responderGroupId;
    let groupId = incident.responderGroupId;
    let getOneGroupResponseHandler = {
      200: function(groupData){
        groupName=groupData.name;
        modalIncidentTeamChat.find('.modal-content').height($( window ).height() - 30);
        let idEl = '<div id="groupId" class="page-hidden-info hidden-id">' + groupId +'</div>'
        let titleStr = groupName + idEl;
        modalIncidentTeamChat.find('.modal-title').html(titleStr);
        getGroupMessages(groupId, reloadIncidentTeamMessage);
        modalIncidentTeamChat.modal('show');
      },
      500: function() {
        console.log('Error, could not retrieve group info.');
      }
    };

    getOneGroupInfoAjax(groupId, getOneGroupResponseHandler);
  },
  500: function () {
    showMessageModal('Error!', 'There was an error. Please try again.');
  }
};



// function showIncidentTeamChatModal(groupId, element) {
//   $(element).parent().css("background-color", "");
//   $(element).find(".list-badge").css("display", "none");
//   console.log(groupId);
//   let getOneGroupResponseHandler = {
//     200: function(groupData){
//       groupName=groupData.name;
//       modalIncidentTeamChat.find('.modal-content').height($( window ).height() - 30);
//       let idEl = '<div id="groupId" class="page-hidden-info hidden-id">' + groupId +'</div>'
//       let titleStr = groupName + idEl;
//       modalIncidentTeamChat.find('.modal-title').html(titleStr);
//       getGroupMessages(groupId, reloadIncidentTeamMessage);
//       modalIncidentTeamChat.modal('show');
//     },
//     500: function() {
//       console.log('Error, could not retrieve group info.');
//     }
//   };
//
//   getOneGroupInfoAjax(groupId, getOneGroupResponseHandler);
//
// }

