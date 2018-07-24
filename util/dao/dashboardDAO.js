const dbUtil = require('../dbUtil');
const User = dbUtil.getModel('User');
const Incident = dbUtil.getModel('Incident');
const Vehicle = dbUtil.getModel('Vehicle');
const IncidentAnswer = dbUtil.getModel('IncidentAnswer');
const patient = dbUtil.getModel('Patient');
var moment = require('moment');

let chartsData = [];

let waitingIncidentsCount = 0;
let triageIncidentsCount = 0;
let assignedIncidentsCount = 0;
let closedIncidentsCount = 0;

let fireIncidentsCount = 0;
let medicalIncidentsCount = 0;
let policeIncidentsCount = 0;
let undefinedEmergencyTypeCount = 0;

let weaponRelatedIncidentCount = 0;
let notWeaponRelatedIncidentCount = 0;
let totalPoliceIncidents = 0;
let undefinedWeaponIncidentCount = 0;

let hazardMaterialIncidentCount = 0;
let otherFireIncidentCount = 0;
let totalFireIncidents = 0;
let undefinedFireCount = 0;
let noMedicalIncident = 0, noFireIncident = 0, noPoliceIncident = 0;

let medicalReasonCount = [];

let personnelCount = [];

let vehicleCount = [];

let waitingIncidentsCountForPriority = [];
let triageIncidentsCountForPriority = [];
let assignedIncidentsCountForPriority = [];
let closedIncidentsCountForPriority = [];

let trendIncidentLabels = [];
let trendFireIncidents = [];
let trendPoliceIncidents = [];
let trendMedicalIncidents = [];
let trendUndefinedIncidents = [];

let colors = [];

let currentRole = "";

class dashboardDAO {

  static resetChartVariables(currentRoleParam) {
    currentRole = currentRoleParam;

    waitingIncidentsCount = 0;
    triageIncidentsCount = 0;
    assignedIncidentsCount = 0;
    closedIncidentsCount = 0;
    fireIncidentsCount = 0;
    medicalIncidentsCount = 0;
    policeIncidentsCount = 0;
    undefinedEmergencyTypeCount = 0;
    weaponRelatedIncidentCount = 0;
    notWeaponRelatedIncidentCount = 0;
    totalPoliceIncidents = 0;
    undefinedWeaponIncidentCount = 0;
    hazardMaterialIncidentCount = 0;
    otherFireIncidentCount = 0;
    totalFireIncidents = 0;
    undefinedFireCount = 0;
    noMedicalIncident = 0, noFireIncident = 0, noPoliceIncident = 0;

    dashboardDAO.resetChartArrayVariables();
  }

  static resetChartArrayVariables() {
    colors = [];
    trendIncidentLabels = [];
    chartsData = [];

    for (let i = 0; i < 16; i++) {
      medicalReasonCount[i] = 0;
    }

    for (let i = 0; i < 7; i++) {
      personnelCount[i] = 0;
      trendFireIncidents[i] = 0;
      trendPoliceIncidents[i] = 0;
      trendMedicalIncidents[i] = 0;
      trendUndefinedIncidents[i] = 0;
      if (i != 7) vehicleCount[i] = 0;
    }

    for (let i = 0; i < 5; i++) {
      waitingIncidentsCountForPriority[i] = 0;
      triageIncidentsCountForPriority[i] = 0;
      assignedIncidentsCountForPriority[i] = 0;
      closedIncidentsCountForPriority[i] = 0;
    }
  }

  static getIncidentRelatedInfo() {
    return new Promise(function (resolve, reject) {
      Incident.find({}).populate("answerInfo").populate("patient")
        .then(function (incidents) {
          incidents.forEach(function (incident) {
            dashboardDAO.infoFromIncidents(incident);
            dashboardDAO.switchStateAndSetValues(incident);
            dashboardDAO.assignValuesForTrendChart(incident);
          });

          dashboardDAO.setValuesForIncidentRelatedCharts();
          resolve(chartsData);
        })
        .catch(function (err) {
          console.log(err);
          reject(err);
        });
    });
  }

