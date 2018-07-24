let expect = require('expect.js');
let agent = require('superagent');

let PORT = 3000;
let HOST = 'http://localhost:' + PORT;

process.env.NODE_ENV = 'test';
// Initiate Server
let db = require('../../util/mockDB');
let dbUtil = require('../../util/dbUtil');
let Patient = dbUtil.getModel('Patient');

const User = dbUtil.getModel('User');
const UserDAO = require('../../util/dao/userDAO').UserDAO;
const IncidentDAO = require('../../util/dao/incidentDAO');
const IncidentResponderDAO = require('../../util/dao/incidentResponderDAO');
const PatientDAO = require('../../util/dao/patientDAO');
const HospitalDAO = require('../../util/dao/hospitalDAO');

const DISPATCHER = {
  username: 'ADispatcher',
  password: 'dispatcher',
  status: 'OK',
  role: User.roleType.DISPATCHER
};

const HOSPITAL = {
  hospitalName: 'testHospital',
  address: 'hospital address',
  description: 'test description',
  nurseIdCheck: true,
  nurse: null
};

const PARAMEDIC = {
  username: 'AParamedic',
  password: 'paramedic',
  status: 'OK',
  role: User.roleType.PARAMEDIC
};

const NURSE= {
  username: 'ANurse',
  password: 'nurse',
  status: 'OK',
  role: User.roleType.NURSE
};
let paramedicId = null;
let incidentId1 = null;
let patientId1 = null;
let incidentId2 = null;
let patientId2 = null;
let nurseId = null;
let badId = "12345qwert";
let hospitalId = null;

