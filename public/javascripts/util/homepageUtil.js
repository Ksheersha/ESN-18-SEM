// Needs to be checked after privilege roles are completed
let DISPATCHER = 'Dispatcher';
let POLICE_CHIEF = 'PoliceChief';
let POLICE_PATROL_OFFICER = 'PatrolOfficer';
let FIRE_CHIEF = 'FireChief';
let FIRE_FIGHTER = 'Firefighter';
let PARAMEDIC = 'Paramedic';
let NURSE = 'Nurse';
let ADMINISTRATOR = 'Administrator';
let CITIZEN = 'Citizen';
let COORDINATOR = 'isCoordinator';

let homepageTitle = {
  'Dispatcher': 'ESN Dispatcher',
  'PoliceChief': 'ESN Police',
  'PatrolOfficer': 'ESN Police',
  'FireChief': 'ESN Fire',
  'Firefighter': 'ESN Fire',
  'Paramedic': 'ESN Paramedic',
  'Nurse': 'ESN Nurse',
  'Citizen': 'ESN Citizen',
  'Administrator': 'ESN Citizen'
};

function getTimeString(timestamp) {
  var date = new Date(timestamp);
  return date.getFullYear() + "-" + ensureTwoDigits(date.getMonth() + 1) + "-" + ensureTwoDigits(date.getDate())
    + " " + ensureTwoDigits(date.getHours()) + ":" + ensureTwoDigits(date.getMinutes()) + ":" + ensureTwoDigits(date.getSeconds());
}

function ensureTwoDigits(val) {
  if (val < 10) {
    return '0' + val.toString();
  } else {
    return val.toString();
  }
}

function getStatusIcon(status) {
  if (status === 'OK') {
    return "<i class='material-icons status icon-ok'>check_circle</i>";
  } else if (status === 'Help') {
    return "<i class='material-icons status icon-help'>warning</i>";
  } else if (status === 'Emergency') {
    return "<i class='material-icons status icon-emergency'>add_alert</i>";
  } else {
    return "<i class='material-icons status'>help</i>";
  }
}

function getEscapedInputBoxContent(inputBox) {
  return inputBox.val().replace("</", "<\\/").replace(/\n/, "");
};

function messageChatBoxSyntax(docs) {
  var divStr = '';
  if (docs.username === user) {
    divStr += '<div class="col-3"></div><div class="col-9 chat-box chat-box-me ml-auto">';
  } else {
    divStr += '<div class="col-9 chat-box">';
  }
  return divStr;
}

function messageSenderInfoSyntax(docs) {
  var divStr = '';
  divStr += '<div class="sender-info">';
  divStr += getStatusIcon(docs.status);
  if (docs.username === user) {
    divStr += ' Me @  ';
  } else {
    divStr += ' ' + docs.username + ' @  ';
  }
  divStr += getTimeString(docs.timestamp) + '</div>';
  return divStr;
}

function isExpand(window) {
  return window.is(':visible');
}

function isDispatcher(role){
  return role === DISPATCHER;
}
function isPoliceChief(role){
  return role === POLICE_CHIEF;
}
function isPolicePatrolOfficer(role){
  return role === POLICE_PATROL_OFFICER;
}
function isFireChief(role) {
  return role === FIRE_CHIEF;
}
function isFirefighter(role) {
  return role === FIRE_FIGHTER;
}
function isParamedic(role) {
  return role === PARAMEDIC;
}
function isNurse(role) {
  return role === NURSE;
}
function isAdministrator(role) {
  return role === ADMINISTRATOR;
}
function isCitizen(role) {
  return role === CITIZEN;
}
function isCoordinator(role) {
    return role === COORDINATOR;
}
function isResponder(role) {
  return isDispatcher(role) || isFirstResponder(role);
}
function isFirstResponder(role) {
  return isPoliceChief(role) || isPolicePatrolOfficer(role) || isFireChief(role) || isFirefighter(role) || isParamedic(role);
}