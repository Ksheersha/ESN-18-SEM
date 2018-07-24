let openingDateTime = $('#openingDateTime');
let displayId = $('#displayId');
let caller = $('#caller');
let priority = $('#priority');
let creator = $('#creator');
let commander = $('#commander');
let i=0;
let groupName ='';
let groupId = localStorage.getItem("group911Id");
let allocateResourcesButton = $('#allocateResourcesButton');
let userRole ='';
let closingDateTime =$('#closingDateTime');
let clDateTime,groupResponderId,groupDispatcherId;
let closeIncidentButton =$('#closeIncidentButton');
let incidentState,incidentCommander,incidentCreator;
let firstResponders = $('#firstResponders');

let getIncidentInfoForStep5Handler = {
  200: function (incident) {
    getIncidentState();
    groupResponderId=incident.responderGroupId;
    groupDispatcherId=incident.dispatcherGroupId;
    console.log("getIncidentInfoForStep5Handler groupResponderId:"+groupResponderId+",groupDispatcherId:"+groupDispatcherId);
    if(incident.state===3) {
      closeIncidentPage();
    }
    else {
        incidentOpenPage();
    }
    setIncidentInfoForStep5(incident);
  },
  500: function () {
    showMessageModal('Error!', 'There was an error. Please try again.');
  }
};

let updateIncidentPriorityHandler = {
  200: function (incident) {
    priority.val(incident.priority);
  },
  500: function () {
    showMessageModal("Error!", "There was an error. Please try again.");
  }
};

let updateIncidentStateHandler = {
  200: function (incident) {
    if(incident.state ===3) {
      var clDateTime = new Date(incident.closingDateTime);
      var clDateVal = completeMonthOrDate(clDateTime.getDay() + "." + completeMonthOrDate(clDateTime.getMonth() + 1) + "." + clDateTime.getFullYear());
      var clTimeVal = completeMonthOrDate(clDateTime.getHours() + ":" + completeMonthOrDate(clDateTime.getMinutes()));
      closingDateTime.text(clDateVal + "-" + clTimeVal);
    }
    console.log("incident.state"+incident.state+ incident.closingDateTime+"clDateVal:"+clDateVal);

  },
  500: function () {
    showMessageModal("Error!", "There was an error. Please try again.");
  }
};

let updateIncidentCommanderHandler = {
    200: function (incident) {
        commander.val(incident.commanderId);
        getIncidentInfoForStep5();
    },
    500: function () {
        showMessageModal("Error!", "There was an error. Please try again.");
    }
};

let getIncidentStateHandler = {
    200: function (incident) {
      incidentState= incident.state;
      incidentCommander= incident.commanderId;
      incidentCreator=incident.creatorId;
      makeReadOnlyStep3_4_5(incident);
    },
    500: function () {
        showMessageModal("Error!", "Could not retrieve incident state. Please try again.");
    }
};

function setIncidentInfoForStep5(incident) {
    var dateTime = new Date(incident.openingDateTime);
    var dateVal = completeMonthOrDate(dateTime.getDay() + "." + completeMonthOrDate(dateTime.getMonth() + 1) + "." + dateTime.getFullYear());
    var timeVal = completeMonthOrDate(dateTime.getHours() + ":" + completeMonthOrDate(dateTime.getMinutes()));
    openingDateTime.text(dateVal + "-" + timeVal);
    displayId.text(incident.displayId);
    caller.text(incident.callerName);
    priority.val(incident.priority);
    creator.text(incident.creatorName);
    commander.val(incident.commanderName);
    userRole = creator.val();
    firstResponders.html(firstRespondersList(incident.firstResponders));
}

function firstRespondersList(users) {
    var html = "";
    for (let i = 0; i < users.length; i++) {
        html += users[i].username + "<br>";
      }
    return html;
}


function getIncidentInfoForStep5() {
  // used in step 5 in dispatcher view
  $.ajax({
    url: "/incidents/incidentInfo/" + incidentId,
    type: "GET",
    statusCode: getIncidentInfoForStep5Handler
  });
}

function updateIncidentState() {
  $.ajax({
    url: "/incidents/state",
    data: {
      'incidentId': incidentId,
    },
    type: "PUT",
    statusCode: updateIncidentStateHandler
  });
}

function updateIncidentPriority(newPriority) {
  $.ajax({
    url: "/incidents/priority",
    data: {
      'incidentId': incidentId,
      'priority': newPriority.value
    },
    type: "PUT",
    statusCode: updateIncidentPriorityHandler
  });
}

