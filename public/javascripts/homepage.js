let socket = io();

let id = $('#id').html();
let user = $('#userName').html();
let role = $('#role').html();
let incidentId = $('#incidentId').html();
let group911Id = $('#group911Id').html();

var mainPage = $('#mainPage');
var userWindow = $('#user_window');
var chatWindow = $('#chat_window');
var announceWindow = $('#announce_window');
var supplyWindow = $('#supply_window');
var groupsWindow = $('#groups_window');
var mapWindow = $('#map_window');
var profileWindow = $('#profile_window');
var incidentWindow = $('#incident_window');
var incidentDispatcherWindow = $('#incident_dispatcher_window');
var incidentFirstResponderWindow = $('#incident_firstResponder_window');
var patientWindow = $('#patient_window');
let patientsDirectoryWindow = $('#patients_directory_window');
var shareStatusWindow = $('#share_status');
var resourceWindow = $('#resource_window');
let resourceReqDirectoryWindow = $('#resource_req_directory_window');
var organizationWindow = $('#organization_window');
var situationsWindow = $('#situations_window');
var situationWindow = $('#newSituation_window');
var hospitalWindow = $('#hospital_window');
let hospitalDirectoryWindow = $('#hospital_directory_window');
let truckWindow = $('#truck_inventory_window');
let truckDirectoryWindow = $('#truck_directory_window');
var erbedWindow = $('#erbed_window');
let dashboardWindow = $('#dashboard_window');
let orgTrackingMapWindow = $('#org-tracking-map-window');
let instructionWindow = $('#instructionWindow');

let backBtn = $('#backToPrevious');
let backToMainPageBtn = $('#userTagIcon');
let pageTitle = $('#pageTitle');

// Homepage buttons
var pubChatBtn = $('#pubChatBtn');
var userListBtn = $('#userListBtn');
var announcementBtn = $('#announcementBtn');
var groupsBtn = $('#groupsBtn');
var mapBtn = $('#mapBtn');
var emergencyBtn = $('#911Btn');
var incidentsBtn = $('#incidentsBtn');
var resourceAllocationBtn = $('#resourceAllocationBtn');
var patientsBtn = $('#patientsBtn');
var firstAidBtn = $('#firstAidBtn');
var findHospitalBtn = $('#findHospitalBtn');
var bedsAvailableBtn = $('#bedsAvailableBtn');
var statusBtn = $('#statusBtn');
var organizationBtn = $('#organizationBtn');
var dashboardBtn = $('#dashboardBtn');
var situationsBtn = $('#situationsBtn');

let data = {
  'name': '',
  'description': '',
  'participants': []
};

// Users connected
socket.on('connect', function () {
  id = $('#id').html();
  socket.emit('login', id);
});

socket.on('Incident assignee changed', function (doc) {
  announce = appendAnnouncement(JSON.parse(doc), true);
  if (id === (JSON.parse(doc)).commanderId) {
    showMessageModal('Announcement', 'You have been assigned an incident!');
  }
});

function isIncluded(list, id) {
  for (let i = 0; i < list.length; i++) {
    if (list[i]._id === id) {
      return true;
    }
  }
  return false;
}

socket.on('new assignment', function (resources) {
  for (let i = 0; i < resources.length; i++) {
    let vehicle = resources[i];
    if (vehicle.allocated.kind === "Area") {
      if (isIncluded(vehicle.persons, id)) {
        showMessageModal('Announcement', 'You have been assigned to a Patrol Area.');
      }
    } else if (vehicle.allocated.kind === "Incident") {
       if (isIncluded(vehicle.persons, id)) {
        showMessageModal('Announcement', 'You have been assigned to an incident.');
      }
    }
  }
});

socket.on('new situation', function (situation) {
  if (situation.creatorId !== id) {
    $('#modalNewSituationAlert').show();
  }
});

if (isCitizen(role) || isAdministrator(role)) {
  socket.on('Dispatcher opened step 3', function (socketIncidentId) {
    if (incidentId === socketIncidentId) {
      let disableThese = ['breathing', 'citizenPatientsProfile',
      'conscient', 'fireInjury', 'flame', 'getOut', 'hazardous', 'patient',
      'safe', 'sex', 'smoke', 'suspectLeft', 'weapon', 'weaponInjury'];

      let markReadOnly = ['citizenAge', 'citizenCrimeDetail', 'citizenChiefComplaint',
        'citizenSuspectDescription', 'citizenPeople', 'smokeColor', 'smokeQuantity'];

      for (let i = 0; i < disableThese.length; i++) {
        $('#incident_window input[name=' + disableThese[i] + ']').prop('disabled', true);
      }
      for (let i = 0; i < markReadOnly.length; i++) {
        $('#' + markReadOnly[i]).prop('readonly', true);
      }
    }
  });
}

function hideAllWindows () {
  mainPage.hide();
  navShowSearchBtn.hide();
  addSupplyBtn.hide();
  navSearchDiv.hide();
  userWindow.hide();
  chatWindow.hide();
  groupsWindow.hide();
  mapWindow.hide();
  shareStatusWindow.hide();
  announceWindow.hide();
  supplyWindow.hide();
  profileWindow.hide();
  incidentWindow.hide();
  instructionWindow.hide();
  incidentDispatcherWindow.hide();
  incidentFirstResponderWindow.hide();
  patientWindow.hide();
  resourceWindow.hide();
  resourceReqDirectoryWindow.hide();
  organizationWindow.hide();
  hospitalWindow.hide();
  hospitalDirectoryWindow.hide();
  patientsDirectoryWindow.hide();
  truckDirectoryWindow.hide();
  truckWindow.hide();
  erbedWindow.hide();
  dashboardWindow.hide();
  situationsWindow.hide();
  situationWindow.hide();
  orgTrackingMapWindow.hide();
  findHospitalPage.DOMs.window.hide();
  requestResourcePage.DOMs.window.hide();
  NursePage.DOMs.window.hide();
  firstAidInstructionPage.DOMs.dirWindow.hide();
  firstAidInstructionPage.DOMs.aidWindow.hide();
}

