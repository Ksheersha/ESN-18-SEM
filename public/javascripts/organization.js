// Global Variables
let organizationListPageStates = {};
let organizationEditorPageStates = {};
let organizationViewPageStates = {};
let vehicles = [];

// Organization List page DOMs
let organizationListPageDOM = $('#organization_directory');
let organizationListDOM = $('#organizations');
let editOrganizationButtonDOM = $('#editOrganizationButton');

// Group Editor page DOMs
let organizationEditorPageDOM = $('#organization_manage');
let organizationNameDOM = $('#organization_name');
let personnelListDOM = $('#personnel_list');
let vehicleNumberInputDOM = $('#vehicles');
let submitOrganizationButtonDOM = $('#submitOrganizationInfo');
let cancelOrganizationButtonDOM = $('#cancelOrganizationInfo');

//Select Vehicle pop up DOMS
let modalSelectVehicleDOM = $('#modalSelectVehicle');
let vehicleSelectorDOM = $('#vehicle-selector');
let boardBtnDOM = $('#btnBoard');

// view Organization page DOMs
let trackOrganizationButtonDOM = $('#trackOrganizationButton');
let organizationViewPageDOM = $('#organization_view');
let organizationViewULDOM = $('#organizationViewUL');


// Organization List page builders

function buildOrganizationListPageHTML(done){
	let onSuccess = function(data){
    // build organization list
    organizationListDOM.empty();
    for (let i = 0; i < data.length; i++) {
      buildOneOrganizationView(organizationListDOM, data[i]);
    }

    done();
  };

  let onError = function(){
    showMessageModal('Error!', 'Organization information could not be loaded. Please try again.');
  };

  getChiefListAjax(onSuccess, onError);
}


// Organization Editor page builders

function buildPersonnelListItemHTML(user, participating){
  return $('<li class="' + buildCssClassNameForParticipantListItem(participating) + '" '
    +  'id=personnelListItemUserId' + user._id + ' userId=' + user._id + '> ' + user.username + '</li>');

}

function buildPersonnelListHTML(done){
  personnelListDOM.empty();

  let checked = [];
  let all = [];
  let unchecked = [];

  let checkedIds = [];

  for(let i = 0; i < organizationEditorPageStates.data['persons'].length; ++i) {
    checked.push(organizationEditorPageStates.data['persons'][i]);
    checkedIds.push(organizationEditorPageStates.data['persons'][i]['_id']);
  }


  let appendListItems = function(){
    // for(let i = 0; i < checked.length; ++i){
    //   personnelListDOM.append(buildPersonnelListItemHTML(checked[i], true));
    // }
    // for(let i = 0; i < unchecked.length; ++i){
    //   personnelListDOM.append(buildPersonnelListItemHTML(unchecked[i], false));
    // }

    userListAPI.buildSelectionList(personnelListDOM, checked, unchecked, 'personnelListItemUserId')
  };

  let getPersonnelCallback = function(data){
    for(let i = 0; i < data.length; ++i){
      all.push(data[i]);
    }
  };

  let getPersonnelAndBuildCallback = function(data){
    getPersonnelCallback(data);
    for(let i = 0; i < all.length; ++i){
      if(!checkedIds.includes(all[i]['_id'])){
        unchecked.push(all[i]);
      }
    }

    appendListItems();
    done();
  };

  if(organizationEditorPageStates.data.chief.role === 'PoliceChief'){
    getOfficerAjax(getPersonnelAndBuildCallback)
  }
  else if(organizationEditorPageStates.data.chief.role === 'FireChief'){
    getFirefighterAjax(function(data){
      getPersonnelCallback(data);
      getParamedicAjax(getPersonnelAndBuildCallback);
    })
  }

}

function buildOrganizationEditorPageHTML(done){
  let onSuccess = function(data){
    organizationEditorPageStates.data = data;

    organizationNameDOM.text(getDisplayName(data.chief));
    vehicleNumberInputDOM.val(data['vehicles'].length);

    buildPersonnelListHTML(done);
  };

  let onError = function(){
    showMessageModal('Error!', 'Organization information could not be loaded. Please try again.');
  };

  getChiefDetailAjax(organizationEditorPageStates.chiefId, onSuccess, onError);
}

//Select Vehicle Pop up Builder
function buildVehicleOptionHTML(vehicle){
  vehicleSelectorDOM.append('<option value ="' + vehicle.name + '">' + vehicle.name + '</option>');
}

function buildSelectVehiclePopupHTML(showVehicle){
  let onSuccess = function(data){
    vehicles = data.vehicles;
    for (let i = 0; i < data.vehicles.length; i++){
      buildVehicleOptionHTML(data.vehicles[i]);
    }
    if (vehicles.length !== 0){
      showVehicle();
    }
  };

  let onError = function() {
    showMessageModal('Error!', 'Vehicle information could not be loaded. Please try again.');
  };

  if(isFireChief(role) || isPoliceChief(role)){
    getOrganizationByIdChief(id, onSuccess, onError);
  }
  else{
    getOrganizationByIdPersonnel(id, onSuccess, onError);
  }
}

