let alertRole = $('#role');
let commanderContainer =  $('#commanderContainer');
let maydayContainer = $('#maydayContainer');
let alertPanelModal = $('#alertPanelModal');
let respondAlertModal = $('#respondAlertModal');
let topLeftBtn = $('#topLeftBtn');
let topMiddleBtn = $('#topMiddleBtn');
let topRightBtn = $('#topRightBtn');
let middleLeftBtn = $('#middleLeftBtn');
let middleCenterBtn = $('#middleCenterBtn');
let middleRightBtn = $('#middleRightBtn');
let bottomLeftBtn = $('#bottomLeftBtn');
let bottomMiddleBtn = $('#bottomMiddleBtn');
let bottomRightBtn = $('#bottomRightBtn');
let maydayBtn = $('#maydayBtn');
let alertMessageIdDOM = $('#alertMessageId');
let receiveAlertMessageDiv = $('#receiveAlertMessage');


let getAlertMessageResponder = {
  200: sendAlertMessageHandler,
  500: function (err) {
    console.log(err);
  }
};

let updateAlertMessageResponder = {
  500: function (err) {
    console.log(err);
  }
};

function showPersonnelPanel() {
  commanderContainer.hide();
  maydayContainer.show();
}

function showFireChiefPanel() {
  commanderContainer.show();
  maydayContainer.hide();
  setBtnName("VACATE","RESCUE In Progress","ALL CLEAR",
    "LIFE HAZ.", "P.A.R", "UTILITIES ON",
    "VERT.VENT", "CROSS VENT", "UTILITIES OFF");
}

function showPoliceChiefPanel() {
  commanderContainer.show();
  maydayContainer.hide();
  setBtnName("VACATE","SUSPECT ON SCENE","ALL CLEAR",
    "LIFE HAZ.", "P.A.R", "WEAPON",
    "HOLD FIRE", "USE FORCE", "HOSTAGE");
}

function setBtnName(topLeftValue,topMiddleValue,topRightValue,
                    middleLeftValue,middleCenterValue,middleRightValue,
                    bottomLeftValue,bottomMiddleValue,bottomRightValue) {
  topLeftBtn.text(topLeftValue);
  topMiddleBtn.text(topMiddleValue);
  topRightBtn.text(topRightValue);
  middleLeftBtn.text(middleLeftValue);
  middleCenterBtn.text(middleCenterValue);
  middleRightBtn.text(middleRightValue);
  bottomLeftBtn.text(bottomLeftValue);
  bottomMiddleBtn.text(bottomMiddleValue);
  bottomRightBtn.text(bottomRightValue);
}
function showAlertPanel(){
  let category = selectCategoryDOM.html();
  if ( category !== 'group') {
    showMessageModal('Prompt','Please select a group!');
    return;
  }
  let roleName = alertRole.html();
  if (roleName === FIRE_FIGHTER || roleName === POLICE_PATROL_OFFICER
      || roleName === PARAMEDIC || roleName === DISPATCHER) {
    showPersonnelPanel();
  } else if (roleName === FIRE_CHIEF) {
    showFireChiefPanel();
  } else if (roleName === POLICE_CHIEF) {
    showPoliceChiefPanel();
  } else {
    showMessageModal('Prompt','You are not a first responder!');
    return;
  }
  alertPanelModal.modal("show");
}


function sendAlertHelper(element){
  let content = element.text();
  let groupId = selectIdDOM.html();
  let id = idDOM.html();
  postAlertMessage(id,groupId,content,getAlertMessageResponder);
  alertPanelModal.modal("hide");
}

function constructAckAllMessage(alertContent){
  return alertContent + "<br>" + "Acknowledged by all<br>";
}

function constructAckNotAllMessage(alertContent,alertRecipients){
  let msg = alertContent + "<br>" + "Not Acked by :<br>";
  for(let i = 0;i< alertRecipients.length; i++){

    msg += alertRecipients[i].username + "<br>";
  }
  return msg;
}




function sendAlertMessageHandler(alertMessage) {
  let alertId = alertMessage._id;
  let alertContent = alertMessage.content;
  let groupId = alertMessage.groupId;
  let alertRecipients = alertMessage.recipients;
  // construct group Msg
  let username = userDOM.html();
  let id = idDOM.html();
  let userStatus = userStatusDOM.html();
  let data = {username, id, groupId, userStatus};

  if (alertRecipients.length === 0) {
    data.chatContent = constructAckAllMessage(alertContent);
    postGroupMessage(data, postGroupMessageHandler);
  } else {
    if(alertRecipients[0].username != undefined){
      data.chatContent = constructAckNotAllMessage(alertContent,alertRecipients);
      postGroupMessage(data, postGroupMessageHandler);
    }
    setTimeout(function () {
      getAlertMessage(alertId,getAlertMessageResponder);
    }, 5 * 1000);
  }
}

function receiveAlertMessageHandler(alertMessage) {
  let alertId = alertMessage._id;
  let alertContent = alertMessage.content;
  alertMessageIdDOM.text(alertId);
  receiveAlertMessageDiv.text(alertContent);
  respondAlertModal.modal('show');
}

function acknowledgeAlert() {
  let alertId = alertMessageIdDOM.text();
  let id = idDOM.html();
  updateAlertMessage(alertId,id,updateAlertMessageResponder);
}

$(function () {
  topLeftBtn.click(function(){
    sendAlertHelper(topLeftBtn)
  });
  topMiddleBtn.click(function(){
    sendAlertHelper(topMiddleBtn)
  });
  topRightBtn.click(function(){
    sendAlertHelper(topRightBtn)
  });
  middleLeftBtn.click(function(){
    sendAlertHelper(middleLeftBtn)
  });
  middleCenterBtn.click(function(){
    sendAlertHelper(middleCenterBtn)
  });
  middleRightBtn.click(function(){
    sendAlertHelper(middleRightBtn)
  });
  bottomLeftBtn.click(function(){
    sendAlertHelper(bottomLeftBtn)
  });
  bottomMiddleBtn.click(function(){
    sendAlertHelper(bottomMiddleBtn)
  });
  bottomRightBtn.click(function(){
    sendAlertHelper(bottomRightBtn)
  });
  maydayBtn.click(function () {
    sendAlertHelper(maydayBtn);
  });
  receiveAlertMessageDiv.click(acknowledgeAlert);
  socket.on('Alert Message Receive', receiveAlertMessageHandler);
});