  static switchStateAndSetValues(incident) {
    if (incident.state == Incident.incidentState.WAITING) {
      waitingIncidentsCount++;
      dashboardDAO.prioritiesForIncident(incident, waitingIncidentsCountForPriority);
      dashboardDAO.typeForIncident(incident);
    }
    else if (incident.state == Incident.incidentState.TRIAGE) {
      triageIncidentsCount++;
      dashboardDAO.prioritiesForIncident(incident, triageIncidentsCountForPriority);
      dashboardDAO.typeForIncident(incident);
    }
    else if (incident.state == Incident.incidentState.ASSIGNED) {
      assignedIncidentsCount++;
      dashboardDAO.prioritiesForIncident(incident, assignedIncidentsCountForPriority);
      dashboardDAO.typeForIncident(incident);
    }
    else {
      closedIncidentsCount++;
      dashboardDAO.prioritiesForIncident(incident, closedIncidentsCountForPriority);
      dashboardDAO.typeForIncident(incident);
    }
  }

  static assignValuesForTrendChart(incident) {
    var incidentDate = moment(incident.openingDateTime).format("MMM Do YY");

    for (let i = 0; i <= 6; i++) {
      if (moment().subtract(i, "days").format("MMM Do YY") == incidentDate) {
        dashboardDAO.switchEmergencyTypeForTrend(incident.emergencyType, 6 - i);
      }
    }
  }

  static setValuesForIncidentRelatedCharts() {
    // This chart is displayed for all roles
    dashboardDAO.setValuesForIncidentsStatesChart();
    // This chart is displayed for all roles
    dashboardDAO.setValuesForIncidentsStatesAndPrioritiesChart();
    if (currentRole == 'dispatcher') {
      dashboardDAO.setValuesForIncidentsEmergencyTypeChart();
    }
    if (currentRole == 'dispatcher' || currentRole == 'fire' || currentRole == 'police') {
      dashboardDAO.setValuesForIncidentTrendChart();
    }
    if (currentRole == 'police') {
      dashboardDAO.setValuesForIncidentsWeaponsRelatedChart();
    }
    if (currentRole == 'medical') {
      dashboardDAO.setValuesForIncidentMedicalConditionChart();
    }
    if (currentRole == 'fire') {
      dashboardDAO.setValuesForIncidentCauseOfFireChart();
    }
  }

  static switchEmergencyTypeForTrend(emergencyType, index) {
    switch (emergencyType) {
      case 1:
        trendFireIncidents[index]++;
        break;
      case 2:
        trendMedicalIncidents[index]++;
        break;
      case 3:
        trendPoliceIncidents[index]++;
        break;
      default:
        trendUndefinedIncidents[index]++;
    }
  }

  static getDataForCharts(currentRoleParam) {
    return new Promise(function (resolve, reject) {
      dashboardDAO.resetChartVariables(currentRoleParam);
      // dashboardDAO.generateColorConstants();
      dashboardDAO.getIncidentRelatedInfo()
        .then(function () {
          dashboardDAO.getAllResponders()
            .then(function () {
              dashboardDAO.getVehicleInfo()
                .then(function (chartsData) {
                  resolve(chartsData);
                })
                .catch(function (err) {
                  reject(err);
                });
            })
            .catch(function (err) {
              reject(err);
            });
        })
        .catch(function (err) {
          reject(err);
        });
    });
  }

  static generateLabelsForIncidentStatesAndPrioritiesChart() {
    let labelsArray = [];
    let states = ['Waiting', 'Triage', 'Assigned', 'Closed'];
    let priorities = ['Emergency', 'Urgent', 'Could Wait', 'Dismiss', 'Undefined'];

    states.forEach(function (state) {
      priorities.forEach(function (priority) {
        labelsArray.push(state + " in " + priority);
      });
    });

    return labelsArray;
  }

  static pushDataForIncidentStatesAndPrioritiesChart() {
    let dataValues = [];

    waitingIncidentsCountForPriority.forEach(function (value) {
      dataValues.push(value);
    });
    triageIncidentsCountForPriority.forEach(function (value) {
      dataValues.push(value);
    });
    assignedIncidentsCountForPriority.forEach(function (value) {
      dataValues.push(value);
    });
    closedIncidentsCountForPriority.forEach(function (value) {
      dataValues.push(value);
    });

    return dataValues;
  }

  static addCurrentChart(chartInfo) {
    chartsData.push({
      type: chartInfo.type,
      data: {
        labels: chartInfo.labels,
        datasets: [{
          label: chartInfo.label,
          data: chartInfo.data,
          backgroundColor: chartInfo.backgroundColor
        }]
      },
      options: {
        title: {
          display: true,
          text: chartInfo.text
        },
        legend: {
          position: 'bottom'
        },
        responsive: true,
        animation: {animateRotate: true},
        scales: chartInfo.type == 'pie' ? null : {xAxes: [{ticks: {autoSkip: false}}]},
      }
    });
  }

