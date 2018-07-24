let modalIncidentGroupChat = $("#modalIncidentGroupChat");
let incidentChatContent = $("#incident_chat_content");
let incidentHistoryMsg = $("#incidentHistoryMsg");
let incidentSendButton = $("#incident_send_button");
let chat911DispatcherButton = $('#chat911DispatcherButton');
var currentGroupName;
var dispatcherGroupId;

function updateIncidentDispatcherGroupId(dispatcherGroupId) {
  $.ajax({
    url: "/incidents/dispatcherGroup",
    data: {
      'incidentId': incidentId,
      'dispatcherGroupId': dispatcherGroupId
    },
    type: "PUT",
    statusCode: updateIncidentDispatcherGroupIdHandler
  });
}

let updateIncidentDispatcherGroupIdHandler = {
  200: function (incident) {
    console.log("update dispatcherGroupId is"+incident.dispatcherGroupId);
  },
  500: function () {
    showMessageModal("Error!", "There was an error. Please try again.");
  }
};

function create911Group(creatorId, callerId, displayId) {
    let index = displayId.indexOf("_");
    let number = displayId.substring(index+1, displayId.length);
    let newGroupData =  {
      'name': "IC_" + number,
      'description': "911 Call",
      'participants': []
    };

    newGroupData.participants.push(callerId);

    newGroupData.participants = JSON.stringify(newGroupData.participants);

    let createNewGroupResponseHandler = {
      201: function(groupId){
        // groupPageShowAlert('Group created successfully!');
        // localStorage.setItem("group911Id", groupId);
        dispatcherGroupId = groupId;
        updateIncidentDispatcherGroupId(groupId);
      },
      404: function() {
        groupPageShowAlert('Error! Group is not created.');
      }
    };

    createGroupAjax(creatorId, newGroupData, createNewGroupResponseHandler);

    data = newGroupData;
    return data;
}

// function structIncidentGroupMsg() {
//   // used in step 5 in dispatcher view
//   $.ajax({
//     url: "/incidents/incidentInfo/" + incidentId,
//     type: "GET",
//     statusCode: structIncidentGroupMsgHandler
//   });
// }
//
// let structIncidentGroupMsgHandler = {
//   200: function (incident) {
//     let username = $("#userName").html();
//     let id = $("#id").html();
//     let chatContent = getEscapedInputBoxContent(incidentChatContent);
//     ///////////
//     //  Todo: Get your own group Id!!!!!!
//     //////////
//     let groupId = incident.dispatcherGroupId;
//     let userStatus = $('#userStatus').html();
//
//     return  {username, id, chatContent, groupId, userStatus};
//   },
//   500: function () {
//     showMessageModal('Error!', 'There was an error. Please try again.');
//   }
// };

function structIncidentGroupMsg() {

  let username = $("#userName").html();
  let id = $("#id").html();
  let chatContent = getEscapedInputBoxContent(incidentChatContent);
  ///////////
  //  Todo: Get your own group Id!!!!!!
  //////////
  let groupId = dispatcherGroupId;
  let userStatus = $('#userStatus').html();

  return  {username, id, chatContent, groupId, userStatus};
}

function sendIncidentGroupMessage() {
  let chatContent = getEscapedInputBoxContent(incidentChatContent);
  var data = structIncidentGroupMsg();
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
    $('#incident_chat_content').val("");
  }
}

function renderIncidentGroupMessage(response) {
  for (let i = 0; i < response.length; i++) {
    appendMessage('#incidentHistoryMsg', response[i], !isSearch(privateSearchInput));
  }
  scrollBottom(privateSearchInput, incidentHistoryMsg);
}

function reloadIncidentGroupMessage(response) {
  incidentHistoryMsg.html("");
  renderIncidentGroupMessage(response);
}

let getGroupNameForIdHandler = {
  200: function (name) {
    currentGroupName = name;
    let idEl = '<div id="groupId" class="page-hidden-info hidden-id">' + groupId +'</div>';
    let titleStr = currentGroupName + idEl;
    modalIncidentGroupChat.find('.modal-title').html(titleStr);
  },
  500: function (err) {
    showMessageModal("Error!", "There was an error. Please try reloading the page.");
  }
};

function getGroupNameForId(groupId){
  $.ajax({
    url: "/group/name/" + groupId,
    type: "GET",
    statusCode: getGroupNameForIdHandler,
  });
}

function showIncidentGroupChatModal(element) {
  // used in step 5 in dispatcher view
  $(element).parent().css("background-color", "");
  $(element).find(".list-badge").css("display", "none");
  $.ajax({
    url: "/incidents/incidentInfo/" + incidentId,
    type: "GET",
    statusCode: showIncidentGroupChatModalHandler
  });
}

let showIncidentGroupChatModalHandler = {
  200: function (incident) {
    getIncidentState();

    /////////////
    ////  Todo: If you want to show the group name later, you can put it in the 'reloadIncidentGroupMessage'
    ////////////

    /////////////
    ///   Todo: your own group ID
    /////////////
    let groupID = incident.dispatcherGroupId;
    dispatcherGroupId = incident.dispatcherGroupId;
    if(isCitizen(role)) {
      currentGroupName = "911 Call";
    }
    else {
      getGroupNameForId(groupID);
    }

    modalIncidentGroupChat.find('.modal-content').height($( window ).height() - 30);
    let idEl = '<div id="groupId" class="page-hidden-info hidden-id">' + groupID +'</div>';
    let titleStr = currentGroupName + idEl;
    modalIncidentGroupChat.find('.modal-title').html(titleStr);
    getGroupMessages(groupID, reloadIncidentGroupMessage);
    modalIncidentGroupChat.modal('show');
  },
  500: function () {
    showMessageModal('Error!', 'There was an error. Please try again.');
  }
};

// function showIncidentGroupChatModal(element) {
//   getIncidentState();
//   $(element).parent().css("background-color", "");
//   $(element).find(".list-badge").css("display", "none");
//   /////////////
//   ////  Todo: If you want to show the group name later, you can put it in the 'reloadIncidentGroupMessage'
//   ////////////
//
//   /////////////
//   ///   Todo: your own group ID
//   /////////////
//   let groupID = localStorage.getItem("group911Id");
//
//   if(isCitizen(role)) {
//     currentGroupName = "911 Call";
//   }
//   else {
//     getGroupNameForId(groupID);
//   }
//
//   modalIncidentGroupChat.find('.modal-content').height($( window ).height() - 30);
//   let idEl = '<div id="groupId" class="page-hidden-info hidden-id">' + groupID +'</div>';
//   let titleStr = currentGroupName + idEl;
//   modalIncidentGroupChat.find('.modal-title').html(titleStr);
//   getGroupMessages(groupID, reloadIncidentGroupMessage);
//   modalIncidentGroupChat.modal('show');
// }

