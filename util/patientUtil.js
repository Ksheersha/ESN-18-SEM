const dbUtil = require('../util/dbUtil');
const Patient = dbUtil.getModel('Patient');

function compareByPriority (patient1, patient2) {
  let priorityValue = {
    'E': 0,
    '1': 1,
    '2': 2,
    '3': 3,
    '4': 4
  };
  let comparedResult = null;
  if (priorityValue[patient1.priority] === priorityValue[patient2.priority]) {
    comparedResult = patient1.displayId < patient2.displayId;
  } else {
    comparedResult = priorityValue[patient1.priority] < priorityValue[patient2.priority];
  }
  return comparedResult ? -1 : 1;
}

function categorizePatientsForParamedic (patients) {
  let result = {
    'To Take To ER': [],
    'At ER': [],
    'Others': []
  };
  for (let i = 0; i < patients.length; i++) {
    if (patients[i].priority !== '1' && patients[i].priority !== 'E') {
      result['Others'].push(patients[i]);
    } else if (patients[i].location === 'road') {
      result['To Take To ER'].push(patients[i]);
    } else {
      result['At ER'].push(patients[i]);
    }
  }
  return result;
}

function categorizePatientsForNurse (patients) {
  let result = {
    'Beds Requested': [],
    'Beds Ready': [],
    'Beds Occupied': []
  };

  for (let i = 0; i < patients.length; i++) {
    if (patients[i].bedStatus === Patient.BedStatus.OCCUPIED) {
      result['Beds Occupied'].push(patients[i]);
    } else if (patients[i].bedStatus === Patient.BedStatus.REQUESTED) {
      result['Beds Requested'].push(patients[i]);
    } else {
      result['Beds Ready'].push(patients[i]);
    }
  }
  return result;
}

exports.compareByPriority = compareByPriority;

exports.categorizePatients = function (role, patients) {
  let result = {};
  switch (role)  {
    case "paramedic":
      result = categorizePatientsForParamedic(patients);
      break;
    case "nurse":
      result = categorizePatientsForNurse(patients);
      break;
    default:
      result = categorizePatientsForParamedic(patients);
  }
  return result;
};

exports.sortPatientsDirByPriority = function (patients) {
  for (type in patients) {
    patients[type].sort(compareByPriority);
  }
};