  static setValuesForIncidentsStatesAndPrioritiesChart() {
    let chartInfo = {
      type: 'bar',
      labels: dashboardDAO.generateLabelsForIncidentStatesAndPrioritiesChart(),
      label: 'Number of incidents in different states in different priorities',
      data: dashboardDAO.pushDataForIncidentStatesAndPrioritiesChart(),
      backgroundColor: ['#FFD700','#FFFF00','#FFFFE0','#FFFACD','#FAFAD2','#FF4500','#FF8C00','#FFA500','#FF7F50','#FFA07A','#008000','#2E8B57','#3CB371','#00FA9A','#90EE90','#FF0000','#FF5733','#DC143C','#FA8072','#A9A9A9'],
      text: 'Number of incidents in different priorities',
      options: {
        legend: {
          display:false,
          label:{
            fontSize: 0
          }
        }
      }
    };
    dashboardDAO.addCurrentChart(chartInfo);
  }

  static setValuesForIncidentsStatesChart() {
    let chartInfo = {
      type: 'pie',
      labels: ["Waiting", "Triage", "Assigned", "Closed"],
      label: 'Number of incidents in different states',
      data: [waitingIncidentsCount, triageIncidentsCount, assignedIncidentsCount, closedIncidentsCount],
      backgroundColor: ['#FFD700','#FFA500','#008000','#FF5733'],
      text: "Number of incidents in different states"
    };
    dashboardDAO.addCurrentChart(chartInfo);
  }

  static setValuesForIncidentsEmergencyTypeChart() {
    let chartInfo = {
      type: 'pie',
      labels: ["Fire", "Medical", "Police", "Undefined"],
      label: 'Number of incidents in different emergency types',
      data: [fireIncidentsCount, medicalIncidentsCount, policeIncidentsCount, undefinedEmergencyTypeCount],
      backgroundColor: ['#FFC300','#FF5733','#0000FF','#A9A9A9'],
      text: "Number of incidents in different emergency types"
    };
    dashboardDAO.addCurrentChart(chartInfo);
  }

  static prioritiesForIncident(incident, incidentsForPriority) {
    switch (incident.priority) {
      case 'E':
        incidentsForPriority[0]++;
        break;
      case '1':
        incidentsForPriority[1]++;
        break;
      case '2':
        incidentsForPriority[2]++;
        break;
      case '3':
        incidentsForPriority[3]++;
        break;
      default:
        incidentsForPriority[4]++;
    }
  }

  static typeForIncident(incident) {
    switch (incident.emergencyType) {
      case 1:
        fireIncidentsCount++;
        break;
      case 2:
        medicalIncidentsCount++;
        break;
      case 3:
        policeIncidentsCount++;
        break;
      default:
        undefinedEmergencyTypeCount++;
    }
  }

  static infoFromIncidents(incident) {
    if (incident.emergencyType == 3) {
      noPoliceIncident = 1;
      totalPoliceIncidents++;
      if (incident.answerInfo != undefined) {
        if (incident.answerInfo.weapon == '1') weaponRelatedIncidentCount++;
        else if (incident.answerInfo.weapon == '0') notWeaponRelatedIncidentCount++;
        else undefinedWeaponIncidentCount++;
      } else undefinedWeaponIncidentCount++;
    } else if (incident.emergencyType == 2) {
      noMedicalIncident = 1;
      if (incident.patient != undefined) {
        dashboardDAO.switchMedicalReason(incident.patient);
      } else medicalReasonCount[15]++;
    } else if (incident.emergencyType == 1) {
      noFireIncident = 1;
      totalFireIncidents++;
      if (incident.answerInfo != undefined) {
        if (incident.answerInfo.hazardous == '1') {
          hazardMaterialIncidentCount++;
        } else if (incident.answerInfo.hazardous == '0') otherFireIncidentCount++;
        else undefinedFireCount++;
      } else undefinedFireCount++;
    }
  }

