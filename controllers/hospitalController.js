'use strict';

let HospitalDAO = require('../util/dao/hospitalDAO');
let PatientDAO = require('../util/dao/patientDAO');
let dbUtil = require('../util/dbUtil');

class HospitalController{
  getHospital (req, res) {
    HospitalDAO.getHospital(req.params.id)
    .then((data) => {
      res.status(200).send(data);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
  }

  getAllHospitals(req, res) {
    HospitalDAO.getAllHospitals()
    .then((hospitals) => { res.send(hospitals);})
    .catch((err) => { res.status(500).send(err);});
  };

  saveUpdateHospitalInfo (req, res) {
    HospitalDAO.saveUpdateHospitalInfo(req.body)
    .then(function (data) {
      global.io.emit("hospital updated", data._id.toString());
      res.status(200).send(data);
    })
    .catch(function (err) {
      res.status(500).send(err);
    });
  }

  deleteHospital (req, res) {
    HospitalDAO.removeHospital(req.params.id)
    .then(function () {
      global.io.emit("hospital deleted", req.params.id);
      res.status(202).send();
    })
    .catch(function (err) {
      res.status(500).send(err);
    });
  }

  getHospitalByNurseId (req, res) {
    HospitalDAO.getHospitalByNurseId(req.params.id)
    .then((data) => {
      res.status(200).send(data);
    })
    .catch(function (err) {
      res.status(500).send(err);
    });
  }

  getHospitalsByResponderId (req, res) {
    HospitalDAO.getHospitalByDistance(req.params.responderId)
    .then(data => {
      res.status(200).send(data);
    })
    .catch(function (err) {
      res.status(500).send(err);
    });
  }

  updatePatients (req, res) {
    // When there is no enough beds in the hospital, do not allow the update operation
    let hospitals = req.body;
    for (let id in hospitals) {
      if (hospitals[id].beds && hospitals[id].beds < 0) {
        return res.status(403).send();
      }
    }

    // Alert related nurses
    for (let hospitalId in hospitals) {
      if (hospitals[hospitalId].assignList.length !== 0) {
        HospitalDAO.getHospital(hospitalId)
        .then((hospital) => {
          global.io.emit("alert related nurses for assignment", hospital.nurse);
        })
        .catch((err) => {
          console.log(err);
        });
      }
    }

    HospitalDAO.updatePatients(req.body)
    .then(() => {
      global.io.emit("patients assign/unassign to hospitals");
      global.io.emit("beds number in hospitals updated by assigning patients");
      res.status(200).send();
    })
    .catch((err) => {
      res.status(500).send(err);
    });
  }

  updateHospitalBeds (req, res) {
    HospitalDAO.updateHospital({_id: req.body._id}, {beds: req.body.beds})
    .then(data => {
      global.io.emit("beds number in hospitals updated by nurse");
      res.status(200).send(data);
    })
    .catch(function (err) {
      res.status(500).send(err);
    });
  }

  getNursesFromAllHospital(req, res) {
    HospitalDAO.gertNursesFromAllHospital({})
      .then(data =>{
        res.status(200).send(data);
      })
      .catch(function (err) {
        res.status(500).send(err);
      })
  }

  getNursesDirectoryByHospitalId(req,res){
    HospitalDAO.gertNursesFromAllHospital({_id:req.params.id})
      .then(data => {
        res.status(200).send(data);
      })
      .catch(function (err) {
        res.status(500).send(err);
      });
  }
}

module.exports = HospitalController;