function refreshPage (isBack, title, state = {}) {
  if (isBack === false && title !== currentWindow) {
    storeWindowHistory();
  }
  hideAllWindows();
  currentWindow = title;
  currentState = state;
  setPageTitle();
}

function showMainPage (isBack = false) {
  refreshPage(isBack, HOMEPAGE_TITLE);
  mainPage.fadeIn();
  if (isResponder(role)) {
    incidentsBtn.show();
    dashboardBtn.show();
  }
  if (isAdministrator(role) || isResponder(role)) {
    organizationBtn.show();
  }
  situationsBtn.show();
  if (isCitizen(role) || isAdministrator(role)) {
    statusBtn.show();
    emergencyBtn.show();
  } else if (isPoliceChief(role) || isPolicePatrolOfficer(role) || isFireChief(role) || isFirefighter(role)) {
    resourceAllocationBtn.show();
  } else if (isParamedic(role)) {
    patientsBtn.show();
    firstAidBtn.show();
    findHospitalBtn.show();
  } else if (isNurse(role)) {
    bedsAvailableBtn.show();
    patientsBtn.show();
    firstAidBtn.show();
  }
}

function clickGroups (isBack = false) {
  refreshPage(isBack, GROUP_WINDOW_TITLE);
  groupsWindow.show();
  loadGroupListPage();
}

function clickIncident(isBack = false) {
  title = isCitizen(role) || isAdministrator(role) ? REACH911_WINDOW_TITLE : INCIDENT_WINDOW_TITLE;
  refreshPage(isBack, title);
  incidentId = $('#incidentId').html();
  if (isDispatcher(role)) {
    getIncidentsForDispatcher(id);
    incidentDispatcherWindow.show();
  } else if (isCitizen(role) || isAdministrator(role)) {
    incidentWindow.show();
    initIncidentMap();
  } else {
    getIncidentsForFirstResponder(id);
    incidentFirstResponderWindow.show();
  }
}

function clickOrganizations(isBack = false) {
  refreshPage(isBack, ORGANIZATION_WINDOW_TITLE);
  organizationWindow.show();
  if (isAdministrator(role)) {    
    loadOrganizationListPage();
  } else if (isResponder(role)) {
    loadOrganizationViewPage(id);
  }
}

function clickSituations (isBack = false) {
  refreshPage(isBack, SITUATIONS_WINDOW_TITLE);
  situationsWindow.show();
  loadSituationsPage();
}

function resetNewSituationPage () {
  affectedUserListButton.hide();
  submitNewSituationBtn.text("SUBMIT");
  closeSituationButton.hide();
  situationName.val('');
  $('#situationAddress').val('');
  situationNameForm.show();
  situationAddressForm.show();
  situationRadiusForm.show();
  situationDetail.hide();
  affectedAreaRadius.val('');
  newSituationDescription.val('');
  newSituationSpecialNotes.val('');
  situationDetail.empty();
  newSituationDescription.prop('disabled', false);
  newSituationSpecialNotes.prop('disabled', false);
  newSituationTitle.text('New Situation');
  submitNewSituationBtn.show();
}

function displaySituationPage (isBack = false, isNew) {
  if (isNew) {
    refreshPage(isBack, NEW_SITUATION_WINDOW_TITLE);
    resetNewSituationPage();
  } else {
    refreshPage(isBack, SITUATION_DETAIL_WINDOW_TITLE);
  }
  situationWindow.show();
  loadNewSituationPage();
}

function displayIncidentDetail(incidentIdValue) {
  $('#incidentId').html(incidentIdValue);
  incidentId = incidentIdValue;
  if (isDispatcher(role)) {
    displayIncidentId();
    updateIncidentState();
  }
  getIncidentAddress();
  initIncidentMap();
  // Need to get the questions based on the emergency type
  getQuestionsForEmergency();
  hideAllWindows();
  incidentWindow.show();
  showStep(1);
}

function clickDashboard(isBack = false) {
  refreshPage(isBack, DASHBOARD_WINDOW_TITLE);
  dashboardWindow.show();
}

$(function () {
  $('body').css('background-color', 'rgb(241, 241, 241)');
  loadSelectVehiclePage();
  showMainPage();
  chatWindow.find('.first-row').height($(window).height());
  supplyWindow.find('.first-row').height($(window).height());
  userWindow.height($(window).height());

  groupsBtn.click(function () {
    clickGroups();
  });

  groupTab.click(function () {
    clickGroups();
  });

  organizationBtn.click(function() {
    clickOrganizations();
  });

  situationsBtn.click(function () {
    clickSituations();
  });

  $('#noUpdateStatusForSituation').click(function () {
    $('#modalNewSituationAlert').hide();
  });

  $('#updateStatusForSituation').click(function () {
    $('#modalNewSituationAlert').hide();
    clickStatus();
  });

  logOutTab.click(function () {
    logoutHTTP({
      200: function(response) {
        window.location.replace('/');
      },
      501: function(response) {
        showMessageModal('Logout Failed', 'You must transfer your command before logout.'); 
      }
    });
  });
});
