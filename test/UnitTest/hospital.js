let expect = require('expect.js');
let _expect = require('chai').expect;

process.env.NODE_ENV = "test";
let db = require('../../util/mockDB');

let DAO = require('../../util/dao/hospitalDAO');
let UserDAO = require('../../util/dao/userDAO').UserDAO;
let PatientDAO = require('../../util/dao/patientDAO');

let dbUtil = require('../../util/dbUtil');
let User = dbUtil.getModel('User');
let ObjectID = require('mongodb').ObjectID;
let Patient = dbUtil.getModel('Patient');

let location1 = {
  latitude: '1',
  longitude: '2'
};

let location2 = {
  latitude: '2',
  longitude: '2'
};

const nurse = {
  username: 'Nurse',
  password: 'nurse',
  status: 'OK',
  role: User.roleType.NURSE
};

const paramedic = {
  username: 'Paramedic',
  password: 'paramedic',
  status: 'OK',
  role: User.roleType.PARAMEDIC,
  location: {
    type: 'Point',
    coordinates: [2, 1]
  }
};

let hospitalWithoutNurse = {
  hospitalName: 'Test',
  address: '20 Fake St',
  description: 'Test Hospital',
  nurse: '',
  nurseIdCheck: false,
  location: location1
};

let hospitalWithNurse = {
  hospitalName: 'Test2',
  address: '20 Fake St',
  description: 'Test Hospital #2',
  nurse: '',
  nurseIdCheck: true,
  location: location2
};

let hospitalId = null;
let hospitalId2 = null;
let nurseId = null;
let paramedicId = null;
let fakeId = '5add6eeee8f499908d491ecb';

let noName = {
  address: '20 Fake St',
  description: 'Test Hospital',
  nurse: '',
  location: location1,
  beds: 4
};

let noAddress = {
  hospitalName: 'Test',
  description: 'Test Hospital',
  nurse: '',
  location: location1,
  beds: 4
};

let invalidId = {
  hospitalId: '',
  hospitalName: 'Test',
  address: '20 Fake St',
  description: 'Test Hospital',
  nurse: '',
  nurseIdCheck: '',
  location: location1,
  beds: 4
};

let patientId = null;
let patientId2 = null;
let patientId3 = null;

let patient1 = new Patient({
  displayId: 'I_ACitizen_1_P_1',
  priority: Patient.Priority.IMMEDIATE,
  location: Patient.Location.ROAD
});

let patient2 = new Patient({
  displayId: 'I_ACitizen_1_P_2',
  priority: Patient.Priority.IMMEDIATE,
  location: Patient.Location.ROAD
});

let patient3 = new Patient({
  displayId: 'I_ACitizen_1_P_3',
  priority: Patient.Priority.IMMEDIATE,
  location: Patient.Location.ROAD
});

function checkHospital(actualHospital, returnedHospital) {
  expect(returnedHospital._id).to.be.ok();
  expect(returnedHospital.hospitalName).to.be(actualHospital.hospitalName);
  expect(returnedHospital.address).to.be(actualHospital.address);
  expect(returnedHospital.description).to.be(actualHospital.description);
  expect(parseFloat(returnedHospital.location.coordinates[1])).to.be.eql(actualHospital.location.latitude);
  expect(parseFloat(returnedHospital.location.coordinates[0])).to.be.eql(actualHospital.location.longitude);
}