  static switchMedicalReason(patient) {
    switch (patient.condition) {
      case 'ALLERGY':
        medicalReasonCount[0]++;
        break;
      case 'ASTHMA':
        medicalReasonCount[1]++;
        break;
      case 'BLEEDING':
        medicalReasonCount[2]++;
        break;
      case 'BROKEN-BONE':
        medicalReasonCount[3]++;
        break;
      case 'BURN':
        medicalReasonCount[4]++;
        break;
      case 'CHOKING':
        medicalReasonCount[5]++;
        break;
      case 'CONCUSSION':
        medicalReasonCount[6]++;
        break;
      case 'HEAR_ATTACK':
        medicalReasonCount[7]++;
        break;
      case 'HEAT_STROKE':
        medicalReasonCount[8]++;
        break;
      case 'HYPOTHERMIA':
        medicalReasonCount[9]++;
        break;
      case 'POISONING':
        medicalReasonCount[10]++;
        break;
      case 'SEIZURE':
        medicalReasonCount[11]++;
        break;
      case 'SHOCK':
        medicalReasonCount[12]++;
        break;
      case 'STRAIN_SPRAIN':
        medicalReasonCount[13]++;
        break;
      case 'STROKE':
        medicalReasonCount[14]++;
        break;
      default:
        medicalReasonCount[15]++;
    }
  }

  static getAllResponders() {
    return new Promise(function (resolve, reject) {
      User.find({role: {$ne: 'Citizen'}})
        .then(function (users) {
          users.forEach(function (user) {
            dashboardDAO.switchUserRoles(user.role);
          });

          // This chart is displayed for all users
          dashboardDAO.setValuesForNumberOfPersonnelsChart();
          resolve(chartsData);
        })
        .catch(function (err) {
          reject(err);
        });
    });
  }

  static switchUserRoles(userRole) {
    switch (userRole) {
      case 'Dispatcher':
        personnelCount[0]++;
        break;
      case 'FireChief':
        personnelCount[1]++;
        break;
      case 'Firefighter':
        personnelCount[2]++;
        break;
      case 'Paramedic':
        personnelCount[3]++;
        break;
      case 'Nurse':
        personnelCount[4]++;
        break;
      case 'PoliceChief':
        personnelCount[5]++;
        break;
      case 'PatrolOfficer':
        personnelCount[6]++;
        break;
    }
  }

  static getVehicleInfo() {
    return new Promise(function (resolve, reject) {
      Vehicle.find({})
        .then(function (vehicles) {
          vehicles.forEach(function (vehicle) {
            dashboardDAO.switchVehicleType(vehicle);
          });

          // This chart is displayed for all users
          dashboardDAO.setValuesForResourcesInDifferentStatesChart();
          resolve(chartsData);
        })
        .catch(function (err) {
          reject(err);
        })
    });
  }

  static switchVehicleType(vehicle) {
    // labels: ['Cars Currently Assigned To Areas', 'Trucks Currently Assigned To Areas', 'Cars Assigned to Incidents', 'Trucks Assigned to Incidents', 'Cars Unassigned', 'Trucks Unassigned'],
    switch (vehicle.type) {
      case 'car':
        if (vehicle.allocated.kind == undefined) {
          vehicleCount[4]++;
        }
        else if (vehicle.allocated.kind == 'Area') {
          vehicleCount[0]++;
        }
        else vehicleCount[2]++;
        break;
      case 'truck':
        if (vehicle.allocated.kind == undefined) {
          vehicleCount[5]++;
        }
        else if (vehicle.allocated.kind == 'Area') {
          vehicleCount[1]++;
        }
        else vehicleCount[3]++;
        break;
    }
  }

  static setValuesForIncidentsWeaponsRelatedChart() {
    let chartInfo = {
      type: 'pie',
      labels: ["Weapon", "No Weapon", "Undefined"],
      label: 'Number of weapon related incidents',
      data: [weaponRelatedIncidentCount, notWeaponRelatedIncidentCount, undefinedWeaponIncidentCount],
      backgroundColor: ['#000000','#1E90FF','#A9A9A9'],
      text: 'Number of weapon related incidents'
    };
    dashboardDAO.addCurrentChart(chartInfo);

  }

  static setValuesForIncidentTrendChart() {
    dashboardDAO.setLabelsForIncidentsTrendChart();
    chartsData.push({
      type: 'line',
      data: {
        labels: trendIncidentLabels,
        datasets: dashboardDAO.getDatasetsForTrendChart(),
      },
      options: {
        title: {
          display: true,
          text: 'Incident trend over past 7 days'
        },
        legend: {
          position: 'bottom'
        },
        responsive: true,
        animation: {
          animateRotate: true
        },
        scales: {xAxes: [{ticks: {autoSkip: false}}]}
      }
    });
  }

