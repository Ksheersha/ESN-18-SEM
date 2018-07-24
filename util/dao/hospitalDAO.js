var mongoose = require('mongoose');
const dbUtil = require('../dbUtil');
const Hospital = dbUtil.getModel('Hospital');
const Patient = dbUtil.getModel('Patient');
const UserDAO = require('../dao/userDAO').UserDAO;
const PatientDAO = require('../dao/patientDAO');
const patientUtil = require('../../util/patientUtil');

function getLocation(location) {
  return {
    type: 'Point',
    coordinates: [parseFloat(location.longitude), parseFloat(location.latitude)]
  }
}

class HospitalDAO {
  static newHospital(hospitalData) {
    let hospital = new Hospital({
      hospitalName: hospitalData.hospitalName,
      address: hospitalData.address,
      description: hospitalData.description,
      nurse: hospitalData.nurseIdCheck ? [hospitalData.nurse] : [],
    });
    if (hospitalData.location) {
      hospital.location = getLocation(hospitalData.location);
    }

    return Hospital.ensureIndexes()
    .then(() => {
      return hospital.save();
    });
  }

  static updateHospitalInfo(hospital, hospitalData) {
    hospital.hospitalName = hospitalData.hospitalName;
    hospital.address = hospitalData.address;
    hospital.description = hospitalData.description;
    if (hospitalData.location) {
      hospital.location = getLocation(hospitalData.location);
    }

    let nurseId = hospitalData.nurse;
    let nurseIndex = hospital.nurse.indexOf(nurseId);
    if (hospitalData.nurseIdCheck && nurseIndex === -1) {
      hospital.nurse.push(nurseId);
    } else if (!hospitalData.nurseIdCheck && nurseIndex > -1) {
      hospital.nurse.splice(nurseIndex, 1);
    }

    if (hospitalData.beds) {
      hospital.beds = hospitalData.beds;
    }
    return hospital.save();
  }

  static removeNurseFromAllPreviousHospitals (nurseId) {
    return Hospital.update({}, {$pullAll: {nurse: [nurseId]}}, {multi: true});
  }

  static saveUpdateHospitalInfo(hospitalInfo) {
    let removeNurseIfNeeded = Promise.resolve();
    if (hospitalInfo.nurseIdCheck) {
      removeNurseIfNeeded = HospitalDAO.removeNurseFromAllPreviousHospitals(hospitalInfo.nurse);
    }

    return removeNurseIfNeeded
    .then(() => {
      return HospitalDAO.getHospital(hospitalInfo.hospitalId);
    })
    .then(hospital => {
      if (hospital) {
        return HospitalDAO.updateHospitalInfo(hospital, hospitalInfo);
      } else {
        return HospitalDAO.newHospital(hospitalInfo);
      }
    })
    .catch(() => {
      return HospitalDAO.newHospital(hospitalInfo);
    });
  }

  static removeHospital(id) {
    return Hospital.findByIdAndRemove(id).exec();
  }

  static getAllHospitals() {
    return Hospital.find({}).collation({locale: 'en'}).sort('hospitalName');
  }

  static getHospital(id) {
    return Hospital.findById(id).exec();
  }

  static getHospitalByNurseId (id) {
    return Hospital.find({nurse: id}).exec();
  }

  static getHospitalByDistance(responderId) {
    return UserDAO.findUserById(responderId)
    .then(responder => {
      // Get the location of that responder
      if (responder) {
        return Promise.all([Hospital.aggregate([
          {
            $geoNear: {
              near: responder.location,
              distanceField: 'distance',
              spherical: true
            }
          },
          {
            $lookup: {
              from: 'patients',
              localField: 'patients',
              foreignField: '_id',
              as: 'patients'
            }
          },
          {$sort: {distance: 1, beds: -1, hospitalName: 1}}
        ]), PatientDAO.getPatientsByParamedicId(responderId)]);
      } else {
        return [[], []];
      }
    })
    .then(([hospitals, patients]) => {
      // Filter patients not in incidents related to the responder out
      let patientIdList = patientUtil.categorizePatients('paramedic', patients)['To Take To ER'].map(a => a._id.toString());
      for (let i = 0; i < hospitals.length; i++) {
        hospitals[i].patients = hospitals[i].patients.filter(patient => {
          return patientIdList.indexOf(patient._id.toString()) > -1;
        });
        // Sort patients list in the hospital model
        hospitals[i].patients = hospitals[i].patients.sort(patientUtil.compareByPriority);
      }
      return hospitals;
    });
  }

  static updateHospital (condition, update) {
    return Hospital.update(condition, update).exec();
  }

  static updatePatients (hospitals) {
    let cmd = [];

    // Update patients field in Hospital
    for (let id in hospitals) {
      let hospital = hospitals[id];
      let assignList = hospital.assignList;
      let unassignList = hospital.unassignList;
      if (assignList.length !== 0) {
        cmd.push(Hospital.update({_id: id}, {$addToSet: {patients: {$each: assignList}}}));
      }
      if (unassignList.length !== 0) {
        cmd.push(Hospital.update({_id: id}, {$pull: {patients: {$in: unassignList}}}));
      }
    }

    // Update bed field in Hospital
    // If beds count has been defined in the hospital and the patients are assign/unassign to the hospital, the count would change correspondingly
    // If beds count has not been defined in the hospital, bed field would stay undefined
    for (let id in hospitals) {
      let hospital = hospitals[id];
      if (hospital.beds !== undefined) {
        cmd.push(Hospital.update({_id: id}, {beds: hospital.beds}));  
      }
    }

    // Update hospital field in Patient
    for (let hospitalId in hospitals) {
      for (let patientId of hospitals[hospitalId].unassignList) {
        cmd.push(Patient.update({_id: patientId}, {hospital: undefined}));
      }
    }
    for (let hospitalId in hospitals) {
      for (let patientId of hospitals[hospitalId].assignList) {
        cmd.push(Patient.update({_id: patientId}, {hospital: hospitalId}));
      }
    }

    return Promise.all(cmd);
  }

  static gertNursesFromAllHospital(condition) {
    return new Promise(function(resolve,reject){
      Hospital.find(condition)
        .populate({
          path: 'nurse',
          model: 'User',
          populate: {
            path: 'personalInfo',
            model: 'UserPersonal'
          }
        })
        .then(function (nurseData) {
          resolve(nurseData);
        })
        .catch(function (err) {
          reject(err);
        })
    });
  }
}

module.exports = HospitalDAO;