suite('Patient API', function() {
  suiteSetup(function (done) {
    db.setup(function () {
      UserDAO.addUser(DISPATCHER)
      .then(() => {
        return UserDAO.addUser(PARAMEDIC);
      })
      .then(user => {
        paramedicId = user._id;
        return UserDAO.addUser(NURSE);
      })
      .then(nurse => {
        nurseId = nurse._id;
        HOSPITAL.nurse = nurse._id;
        return HospitalDAO.saveUpdateHospitalInfo(HOSPITAL);
      })
      .then(hospital => {
        hospitalId = hospital._id;
        console.log("hospitalId", hospitalId);
        return IncidentDAO.createNewIncident(paramedicId);
      })
      .then(incident => {
        incidentId1 = incident._id;
        return IncidentResponderDAO.updateIncidentCommander(incidentId1, paramedicId);
      })
      .then(() => {
        return PatientDAO.getByIncidentId(incidentId1);
      })
      .then(patient => {
        patientId1 = patient._id;
      })
      .then(() => {
        return IncidentDAO.createNewIncident(paramedicId);
      })
      .then(incident => {
        incidentId2 = incident._id;
        return IncidentResponderDAO.updateIncidentCommander(incidentId2, paramedicId);
      })
      .then(() => {
        return PatientDAO.getByIncidentId(incidentId2);
      })
      .then(patient => {
        patientId2 = patient._id;
      })
      .then(() => done())
      .catch((err) => done(err));
    });
  });

  suite('Get Patients Directory For Paramedic', function() {
    test('Get Patients To Take To ER', done => {
      agent.get(HOST + '/patients/paramedic/' + paramedicId + "/patientsDirOrder")
      .send()
      .end((err, res) => {
        expect(err).to.be(null);
        expect(res.statusCode).to.be.eql(200);
        expect(res.body['To Take To ER'].length).to.be.eql(2);
        expect(res.body['To Take To ER'][0]._id).to.be.eql(patientId1.toString());
        expect(res.body['To Take To ER'][1]._id).to.be.eql(patientId2.toString());
        expect(res.body['At ER']).to.be.eql([]);
        expect(res.body['Others']).to.be.eql([]);
        done();
      });
    });

    test('Get Patients At ER', done => {
      PatientDAO.updateByIncidentId(incidentId2, {'location': 'ER'})
      .then(() => {
        agent.get(HOST + '/patients/paramedic/' + paramedicId + "/patientsDirOrder")
        .send()
        .end((err, res) => {
          expect(err).to.be(null);
          expect(res.statusCode).to.be.eql(200);
          expect(res.body['To Take To ER'].length).to.be.eql(1);
          expect(res.body['At ER'].length).to.be.eql(1);
          expect(res.body['At ER'][0]._id).to.be.eql(patientId2.toString());
          expect(res.body['Others']).to.be.eql([]);
          done();
        });
      });
    });

    test('Get Patients in Others', done => {
      PatientDAO.updateByIncidentId(incidentId2, {'priority': '2'})
      .then(() => {
        agent.get(HOST + '/patients/paramedic/' + paramedicId + "/patientsDirOrder")
        .send()
        .end((err, res) => {
          expect(err).to.be(null);
          expect(res.statusCode).to.be.eql(200);
          expect(res.body['To Take To ER'].length).to.be.eql(1);
          expect(res.body['At ER']).to.be.eql([]);
          expect(res.body['Others'].length).to.be.eql(1);
          expect(res.body['Others'][0]._id).to.be.eql(patientId2.toString());
          done();
        });
      });
    });

    test('Should sort patients by priority', done => {
      PatientDAO.updateByIncidentId(incidentId1, {priority: '3'})
      .then(() => {
        agent.get(HOST + '/patients/paramedic/' + paramedicId + "/patientsDirOrder")
        .send()
        .end((err, res) => {
          expect(err).to.be(null);
          expect(res.statusCode).to.be.eql(200);
          expect(res.body['Others'].length).to.be.eql(2);
          expect(res.body['Others'][0]._id).to.be.eql(patientId2.toString());
          expect(res.body['Others'][1]._id).to.be.eql(patientId1.toString());
          done();
        });
      });
    })
  });

  suite('Patients Directory for Nurse', function () {
    test.skip('Get Patients for Nurse', function (done) {
      agent.get(HOST + '/patients/nurse/' + nurseId + '/patientsDirOrder')
      .send()
      .end((err, res) => {
        console.log(err);
        expect(err).to.be(null);
        expect(res.status).to.eql(200);
        expect(res.body['Beds Requested']).to.not.be(null);
        expect(res.body['Beds Ready']).to.not.be(null);
        expect(res.body['Beds Occupied']).to.not.be(null);
        done();
      });
    });

    test('Should fail with wrong user type', function (done) {
      agent.get(HOST + '/patients/Nurse/' + nurseId + '/patientsDirOrder')
      .send()
      .end((err, res) => {
        expect(res.body).to.eql({});
        expect(err.response.res.text).to.eql('Role not found');
        expect(err.status).to.be(404);
        done();
      });
    });

    test('Should fail with bad ID', function (done) {
      agent.get(HOST + '/patients/paramedic/' + badId + '/patientsDirOrder')
      .send()
      .end((err) => {
        expect(err).not.to.be(null);
        expect(err.status).to.be(500);
        done();
      });
    });
  });

  suite('Get Patients For Paramedic For Find Hospital', function() {
    test('Should get patients on the road', done => {
      PatientDAO.updateByIncidentId(incidentId1, {priority: 'E'})
      .then(() => {
        agent.get(HOST + '/patients/paramedic/' + paramedicId + "/findHospitalOrder")
        .send()
        .end((err, res) => {
          expect(err).to.be(null);
          expect(res.statusCode).to.be.eql(200);
          expect(res.body.length).to.be.eql(1);
          expect(res.body[0]._id).to.be.eql(patientId1.toString());
          done();
        });
      });
    });

    test('Should not get patients at the ER', done => {
      PatientDAO.updateByIncidentId(incidentId1, {'location': 'ER'})
      .then(() => {
        agent.get(HOST + '/patients/paramedic/' + paramedicId + "/findHospitalOrder")
        .send()
        .end((err, res) => {
          expect(err).to.be(null);
          expect(res.statusCode).to.be.eql(200);
          expect(res.body.length).to.be.eql(0);
          done();
        });
      });
    })
  })
});