function updateIncidentCommander(newCommander) {
    $.ajax({
        url: "/incidents/commander",
        data: {
            'incidentId': incidentId,
            'commanderId': newCommander
        },
        type: "PUT",
        statusCode: updateIncidentCommanderHandler
    });
}

$('#groupResponders').on('click', 'li', function() {
    var user_id= $(this).attr('user_id');
    var name= $(this).html();
    showAlertModal("Alert", "Are you sure you want to transfer command to " +name+"?");
    $('#btnTransferCommand').one('click',function () {
        $('#groupResponders').hide();
        updateIncidentCommander(user_id);
        updateIncidentState();
        createTeamGroupAjax();
        console.log("groupResponderId:"+groupResponderId+" ,groupDispatcherId:"+groupDispatcherId);
        getOneGroupInfo(groupResponderId,user_id);
        getOneGroupInfo(groupDispatcherId,user_id);
    });
    $('#btnCancelTransferCommand').click(function () {
        $('#groupResponders').hide();
    });
    $('#groupResponders').hide();
});

function displayForFirePersonel (user) {
  if (isFireChief(user.role) || isFirefighter(user.role)) {
    $('#groupResponders').append(respondersList(user));
  }
}

function displayForParamedics (user) {
  if (isParamedic(user.role)) {
    $('#groupResponders').append(respondersList(user));
  }
}

function displayForPolice (user) {
  if (isPoliceChief(user.role) || isPolicePatrolOfficer(user.role)) {
    $('#groupResponders').append(respondersList(user));
  }
}

function displayForOtherUsers (user) {
  if (!isDispatcher(user.role) && !isAdministrator(user.role) && !isCitizen(user.role)) {
    $('#groupResponders').append(respondersList(user));
    showMessageModal("Error!", "No Incident Type has been selected");
  }
}

let getUserResponseHandler = {
  200: function(users){
    for (i=0; i<users.length; i++) {
      if (emergencyType ===1) {
        displayForFirePersonel(users[i]);
      } else if (emergencyType === 2) {
        displayForParamedics(users[i]);
      } else if (emergencyType ===3) {
        displayForPolice(users[i]);
      } else {
        displayForOtherUsers(users[i]);
      }
    }
  },
  404: function(response) {
    console.log(response);
    showMessageModal("Error!", "No Incident Type has been selected");
  }
};

function transferCommand(commander) {
  getIncidentType();
  $('#groupResponders').show();
  $('#groupResponders').empty();

  // TODO change true to false for actual functionality
  getUsersHTTP(getUserResponseHandler, null, false);
}

function respondersList(user) {
    // generate list element of available commanders
    return ($('<li class="list-group-item list-group-item-secondary" user_id='+user._id+'>' + user.username + '</li>'));
}

function getOneGroupInfo(groupId,userId){
    let getOneGroupInfoResponseHandler = {
        200: function(groupData){
            console.log(groupData.name);
            groupName=groupData.name;
            if(!groupData.participants.includes(userId)){
                updateGroupParticipant(groupData,userId,groupId);
            }

        },
        500: function() {
            console.log('Error, could not retrieve group info.');
        }
    };
    getOneGroupInfoAjax(groupId, getOneGroupInfoResponseHandler);
}

function updateGroupParticipant(groupData,userId,groupId) {
    let group =groupData;
    group.participants.push(userId);
    updateGroupAjax(groupId, group, function () {
        console.log('Group updated successfully!');
    }, function () {
        console.log('Error! Group is not updated.');
    });
}

function closeIncidentPage() {
    responderClosedIncident(incidentId);
    closeIncidentButton.prop('disabled', true);
    $('#commander').prop('disabled', true);
    $('#priority').prop('disabled', true);
    $('#closeIncident').text('Incident is closed');
    $('#chatWithResponders') .text('View Team Discussion Group');
    $('#allocateResourcesButton').hide();
    $('#closeDateTime').show();
}

function incidentOpenPage() {
    closeIncidentButton.prop('disabled', false);
    $('#commander').prop('disabled', false);
    $('#priority').prop('disabled', false);
    $('#closeIncident').text('Close Incident');
    $('#chatWithResponders') .text('Chat with Responders');
    $('#allocateResourcesButton').show();
    $('#closeDateTime').hide();

}

function getIncidentState() {
  $.ajax({
     url: "/incidents/state/"+incidentId,
     type: "GET",
     statusCode: getIncidentStateHandler
  });
}

function responderClosedIncident(incidentId) {
  $.ajax({
     url: "/incidents/closedState/"+incidentId,
     type: "PUT",
     statusCode: updateIncidentStateHandler
  });
}


