let moreMenuBtn = $('#moreMenu');

// Common Tabs
let pubChatTab = $('#pubChatTab');
let userListTab = $('#userListTab');
let announcementTab = $('#announcementTab');
let groupTab = $('#groupTab');
let mapTab = $('#mapTab');
let logOutTab = $('#logOutTab');
// For Citizen
let statusTab = $('#statusTab');
// For Dispatcher
let incidentTab = $('#incidentTab');
// For Nurse
let bedsAvailableTab = $('#bedsAvailableTab');
let findHospitalTab = $('#findHospitalTab');
let firstAidTab = $('#firstAidTab');
let drugsTab = $('#drugsTab');
let hospitalDirectoryTab = $('#hospitalDirectoryTab');

// Dropdown menu items
let supplyTab = $('#supplyTab');
let profileTab = $('#profileTab');
let adminOrgTab = $('#adminOrgTab');
let adminUserProfileTab = $('#adminUserProfileTab');
let organizationTab = $('#organizationTab');
let resourceAllocTab = $('#resourceAllocTab');
let esnParamedicTab = $('#esnParamedicTab');
let patientsTab = $('#patientsTab');
let esnFireTab = $('#esnFireTab');
let dashboardTab = $('#dashboardTab');
let fireTruckDirectoryTab = $('#fireTruckDirectoryTab');
let resourceReqDirectoryTab = $('#resourceReqDirectoryTab');
let firstAidInstructionTab = $('#firstAidInstructionTab');

let userTagIcon = $('#userTagIcon');
let userTagName = $('#userTagName');
let nursePageTab = $('#nursePageTab');


let historyWindow = [];
let currentWindow; // The current page title
let currentWindowState; // The current page parameter

const HOMEPAGE_TITLE = 'ESN';
const MESSAGES_WINDOW_TITLE = 'Messages';
const CONTACT_WINDOW_TITLE = 'Contacts';
const ANNOUNCEMENT_WINDOW_TITLE = 'Announcements';
const GROUP_WINDOW_TITLE = 'Groups';
const MAP_WINDOW_TITLE = 'Map';
const STATUS_WINDOW_TITLE = 'Status';
const INCIDENT_WINDOW_TITLE = 'Incidents';
const INCIDENT_DETAIL_TITLE = 'Incident';
const REACH911_WINDOW_TITLE = '911';
const RESOURCE_WINDOW_TITLE = 'Resources';
const RESOURCE_REQ_DIRECTORY_TITLE = 'Requests';
const PATIENT_WINDOW_TITLE = 'Patient';
const PATIENTS_WINDOW_TITLE = 'Patients';
const PROFILE_WINDOW_TITLE = 'Profile';
const ORGANIZATION_WINDOW_TITLE = 'Organization';
const HOSPITAL_DIRECTORY_WINDOW_TITLE = 'Hospitals';
const SUPPLY_WINDOW_TITLE = 'Supply';
const HOSPITAL_WINDOW_TITLE = 'Hospital';
const ERBED_WINDOW_TITLE = 'Beds';
const DASHBOARD_WINDOW_TITLE = 'Dashboard';
const SITUATIONS_WINDOW_TITLE = 'Situations';
const NEW_SITUATION_WINDOW_TITLE = 'New Situation';
const SITUATION_DETAIL_WINDOW_TITLE = 'Situation Details';
const TRUCK_DIRECTORY_WINDOW_TITLE = 'Fire Trucks';
const TRUCK_WINDOW_TITLE = 'Fire Truck';
const FIND_HOSPITAL_WINDOW_TITLE = 'Find Hospital';

