let incidentsDifferentStates = $("#incidentsDifferentStates");
let incidentsDifferentStatesAndPriorities = $("#incidentsDifferentStatesAndPriorities");
let incidentsDifferentEmergencyTypes = $("#incidentsDifferentEmergencyTypes");
let incidentsWeaponRelated = $("#incidentsWeaponRelated");
let incidentsWeeklyTrend = $("#incidentsWeeklyTrend");
let incidentsCauseOfFire = $("#incidentsCauseOfFire");
let incidentMedicalCondition = $("#incidentMedicalCondition");
let numberOfPersonnels= $("#numberOfPersonnels");
let resourcesInDifferentStates = $("#resourcesInDifferentStates");

var incidentsDifferentStatesChart ="",incidentsDifferentStatesAndPrioritiesChart="",incidentsDifferentEmergencyTypesChart="";
var incidentsWeaponRelatedChart="",incidentsWeeklyTrendChart="",incidentsCauseOfFireChart="";
var incidentMedicalConditionChart="",numberOfPersonnelsChart="",resourcesInDifferentStatesChart="";

let getDataForChartsHandler = {
  200: function (chartsData) {
    generateCharts(chartsData);
  },
  500: function () {
    showMessageModal('Error!', 'There was an error when generating the charts! Please try again.');
  }
};

function generateCharts(chartsData) {
  if(incidentsDifferentStatesChart == "") {
    incidentsDifferentStatesChart = new Chart(incidentsDifferentStates[0].getContext('2d'), chartsData[0]);
  }
  else {
    incidentsDifferentStatesChart.data.datasets = chartsData[0].data.datasets;
    incidentsDifferentStatesChart.update();
  }

  if(incidentsDifferentStatesAndPrioritiesChart == "") {
    incidentsDifferentStatesAndPrioritiesChart = new Chart(incidentsDifferentStatesAndPriorities[0].getContext('2d'), chartsData[1]);
  }
  else {
    incidentsDifferentStatesAndPrioritiesChart.data.datasets = chartsData[1].data.datasets;
    incidentsDifferentStatesAndPrioritiesChart.update();
  }

  if(incidentsDifferentEmergencyTypesChart == "") {
    incidentsDifferentEmergencyTypesChart = new Chart(incidentsDifferentEmergencyTypes[0].getContext('2d'), chartsData[2]);
  }
  else {
    incidentsDifferentEmergencyTypesChart.data.datasets = chartsData[2].data.datasets;
    incidentsDifferentEmergencyTypesChart.update();
  }

  if(incidentsWeaponRelatedChart == "") {
    incidentsWeaponRelatedChart = new Chart(incidentsWeaponRelated[0].getContext('2d'), chartsData[3]);
  }
  else {
    incidentsWeaponRelatedChart.data.datasets = chartsData[3].data.datasets;
    incidentsWeaponRelatedChart.update();
  }

  if(incidentsWeeklyTrendChart == "") {
    incidentsWeeklyTrendChart = new Chart(incidentsWeeklyTrend[0].getContext('2d'), chartsData[4]);
  }
  else {
    incidentsWeeklyTrendChart.data.datasets = chartsData[4].data.datasets;
    incidentsWeeklyTrendChart.update();
  }

  if(incidentsCauseOfFireChart == "") {
    incidentsCauseOfFireChart = new Chart(incidentsCauseOfFire[0].getContext('2d'), chartsData[5]);
  }
  else {
    incidentsCauseOfFireChart.data.datasets = chartsData[5].data.datasets;
    incidentsCauseOfFireChart.update();
  }

  if(incidentMedicalConditionChart == "") {
    incidentMedicalConditionChart = new Chart(incidentMedicalCondition[0].getContext('2d'),chartsData[6]);
  }
  else {
    incidentMedicalConditionChart.data.datasets = chartsData[6].data.datasets;
    incidentMedicalConditionChart.update();
  }

  if(numberOfPersonnelsChart == "") {
    numberOfPersonnelsChart = new Chart(numberOfPersonnels[0].getContext('2d'),chartsData[7]);
  }
  else {
    numberOfPersonnelsChart.data.datasets = chartsData[7].data.datasets;
    numberOfPersonnelsChart.update();
  }

  if(resourcesInDifferentStatesChart== ""){
    resourcesInDifferentStatesChart= new Chart(resourcesInDifferentStates[0].getContext('2d'),chartsData[8]);
  }
  else {
    resourcesInDifferentStatesChart.data.datasets = chartsData[8].data.datasets;
    resourcesInDifferentStatesChart.update();
  }

}

function getDataForCharts() {
  var urlForRole = "";
  if(isDispatcher(role)) {
    urlForRole = '/dashboard/dispatcher';
  }
  if(isParamedic(role) || isNurse(role)) {
    urlForRole = '/dashboard/medical';
  }
  if(isFireChief(role) || isFirefighter(role)) {
    urlForRole = '/dashboard/fire';
  }
  if(isPoliceChief(role) || isPolicePatrolOfficer(role)) {
    urlForRole = '/dashboard/police';
  }

  $.ajax({
    url: urlForRole,
    type: "GET",
    statusCode: getDataForChartsHandler
  });
}

$(function () {

  dashboardTab.click(function() {
    clickDashboard();
    getDataForCharts();
  });

  dashboardBtn.click(function() {
    clickDashboard();
    getDataForCharts();
  });

});