suite('Hospital Unit Test', () => {
  setup(done => {
    db.setup(function () {
      UserDAO.addUser(nurse)
      .then((user) => {
        nurseId = user._id;
        hospitalWithNurse.nurse = nurseId;
        hospitalWithoutNurse.nurse = nurseId;
        return UserDAO.addUser(paramedic);
      })
      .then((user) => {
        paramedicId = user._id;
        done();
      })
      .catch((err) => done(err));
    });
  });

  teardown(done => {
    db.teardown(done);
  });

  suite('#create', () => {
    test('Should create a hospital without a nurse', done => {
      DAO.newHospital(hospitalWithoutNurse)
      .then(hospital => {
        checkHospital(hospitalWithoutNurse, hospital);
        expect(hospital.nurse.length).to.be(0);
        done();
      })
      .catch(err => {done(err); });
    });

    test('Should create a hospital with a nurse', done => {
      DAO.newHospital(hospitalWithNurse)
      .then(hospital => {
        checkHospital(hospitalWithNurse, hospital);
        expect(hospital.nurse.length).to.be(1);
        expect(hospital.nurse[0]).to.be.eql(nurseId);
        done();
      })
      .catch(err => {done(err); });
    });

    test('Should throw an error if some fields are missing', done => {
      const partialHospitals = [
        noName,
        noAddress,
      ];
      let promises = [];

      for (let partialHospital of partialHospitals) {
        let promise = DAO.newHospital(partialHospital).then(
          hospital => expect().fail(`Got ${hospital}`),
          err => {});
        promises.push(promise);
      }

      Promise.all(promises)
      .then(() => done())
      .catch(err => done(err));
    });

    test('Should throw an error if all fields are empty', done => {
      let emptyHospital = {
        hospitalName: '',
        address: '',
        description: '',
        nurse: [],
        location: '',
        beds: ''
      };

      DAO.newHospital(emptyHospital).then(
        hospital => expect().fail(`Got ${hospital}`),
        err => {})
      .then(()=> done())
      .catch(err => {done(err);});
    });

  });

  suite('#update', () => {
    test('Should update a hospital name and add a beds field', done => {
      let updatedHospitalName = 'TestUpdate';
      let updatedHospitalInfo = {
        hospitalName: updatedHospitalName,
        address: '20 Fake St',
        description: 'Test Hospital',
        nurse: nurseId,
        nurseIdCheck: false,
        location: location1,
        beds: 4
      };
      DAO.newHospital(hospitalWithoutNurse)
      .then((hospital) => {
        updatedHospitalInfo.hospitalId = hospital._id;
        return DAO.updateHospitalInfo(hospital, updatedHospitalInfo);
      })
      .then((updatedHospital) => {
        expect(updatedHospital.hospitalName).to.be(updatedHospitalName);
        expect(updatedHospital.beds).to.be(4);
        done();
      })
      .catch(err => done(err));
    });

    test('Should not add a beds field if not given', done => {
      let updatedHospitalName = 'TestUpdate';
      let updatedHospitalInfo = {
        hospitalName: updatedHospitalName,
        address: '20 Fake St',
        description: 'Test Hospital',
        nurse: nurseId,
        nurseIdCheck: false,
        location: location1
      };
      DAO.newHospital(hospitalWithoutNurse)
      .then((hospital) => {
        updatedHospitalInfo.hospitalId = hospital._id;
        return DAO.updateHospitalInfo(hospital, updatedHospitalInfo);
      })
      .then((updatedHospital) => {
        expect(updatedHospital.hospitalName).to.be(updatedHospitalName);
        expect(updatedHospital.beds).to.be(undefined);
        done();
      })
      .catch(err => done(err));
    });

    test('Should add a nurse into the hospital', done => {
      let updatedHospitalInfo = {
        hospitalName: 'Test',
        address: '20 Fake St',
        description: 'Test Hospital',
        nurse: nurseId,
        nurseIdCheck: true,
        location: location1
      };
      DAO.newHospital(hospitalWithoutNurse)
      .then((hospital) => {
        updatedHospitalInfo.hospitalId = hospital._id;
        return DAO.updateHospitalInfo(hospital, updatedHospitalInfo);
      })
      .then((updatedHospital) => {
        expect(updatedHospital.nurse.length).to.be(1);
        expect(updatedHospital.nurse[0]).to.be.eql(nurseId);
        done();
      })
      .catch(err => done(err));
    });

    test('Should remove a nurse from the hospital', done => {
      let updatedHospitalInfo = {
        hospitalName: 'Test2',
        address: '20 Fake St',
        description: 'Test Hospital #2',
        nurse: nurseId,
        nurseIdCheck: false,
        location: location2
      };
      DAO.newHospital(hospitalWithNurse)
      .then((hospital) => {
        updatedHospitalInfo.hospitalId = hospital._id;
        return DAO.updateHospitalInfo(hospital, updatedHospitalInfo);
      })
      .then((updatedHospital) => {
        expect(updatedHospital.nurse.length).to.be(0);
        done();
      })
      .catch(err => done(err));
    })
  });

  suite('#saveUpdate', () => {
    test('Should create a hospital if no id is given', done => {
      DAO.saveUpdateHospitalInfo(hospitalWithoutNurse)
      .then(hospital => {
        checkHospital(hospitalWithoutNurse, hospital);
        done();
      })
      .catch(err => {
        done(err);
      })
    });

    test('Should create a hospital if an invalid id is given', done => {
      DAO.saveUpdateHospitalInfo(invalidId)
      .then(hospital => {
        checkHospital(hospitalWithoutNurse, hospital);
        done();
      })
      .catch(err => {
        done(err);
      })
    });

    test('Should update a hospital if a valid id is given', done => {
      let updatedHospitalName = 'TestUpdate';
      let updatedHospitalInfo = {
        hospitalName: updatedHospitalName,
        address: '20 Fake St',
        description: 'Test Hospital',
        nurse: nurseId,
        nurseIdCheck: false,
        location: location1
      };

      DAO.newHospital(hospitalWithoutNurse)
      .then(hospital => {
        updatedHospitalInfo.hospitalId = hospital._id;
        return DAO.saveUpdateHospitalInfo(updatedHospitalInfo);
      })
      .then(hospital => {
        checkHospital(updatedHospitalInfo, hospital);
        expect(hospital._id).to.be.eql(updatedHospitalInfo.hospitalId);
        done();
      })
      .catch(err => {
        done(err);
      });
    });
  });

  suite('#getOne', () => {
    test('should return a hospital with given id when there is a hospital in system', done => {
      DAO.newHospital(hospitalWithoutNurse)
      .then((hospital) => {
        let id = hospital._id;
        return DAO.getHospital(id);
      })
      .then((hospital) => {
        checkHospital(hospitalWithoutNurse, hospital);
        done();
      })
      .catch(err => done(err));
    });

    test('should return a hospital with given id when there are two hospitals in system', done => {
      DAO.newHospital(hospitalWithoutNurse)
      .then(() => DAO.newHospital(hospitalWithNurse))
      .then((hospital) => {
        var hospitalId = hospital._id;
        return DAO.getHospital(hospitalId);
      })
      .then((hospital) => {
        checkHospital(hospitalWithNurse, hospital);
        done();
      })
      .catch(err => done(err));
    });

    test('should return a hospital by nurse id in which this nurse work', done => {
      DAO.newHospital(hospitalWithNurse)
      .then(() => DAO.getHospitalByNurseId(nurseId))
      .then((hospital) => {
        checkHospital(hospitalWithNurse, hospital[0]);
        done();
      })
      .catch(err => done(err));
    });

    test('should return all nurses from one hospital by giving id', done => {
      DAO.newHospital(hospitalWithoutNurse)
        .then(() => DAO.newHospital(hospitalWithNurse))
        .then(data => DAO.gertNursesFromAllHospital({_id:data._id}))
        .then(hospitals => {
          expect(hospitals).to.have.length(1);
          checkHospital(hospitalWithNurse, hospitals[0]);
          expect(hospitals[0].nurse[0]._id.toString()).to.be.equal(hospitalWithNurse.nurse.toString());
          done();
        })
        .catch(err => done(err));
    });
  });

  suite('#getAll', () => {
    test('should return empty if no hospitals in the system', done => {
      DAO.getAllHospitals()
      .then(hospitals => {
        expect(hospitals).to.be.empty();
        done();
      })
      .catch(err => { done(err); });
    });

    test('should return a list of hospitals', done => {
      DAO.newHospital(hospitalWithoutNurse)
      .then(() => DAO.newHospital(hospitalWithNurse))
      .then(() => DAO.getAllHospitals())
      .then(hospitals => {
        expect(hospitals).to.have.length(2);
        checkHospital(hospitalWithoutNurse, hospitals[0]);
        checkHospital(hospitalWithNurse, hospitals[1]);
        done();
      })
      .catch(err => done(err));
    });

    test('should return all nurses from all hospital', done => {
      DAO.newHospital(hospitalWithoutNurse)
        .then(() => DAO.newHospital(hospitalWithNurse))
        .then(() => DAO.gertNursesFromAllHospital({}))
        .then(hospitals => {
          expect(hospitals).to.have.length(2);
          checkHospital(hospitalWithoutNurse, hospitals[0]);
          checkHospital(hospitalWithNurse, hospitals[1]);
          let nurseList = new Array();
          nurseList.push(hospitals[0].nurse._id);
          nurseList.push(hospitals[1].nurse._id);
          _expect(nurseList).to.deep.include(hospitalWithoutNurse._id);
          _expect(nurseList).to.deep.include(hospitalWithNurse._id);
          done();
        })
        .catch(err => done(err));
    });
  });

  suite('#delete', () => {
    test('should delete a hospital', done => {
      DAO.newHospital(hospitalWithoutNurse)
      .then((hospital) => {
        let id = hospital._id;
        DAO.removeHospital(id);
      })
      .then(() => {
        return DAO.getAllHospitals();
      })
      .then(hospitals => {
        expect(hospitals).to.be.empty();
        done();
      })
      .catch(err => done(err));
    });
  });

  suite('#getHospitalByDistance', () => {
    test('should get hospitals by distance', done => {
      DAO.newHospital(hospitalWithNurse)
      .then(() => {
        return DAO.newHospital(hospitalWithoutNurse);
      })
      .then(() => {
        return DAO.getHospitalByDistance(paramedicId)
      })
      .then(hospitals => {
        expect(hospitals.length).to.be(2);
        checkHospital(hospitalWithoutNurse, hospitals[0]);
        checkHospital(hospitalWithNurse, hospitals[1]);
        done();
      })
      .catch(err => done(err));
    });

    test('should not get hospitals by distance by invalid responder id', done => {
      DAO.getHospitalByDistance(fakeId)
      .then(hospitals => {
        expect(hospitals.length).to.be(0);
        done();
      })
      .catch(err => done(err));
    });
  });

  suite('#updatePatientsInHospital', () => {
    suiteSetup(function (done) {
      db.setup(function () {
        DAO.newHospital(hospitalWithoutNurse)
        .then((hospital) => {
          hospitalId = hospital._id;
        })
        .then(() => {
          return DAO.newHospital(hospitalWithNurse);
        })
        .then((hospital) => {
          hospitalId2 = hospital._id;
          return patient1.save();
        })
        .then((createdPatient1) => {
          patientId = createdPatient1._id;
          return patient2.save();
        })
        .then((createdPatient2) => {
          patientId2 = createdPatient2._id;
          return patient3.save();
        })
        .then((createdPatient3) => {
          patientId3 = createdPatient3._id;
        })
        .then(() => done())
        .catch(err => done(err));
      });
    });

    test('should assign and unassign patients to hospitals', done => {
      let hospitals = {};
      hospitals[hospitalId] = {
        assignList: [patientId, patientId2],
        unassignList: [],
      };
      hospitals[hospitalId2] = {
        assignList: [patientId3],
        unassignList: [],
      };

      DAO.updateHospital({_id: hospitalId}, {beds: 3})
      .then(() => {
        return DAO.updateHospital({_id: hospitalId2}, {beds: 6});
      })
      .then(() => {
        return DAO.updatePatients(hospitals);
      })
      .then(() => {
        return DAO.getAllHospitals();
      })
      .then((hospitals) => {
        expect(hospitals.length).to.be(2);
        expect(hospitals[0].patients.length).to.be(2);
        expect(hospitals[0].patients[0]).to.be.eql(patientId);
        expect(hospitals[0].patients[1]).to.be.eql(patientId2);
        expect(hospitals[1].patients.length).to.be(1);
        expect(hospitals[1].patients[0]).to.be.eql(patientId3);
        return Patient.findOne(patientId);
      })
      .then((patient1) => {
        expect(patient1.hospital).to.be.eql(hospitalId);
        return Patient.findOne(patientId2);
      })
      .then((patient2) => {
        expect(patient2.hospital).to.be.eql(hospitalId);
        return Patient.findOne(patientId3);
      })
      .then((patient3) => {
        expect(patient3.hospital).to.be.eql(hospitalId2);
        hospitals[hospitalId] = {
          assignList: [],
          unassignList: [patientId, patientId2],
          beds: 2,
        };
        hospitals[hospitalId2] = {
          assignList: [],
          unassignList: [patientId3],
          beds: 6,
        };
        return DAO.updatePatients(hospitals);
      })
      .then(() => {
        return Patient.findOne(patientId);
      })
      .then((patient1) => {
        expect(patient1.hospital).to.be(null);
        return Patient.findOne(patientId2);
      })
      .then((patient2) => {
        expect(patient2.hospital).to.be(null);
        return Patient.findOne(patientId3);
      })
      .then((patient3) => {
        expect(patient3.hospital).to.be.eql(null);
        done();
      })
      .catch(err => {done(err); });
    });

  });

  suite('#updatePartialHospitalInfo', () => {
    test('should update ER bed number in a hospital', done => {
      let hospitalId;
      DAO.newHospital(hospitalWithNurse)
      .then((hospital) => {
        hospitalId = hospital._id;
        return DAO.updateHospital({_id: hospitalId}, {beds: 4});
      })
      .then(() => {
        return DAO.getHospital(hospitalId);
      })
      .then((hospital) => {
        expect(hospital.beds).to.be(4);
        done();
      })
      .catch(err => {done(err); });
    });
  });

  suiteTeardown(db.teardown);

  suite('#Patients for nurse', () => {
    let hospitalId1 = null;
    let nurseId2 = null;
    let patientId1 = null;
    let patientId2 = null;
    let badId = "qwertyuiop";
    setup(done => {
      db.setup(function () {
        UserDAO.addUser(nurse)
        .then((newNurse) => {
          nurseId2 = newNurse._id;
          hospitalWithNurse.nurse = nurseId2;
          return DAO.newHospital(hospitalWithNurse);
        })
        .then((hospital) => {
          hospitalId1 = hospital._id;
          let patient = new Patient();
          patient.hospital = hospitalId1;
          return patient.save();
        })
        .then((patient) => {
          patientId1 = patient._id;
          let patient2 = new Patient();
          patient2.hospital = hospitalId1;
          patient2.priority = Patient.Priority.COULD_WAIT;
          return patient2.save();
        })
        .then(() => done())
        .catch((err) => done(err));
      });
    });

    test('get patients for nurse', done => {
      PatientDAO.getPatientsByNurseId(nurseId2)
      .then(patients => {
        expect(patients.length).to.be(1);
        expect(patients[0]._id.toString()).to.eql(patientId1.toString());
        done();
      })
      .catch(err => done(err));
    });

    test('get patients for nurse should fail with bad nurseId', done => {
      PatientDAO.getPatientsByNurseId(badId)
      .catch(err => {
        expect(err).not.to.be(null);
        done();
      })
    });
  });
});
