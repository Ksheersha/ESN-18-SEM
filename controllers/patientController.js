const PatientDAO = require('../util/dao/patientDAO');
const util = require('../util/patientUtil');

class PatientController {
  getIncidentPatient (req, res) {
    let incidentId = req.params.incidentId;

    PatientDAO.getByIncidentId(incidentId)
      .then(patient => res.status(200).json(patient))
      .catch(err => res.status(404).send(err));
  }

  updateIncidentPatient (req, res) {
    let incidentId = req.params.incidentId;
    let attrs = req.body;

    PatientDAO.updateByIncidentId(incidentId, attrs)
      .then(patient => {
        res.status(200).json(patient);
        global.io.emit('reload patients directory');
      })
      .catch(err => res.sendStatus(err.name === 'ValidationError' ? 422 : 404));
  }

  getPatientsForRole (req, res) {
    let role = req.params.role;
    let userId = req.params.userId;
    let getter;

    switch (role) {
      case "paramedic":
        getter = PatientDAO.getPatientsByParamedicId;
        break;
      case "nurse":
        getter = PatientDAO.getPatientsByNurseId;
        break;
      default:
        return res.status(404).send("Role not found");
    }
    getter(userId)
    .then(patients => {
      let patientsDirectory = util.categorizePatients(role, patients);
      util.sortPatientsDirByPriority(patientsDirectory);
      res.status(200).json(patientsDirectory);
    })
    .catch(err => {
      res.status(500).send(err)
    });
  }

  getPatientsForParamedicFindHospital (req, res) {
    let paramedicId = req.params.paramedicId;
    PatientDAO.getPatientsByParamedicIdForFindHospital(paramedicId)
      .then(patients => {
        patients.sort(util.compareByPriority);
        res.status(200).json(patients);
      })
      .catch(err => res.status(500).send(err));
  }

  updateBedStatus (req, res) {
    let patientId = req.params.patientId;
    let bedStatus = req.body.bedStatus;
    PatientDAO.updateBedStatus(patientId, bedStatus)
    .then(patient => {
      res.status(200).send(patient);
    })
    .catch(err => res.status(500).send(err));
  }
}

module.exports = PatientController;
