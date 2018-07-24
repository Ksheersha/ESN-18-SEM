const dbUtil = require('../dbUtil');
const Patient = dbUtil.getModel('Patient');
const Incident = dbUtil.getModel('Incident');
const IncidentDAO = require('../dao/incidentResponderDAO');
const Hospital = dbUtil.getModel('Hospital');

const SEX_MAPPINGS = {
  '1': Patient.Sex.MALE,
  '2': Patient.Sex.FEMALE,
  '3': Patient.Sex.OTHER
};

const BOOL_MAPPINGS = {
  '1': true,
  '2': false
};

class PatientDAO {
  static getByIncidentId (incidentId) {
    return Incident.findById(incidentId).populate('answerInfo patient').exec()
      .then(incident => {
        if (!incident) throw new Error(`Invalid incident ID: ${incidentId}`);

        if (incident.patient) {
          // Return the existed patient if alread created.
          return incident.patient;
        } else {
          // Else create a new patient.
          let attrs = {
            incident: incident._id,
            displayId: incident.displayId + '_P'
          };

          // Pull patient info from the incident if possible.
          if (incident.answerInfo) {
            if (incident.answerInfo.citizenAge) attrs.age = Number.parseInt(incident.answerInfo.citizenAge);
            if (incident.answerInfo.sex) attrs.sex = SEX_MAPPINGS[incident.answerInfo.sex];
            if (incident.answerInfo.conscient) attrs.conscious = BOOL_MAPPINGS[incident.answerInfo.conscient];
            if (incident.answerInfo.breathing) attrs.breathing = BOOL_MAPPINGS[incident.answerInfo.breathing];
            attrs.chiefComplaint = incident.answerInfo.citizenChiefComplaint;
          }

          let savedPatient = null;

          return new Patient(attrs).save()
            .then(patient => {
              // Write back the patientId to the incident.
              savedPatient = patient;
              incident.patient = patient._id;
              return incident.save();
            })
            .then(incident => savedPatient);
        }
      });
  }

  static updateByIncidentId (incidentId, attrs) {
    return PatientDAO.getByIncidentId(incidentId)
      .then(patient => {
        for (let key in attrs) {
          patient[key] = attrs[key];
        }
        return patient.save();
      });
  }

  static getPatientIdListByParamedicId (responderId) {
    return IncidentDAO.getOpenIncidentForFirstResponder(responderId)
    .then(incidents => {
      let patientIdList = [];
      for (let i = 0; i < incidents.length; i++) {
        patientIdList.push(incidents[i].patient);
      }
      return patientIdList;
    })
  }

  static getPatientsByParamedicId (responderId) {
    return PatientDAO.getPatientIdListByParamedicId(responderId)
    .then(patientIdList => {
      return Patient.find({_id: {$in: patientIdList}});
    });
  }

  static getPatientsByNurseId (nurseId) {
    return new Promise ((resolve, reject) => {
      Hospital.findOne({nurse: nurseId}, '_id')
      .then((hospital) => {
        Patient.find({
          priority: {$in: ['E', '1']},
          hospital: hospital._id
        })
        .then((patients) => {
          resolve(patients);
        });
      })
      .catch(err => {
        reject(err);
      });
    });
  }

  static getPatientsByParamedicIdForFindHospital (responderId) {
    return PatientDAO.getPatientIdListByParamedicId(responderId)
    .then(patientIdList => {
      return Patient.find({
        _id: {$in: patientIdList},
        location: 'road',
        priority: {$in: ['E', '1']},
        hospital: null
      });
    });
  }

  static updateBedStatus (patientId, bedStatus) {
    return new Promise ((resolve, reject) => {
      let status;
      switch (bedStatus) {
        case 'Beds Requested':
          status = Patient.BedStatus.REQUESTED;
          break;
        case 'Beds Ready':
          status = Patient.BedStatus.READY;
          break;
        case 'Beds Occupied':
          status = Patient.BedStatus.OCCUPIED;
          break;
        default:
          status = Patient.BedStatus.OCCUPIED;
      }
      Patient.findOne({_id: patientId})
      .then(patient => {
        patient.bedStatus = status;
        return patient.save();
      })
      .then(patient => {
        resolve(patient)
      });
    });
  }

}

module.exports = PatientDAO;