function buildOneOrganizationView(DOM, org) {
  DOM.append(buildChiefList(org.chief, organizationViewPageStates.id));
  DOM.append(buildPersonnelList(org.persons, org.chief._id));
  DOM.append(buildVehicleList(org.vehicles, org.chief._id));
}

function buildOrganizationViewPageHTML(done){
  let onSuccess = function(orgs){
    organizationViewULDOM.empty();
    for (let i in orgs) {
      if (isMyOrganization(orgs[i], organizationViewPageStates.id)) {
        let temp = orgs[i];
        orgs[i] = orgs[0];
        orgs[0] = temp;
        break;
      }
    }
    for (let i in orgs) {
      buildOneOrganizationView(organizationViewULDOM, orgs[i]);
    }
    done();
  };

  let onError = function(){
    showMessageModal('Error!', 'Organization information could not be loaded. Please try again.');
  };

  getChiefListAjax(onSuccess, onError);
}

// Organization Editor Page listeners

function extractOrganizationEditorFormData(){

  let data = {};
  data['vehicles'] = parseInt('' + vehicleNumberInputDOM.val());

  // let checked = [];
  // $("li[id^=personnelListItemUserId]").each(function(){
  //   if($(this).hasClass(buildCssClassNameForParticipantListItem(true))){
  //     checked.push($(this).attr('userId'));
  //   }
  // });
  data['persons'] = userListAPI.extractData('personnelListItemUserId');

  return data;
}

function submitOrganization(data){
  let onSuccess = function(data){
    loadOrganizationListPage();
    showMessageModal('Success!', 'Organization information updated.');
  };

  let onError = function(data){
    showMessageModal('Error!', 'Personnel/vehicles cannot be removed now because they are on duty.');
  };

  updateOrganizationAjax(organizationEditorPageStates.chiefId, data, onSuccess, onError)
}


// Page loaders

function loadOrganizationListPage(){
	buildOrganizationListPageHTML(function(){
    organizationEditorPageDOM.hide();
    organizationViewPageDOM.hide();
    organizationListPageDOM.show();
  });
}

function loadOrganizationEditorPage(chiefId){
  organizationEditorPageStates.chiefId = chiefId;
  buildOrganizationEditorPageHTML(function(){
    organizationListPageDOM.hide();
    organizationViewPageDOM.hide();
    organizationEditorPageDOM.show();
  });
}

function loadSelectVehiclePage(){
  if (isFireChief(role) || isFirefighter(role) || isParamedic(role) || isPoliceChief(role) || isPolicePatrolOfficer(role)) {
    buildSelectVehiclePopupHTML(function(){
      modalSelectVehicleDOM.modal('show');
    });
  }
}

function loadOrganizationViewPage(id) {
  organizationViewPageStates.id = id;
  buildOrganizationViewPageHTML(function() {
    organizationListPageDOM.hide();
    organizationEditorPageDOM.hide();
    organizationViewPageDOM.show();
  })
}

//Select Vehicle Listerner
function submitSelectVehicle(){
  let vehicleId = '';
  let user = {};

  user.persons = id;

  for (let i = 0; i < vehicles.length; i++){
    if (vehicles[i].name === vehicleSelectorDOM.val()){
      vehicleId = vehicles[i]._id;
    }
  }

  let onSuccess = function(){
    showMessageModal('Success!', 'Vehicle selected.');
  };

  let onError = function(){
    showMessageModal('Error', 'Vehicle select failed.')
  };

  selectVehicleAjax(vehicleId, user, onSuccess, onError);
}


// Event binding

$(function(){

  // Organization List page events

  organizationListDOM.on('click', 'button', function(){
    let chiefId = $(this).attr('chiefId');
    loadOrganizationEditorPage(chiefId);
  });
  // editOrganizationButtonDOM.click(function() {
  //   let chiefId = $(this).attr('chiefId');
  //   loadOrganizationEditorPage(chiefId);
  // })


  // Organization Editor page events

  // personnelListDOM.on('click', 'li', function () {
  //   changeListItemCheckedStatus($(this));
  // });

  cancelOrganizationButtonDOM.click(function () {
    loadOrganizationListPage();
  });

  submitOrganizationButtonDOM.click(function () {
    let data = extractOrganizationEditorFormData();
    console.log(data);
    submitOrganization(data);
  });

  boardBtnDOM.click(function() {
    if (vehicleSelectorDOM.val() !== 'None'){
      submitSelectVehicle();
    }
  });

  // Track Organization
  organizationViewPageDOM.on('click', '#trackOrganizationButton', function(){
    let chiefId = $(this).attr('chiefId');
    organizationViewPageDOM.hide();
    orgTrackingPage.load(chiefId);
  });

});