const backTo = {
  'ESN': function () { showMainPage(true); },
  'Messages': function () { clickPubChat(true); },
  'Contacts': function () { clickUserList(true); },
  'Announcements': function () { clickAnnouncement(true); },
  'Groups': function () { clickGroups(true); },
  'Map': function () { clickMapInfo(true); },
  'Status': function () { clickStatus(true); },
  'Incidents': function () { clickIncident(true); },
  'Incident': function () { showIncidentDetail(true); },
  '911': function () { clickIncident(true); },
  'Resources': function () { showResourcePage(true); },
  'Resource Reqs': function() { resourceReqDirectory.load(true); },
  'Patient': function (state) { showPatientPage(true, state); },
  'Patients': function () {clickPatients(true)},
  'Profile': function () { clickProfile(true); },
  'Organization': function () {},
  'Supply': function () { clickSupply(true); },
  'Fire Trucks': function () { clickFireTruckDirectory(true);},
  'Fire Truck' : function (state) {clickTruckResourcePage(true, state);},
  'Hospitals': function () {clickHospitalDirectory(true); },
  'Hospital': function(state) {clickHospitalPage(true, state); },
  'Beds': function() { clickERBed(true);},
  'Dashboard': function() {clickDashboard(true);},
  'Situations': function () {clickSituations(true);},
  'Find Hospital': function () {findHospitalPage.load(true);},
  'Request': function (state) {requestResourcePage.load(true, state);},
  'Nurse Directory': function () {NursePage.functions.clickTab();},
  'First Aid Inst.': function () {firstAidInstructionPage.functions.load(firstAidInstructionPage.loadDirState);},
  'First Aid': function() {instructionListPage.load(true);}
};

let usertag = {
  'Dispatcher': {icon: 'directions_run', namePrefix: 'D.'},
  'PoliceChief': {icon: 'local_taxi', namePrefix: 'CP.'},
  'PatrolOfficer': {icon: 'local_taxi', namePrefix: 'P.'},
  'FireChief': {icon: 'whatshot', namePrefix: 'CF.'},
  'Firefighter': {icon: 'whatshot', namePrefix: 'F.'},
  'Paramedic': {icon: 'local_hospital', namePrefix: 'M.'},
  'Nurse': {icon: 'local_hotel', namePrefix: 'N.'},
  'Administrator': {icon: 'person', namePrefix: ''},
  'Citizen': {icon: 'person', namePrefix: ''}
};

function addDropdownItem (itemId, itemName) {
  moreMenuBtn.append("<a id='" + itemId + "' class='dropdown-item'>" + itemName + '</a>');
}

function addMenuItemsForDispatcher () {
  addDropdownItem('organizationTab', 'Organization');
  organizationTab = $('#organizationTab');
  addDropdownItem('dashboardTab', 'Dashboard');
  dashboardTab = $('#dashboardTab');
}

function addMenuItemsForOfficer () {
  addDropdownItem('resourceAllocTab', 'Resource Allocation');
  resourceAllocTab = $('#resourceAllocTab');
  addDropdownItem('esnParamedicTab', 'ESN Paramedic');
  esnParamedicTab = $('#esnParamedicTab');
  addDropdownItem('organizationTab', 'Organization');
  organizationTab = $('#organizationTab');
  addDropdownItem('hospitalDirectoryTab', 'Hospital Directory');
  hospitalDirectoryTab = $('#hospitalDirectoryTab');
  addDropdownItem('dashboardTab', 'Dashboard');
  dashboardTab = $('#dashboardTab');
  addDropdownItem('fireTruckDirectoryTab', 'Fire Trucks');
  fireTruckDirectoryTab = $('#fireTruckDirectoryTab')
  addDropdownItem('resourceReqDirectoryTab', 'Resource Requests');
  resourceReqDirectoryTab = $('#resourceReqDirectoryTab');
}

function addMenuItemsForNurse () {
  addDropdownItem('patientsTab', 'Patients');
  patientsTab = $('#patientsTab');
  addDropdownItem('firstAidTab', 'First Aid');
  firstAidTab = $('#firstAidTab');
  addDropdownItem('drugsTab', 'Drugs');
  drugsTab = $('#drugsTab');
  addDropdownItem('hospitalDirectoryTab', 'Hospital Directory');
  hospitalDirectoryTab = $('#hospitalDirectoryTab');
  addDropdownItem('dashboardTab', 'Dashboard');
  dashboardTab = $('#dashboardTab');
  addDropdownItem('resourceReqDirectoryTab', 'Resource Requests');
  resourceReqDirectoryTab = $('#resourceReqDirectoryTab');
}