  static getDatasetsForTrendChart() {
    return [{
      label: 'Fire',
      data: trendFireIncidents,
      borderColor: '#FFC300',
      backgroundColor: '#FFC300',
      fill: false
    },
      {
        label: 'Medical',
        data: trendMedicalIncidents,
        borderColor: '#FF5733',
        backgroundColor: '#FF5733',
        fill: false
      },
      {
        label: 'Police',
        data: trendPoliceIncidents,
        borderColor: '#0000FF',
        backgroundColor: '#0000FF',
        fill: false
      },
      {
        label: 'Undefined',
        data: trendUndefinedIncidents,
        borderColor: '#A9A9A9',
        backgroundColor: '#A9A9A9',
        fill: false
      }
    ];
  }

  static setValuesForIncidentCauseOfFireChart() {
    let chartInfo = {
      type: 'pie',
      labels: ["Hazardous Material", "Others", "Undefined"],
      label: 'Cause for Fire related incidents',
      data: [hazardMaterialIncidentCount, otherFireIncidentCount, undefinedFireCount],
      backgroundColor: ['#900C3F','#1E90FF','#A9A9A9'],
      text: 'Cause for Fire related incidents'
    };
    dashboardDAO.addCurrentChart(chartInfo);
  }

  static setValuesForIncidentMedicalConditionChart() {
    let chartInfo = {
      type: 'bar',
      labels: ['allergy', 'asthma', 'bleeding', 'broken-bone', 'burn', 'choking', 'concussion', 'hear-attack', 'heat-stroke', 'hypothermia', 'poisoning', 'seizure', 'shock', 'strain-sprain', 'stroke', 'undefined'],
      label: 'Patients Medical Conditions',
      data: medicalReasonCount,
      backgroundColor: ['#CD5C5C','#F08080','#FA8072','#E9967A','#FFA07A','#DB7093','#FFA07A','#FF7F50','#FF6347','#FF8C00','#FF8C00','#EEE8AA','#F0E68C','#BDB76B','#8FBC8B'],
      text: 'Patients Medical Conditions'
    };
    dashboardDAO.addCurrentChart(chartInfo);
  }

  static setValuesForNumberOfPersonnelsChart() {
    let chartInfo = {
      type: 'bar',
      labels: ['Dispatchers', 'Fire Chiefs', 'Fire Fighters', 'Paramedic', 'Nurse', 'PoliceChief', 'Patrol Officer'],
      label: 'Number of Personnels',
      data: personnelCount,
      backgroundColor: ['#F0E68C','#FFC300','#FF7F50','#FF5733','#F5F5F5','#0000FF','#6A5ACD'],
      text: 'Number of Personnels'
    };
    dashboardDAO.addCurrentChart(chartInfo);
  }

  static setValuesForResourcesInDifferentStatesChart() {
    let chartInfo = {
      type: 'bar',
      labels: ['Cars Currently Assigned To Areas', 'Trucks Currently Assigned To Areas', 'Cars Assigned to Incidents', 'Trucks Assigned to Incidents', 'Cars Unassigned', 'Trucks Unassigned'],
      label: 'States of Resources',
      data: vehicleCount,
      backgroundColor: ['#FA8072','#E9967A','#DC143C','#B22222','#FFFF00','#FFD700'],
      text: 'States of Resources'
    };
    dashboardDAO.addCurrentChart(chartInfo);
  }

  static setLabelsForIncidentsTrendChart() {
    trendIncidentLabels[6] = moment().format("MMM Do YY");
    trendIncidentLabels[5] = moment().subtract(1, "days").format("MMM Do YY");
    trendIncidentLabels[4] = moment().subtract(2, "days").format("MMM Do YY");
    trendIncidentLabels[3] = moment().subtract(3, "days").format("MMM Do YY");
    trendIncidentLabels[2] = moment().subtract(4, "days").format("MMM Do YY");
    trendIncidentLabels[1] = moment().subtract(5, "days").format("MMM Do YY");
    trendIncidentLabels[0] = moment().subtract(6, "days").format("MMM Do YY");
  }
}

module.exports = dashboardDAO;