function addMenuItemsForParamedic () {
  addDropdownItem('resourceAllocTab', 'Resource Allocation');
  resourceAllocTab = $('#resourceAllocTab');
  addDropdownItem('findHospitalTab', 'Find Hospital');
  findHospitalTab = $('#findHospitalTab');
  addDropdownItem('esnFireTab', 'ESN Fire');
  esnFireTab = $('#esnFireTab');
  addDropdownItem('organizationTab', 'Organization');
  organizationTab = $('#organizationTab');
  addDropdownItem('dashboardTab', 'Dashboard');
  dashboardTab = $('#dashboardTab');
  addDropdownItem('nursePageTab','Nurse Directory');
  nursePageTab = $('#nursePageTab');
  addDropdownItem('firstAidInstructionTab','First Aid Inst.');
  firstAidInstructionTab = $('#firstAidInstructionTab');
  addDropdownItem('fireTruckDirectoryTab', 'Fire Trucks');
  fireTruckDirectoryTab = $('#fireTruckDirectoryTab')
}

function addMenuItemsForAdmin () {
  addDropdownItem('adminOrgTab', 'Administer Organization Chart');
  adminOrgTab = $('#adminOrgTab');
  addDropdownItem('adminUserProfileTab', 'Administer User Profile');
  adminUserProfileTab = $('#adminUserProfileTab');
}

function addMenuItemsForCitizen () {
  addDropdownItem('incidentTab', '911');
  incidentTab = $('#incidentTab');
}

function generateDropdownMenu () {
  if (isDispatcher(role)) {
    addMenuItemsForDispatcher();
  } else if (isPoliceChief(role) || isPolicePatrolOfficer(role) || isFireChief(role) || isFirefighter(role)) {
    addMenuItemsForOfficer();
  } else if (isParamedic(role)) {
    addMenuItemsForParamedic();
    addMenuItemsForNurse();
  } else if (isNurse(role)) {
    addMenuItemsForNurse();
  } else if (isAdministrator(role)) {
    addMenuItemsForCitizen();
    addMenuItemsForAdmin();
  } else {
    addMenuItemsForCitizen();
  }
  addDropdownItem('profileTab', 'Profile');
  profileTab = $('#profileTab');
  addDropdownItem('supplyTab', 'Supply');
  supplyTab = $('#supplyTab');
}

function showUserTag (title) {
  userTagIcon.html(usertag[role].icon);
  let usernameWithPrefix = usertag[role].namePrefix + user;
  let maxLength = (title === ANNOUNCEMENT_WINDOW_TITLE || title === HOMEPAGE_TITLE) ? 5 : 12;
  usernameWithPrefix = usernameWithPrefix.length > maxLength
    ? usernameWithPrefix.substr(0, maxLength) + '...' : usernameWithPrefix;
  userTagName.html('(' + usernameWithPrefix + ')');
}

function setPageTitle () {
  if (currentWindow === HOMEPAGE_TITLE) {
    pageTitle.html(homepageTitle[role]);
  } else {
    pageTitle.html(currentWindow);
  }
  showUserTag(currentWindow);
}

function storeWindowHistory () {
  if (currentWindow) {
    historyWindow.push({
      title: currentWindow,
      state: currentState
    });
  }
}

function clickBackBtn () {
  let previousWindow = historyWindow.pop();
  if (previousWindow) {
    backTo[previousWindow.title](previousWindow.state);
  } else {
    window.location.replace('/logout');
  }
}

$(function () {
  generateDropdownMenu();

  navSearchInput.keyup(navSearchHandler);
  navMoreBtn.click(navMoreBtnHandler);
  navHideSearchBtn.click(hideNavSearch);
  navShowSearchBtn.click(showNavSearch);

  backBtn.click(function () {
    clickBackBtn();
  });

  backToMainPageBtn.click(function () {
    showMainPage();
  });
});
