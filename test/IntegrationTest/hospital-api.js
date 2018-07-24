let expect = require('expect.js');
let agent = require('superagent');

let PORT = 3000;
let HOST = 'http://localhost:' + PORT;

process.env.NODE_ENV = 'test';
// Initiate Server
let www = require('../../bin/www');
let db = require('../../util/mockDB');
let dbUtil = require('../../util/dbUtil');
let ObjectID = require('mongodb').ObjectID;
let Location = dbUtil.getModel('Location');

const User = dbUtil.getModel('User');
const UserDAO = require('../../util/dao/userDAO').UserDAO;
const HospitalDAO = require('../../util/dao/hospitalDAO').HospitalDAO;

const location = {latitude: '1', longitude: '2'};
const location2 = {latitude: '2', longitude: '2'};

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

let defaultHospital = {
  hospitalName: 'Test',
  address: '20 Fake St',
  description: 'Test Hospital',
  nurse: null,
  nurseIdCheck: false,
  location: location,
  beds: 4
};

let defaultHospital2 = {
  hospitalName: 'Test2',
  address: '20 Fake St',
  description: 'Test Hospital #2',
  nurse: null,
  nurseIdCheck: true,
  location: location2,
  beds: 4
};

let hospitalId1 = null;
let hospitalId2 = null;
let invalidId = "5ac85bc8e15f532aab591880";
let nurseId = null;
let paramedicId = null;
let patientId = new ObjectID();
let patientId2 = new ObjectID();

suite('Hospital API', function () {
  suiteSetup(function (done) {
    db.setup(function () {
      UserDAO.addUser(nurse)
      .then((user) => {
        nurseId = user._id;
        defaultHospital2.nurse = nurseId;
        defaultHospital.nurse = nurseId;
        return UserDAO.addUser(paramedic);
      })
      .then(user => {
        paramedicId = user._id;
      })
      .then(() => done())
      .catch((err) => done(err));
    });
  });

  suite('Create and Get Hospital', function () {
    test('Get hospital with invalid id', (done) => {
      agent.get(HOST + '/hospitals/' + invalidId)
      .send()
      .end((err, res) => {
        expect(err).to.be(null);
        expect(res.statusCode).to.be.eql(200);
        expect(res.body).to.be.eql([]);
        done();
      });
    });

    test('Create and Get hospital with given id from system where stored only itself', (done) => {
      agent.post(HOST + '/hospitals')
      .send(defaultHospital)
      .end((err, res) => {
        hospitalId = res.body._id;
        agent.get(HOST + '/hospitals/' + hospitalId)
        .send()
        .end((err, res) => {
          expect(err).to.be(null);
          expect(res.statusCode).to.be.eql(200);
          expect(res.body._id).to.be.eql(hospitalId);
          expect(res.body.hospitalName).to.be.eql('Test');
          expect(res.body.address).to.be.eql('20 Fake St');
          expect(res.body.description).to.be.eql('Test Hospital');
          expect(res.body.nurse).to.be.eql([]);
          expect(res.body.beds).to.be.eql(undefined);
          done();
        });
      });
    });

    test('Get Nurses from all the hospitals', done => {
      agent.get(HOST + '/hospitals/nurse/list')
        .send()
        .end((err, res) => {
          console.log(res.body);
          expect(res.statusCode).to.be.eql(200);
          expect(res.body[0].nurse).to.be.eql([]);
          done();
        })
    });

    test('Create and Get hospital with given id from system where stored two hospitals', (done) => {
      agent.post(HOST + '/hospitals')
      .send(defaultHospital2)
      .end((err, res) => {
        hospitalId2 = res.body._id;
        agent.get(HOST + '/hospitals/' + hospitalId2)
        .send()
        .end((err, res) => {
          expect(err).to.be(null);
          expect(res.statusCode).to.be.eql(200);
          expect(res.body._id).to.be.eql(hospitalId2);
          expect(res.body.hospitalName).to.be.eql('Test2');
          expect(res.body.address).to.be.eql('20 Fake St');
          expect(res.body.description).to.be.eql('Test Hospital #2');
          expect(res.body.nurse[0]).to.be.eql(nurseId.toString());
          expect(res.body.beds).to.be.eql(undefined);
          done();
        });
      });
    });

    test('Update Hospital with id', (done) => {
      agent.get(HOST + '/hospitals/' + hospitalId2)
      .send()
      .end((err, res) => {
        expect(err).to.be(null);
        expect(res.statusCode).to.be.eql(200);
        let hospitalUpdates = JSON.parse(JSON.stringify(defaultHospital2));
        hospitalUpdates.hospitalId = res.body._id;
        hospitalUpdates.hospitalName = "testUpdates";
        agent.post(HOST + '/hospitals')
        .send(hospitalUpdates)
        .end((err, res) => {
          expect(err).to.be(null);
          expect(res.statusCode).to.be.eql(200);
          expect(res.body._id).to.be.eql(hospitalId2);
          expect(res.body.hospitalName).to.be.eql('testUpdates');
          expect(res.body.address).to.be.eql('20 Fake St');
          expect(res.body.description).to.be.eql('Test Hospital #2');
          expect(res.body.nurse[0]).to.be.eql(nurseId.toString());
          expect(res.body.beds).to.be.eql(4);
          done();
        });
      });
    });

    test('Get hospital by nurse id', (done) => {
      agent.get(HOST + '/hospitals/nurse/' + nurseId)
      .send()
      .end((err, res) => {
        expect(err).to.be(null);
        expect(res.statusCode).to.be.eql(200);
        expect(res.body[0]._id).to.be.eql(hospitalId2);
        expect(res.body[0].hospitalName).to.be.eql('testUpdates');
        expect(res.body[0].address).to.be.eql('20 Fake St');
        expect(res.body[0].description).to.be.eql('Test Hospital #2');
        expect(res.body[0].nurse[0]).to.be.eql(nurseId.toString());
        expect(res.body[0].beds).to.be.eql(4);
        done();
      });
    });

  });

  suite('Delete Hospital', function () {
    test('Delete hospital with invalid id', (done) => {
      agent.delete(HOST + '/hospitals/' + invalidId)
      .send()
      .end((err, res) => {
        expect(err).to.be(null);
        expect(res.statusCode).to.be.eql(202);
        expect(res.body).to.be.eql([]);
        done();
      });
    });

    test('Delete hospitals with hospitalId', (done) => {
      agent.delete(HOST + '/hospitals/' + hospitalId)
      .send()
      .end((err, res) => {
        expect(err).to.be(null);
        expect(res.statusCode).to.be(202);
        agent.get(HOST + '/hospitals')
        .send()
        .end((err, res) => {
          expect(err).to.be(null);
          expect(res.statusCode).to.be.eql(200);
          expect(res.body.length).to.be.eql(1);
          expect(res.body[0].hospitalName).to.be.eql('testUpdates');
          expect(res.body[0].address).to.be.eql('20 Fake St');
          expect(res.body[0].description).to.be.eql('Test Hospital #2');
          expect(res.body[0].nurse[0]).to.be.eql(nurseId.toString());
          expect(res.body[0].beds).to.be.eql(4);
          agent.delete(HOST + '/hospitals/' + hospitalId2)
          .send()
          .end((err, res) => {
            expect(err).to.be(null);
            expect(res.statusCode).to.be(202);
            done();
          });
        });
      });
    });
  });

  suite('Get Hospitals By Responder Id For Find Hospital', () => {
    test('Should get hospitals by distance', done => {
      agent.post(HOST + '/hospitals')
      .send(defaultHospital)
      .end((err, res) => {
        expect(err).to.be(null);
        agent.post(HOST + '/hospitals')
        .send(defaultHospital2)
        .end((err, res) => {
          expect(err).to.be(null);
          agent.get(HOST + '/hospitals/responder/' + paramedicId)
          .send()
          .end((err, res) => {
            expect(res.statusCode).to.be(200);
            expect(res.body.length).to.be(2);
            expect(res.body[0].hospitalName).to.be.eql('Test');
            expect(res.body[1].hospitalName).to.be.eql('Test2');
            done();
          })
        })
      })
    });

    test('Should return internal server error when sending an invalid id', done => {
      agent.get(HOST + '/hospitals/responder/aaa')
      .send()
      .end((err, res) => {
        expect(err).not.to.be(null);
        expect(res.statusCode).to.be(500);
        done();
      })
    });

    test('Get Nurses from one hospital by hospital id', done => {
      agent.post(HOST + '/hospitals')
        .send(defaultHospital)
        .end((err, res) => {
          hospitalId = res.body._id;
          agent.get(HOST + '/hospitals/nurse/list/' + hospitalId)
            .send()
            .end((err, res) => {
              expect(res.statusCode).to.be.eql(200);
              expect(res.body.length).to.be.eql(1);
              expect(res.body[0].nurse).to.be.eql([]);
              done();
            })
        });
    });
  });

  suite('Assign and unassign patients to hospitals', () => {
    test('Should assign patients to hospitals with beds field and beds number also get updated', done => {
      agent.post(HOST + '/hospitals')
      .send(defaultHospital)
      .end((err, res) => {
        hospitalId1 = res.body._id;
        let data = {
          _id: hospitalId1,
          beds: 4
        }
        agent.put(HOST + '/hospitals/beds')
        .send(data)
        .end((err, res) => {
          let hospitals = {};
          hospitals[hospitalId1] = {
            assignList: [patientId, patientId2],
            unassignList: [],
            beds: 2,
          };
          agent.post(HOST + '/hospitals/patients')
          .send(hospitals)
          .end((err, res) => {
            agent.get(HOST + '/hospitals/' + hospitalId1)
            .send()
            .end((err, res) => {
              let hospital1 = res.body;
              expect(hospital1.patients.length).to.be(2);
              expect(hospital1.patients).to.contain(String(patientId));
              expect(hospital1.patients).to.contain(String(patientId2));
              expect(hospital1.beds).to.be(2);
              done();
            })
          })
        })
      })
    });

    test('Should assign patients to hospitals but beds number is not enough.', done => {
      agent.post(HOST + '/hospitals')
      .send(defaultHospital)
      .end((err, res) => {
        hospitalId1 = res.body._id;
        let data = {
          _id: hospitalId1,
          beds: 1
        }
        agent.put(HOST + '/hospitals/beds')
        .send(data)
        .end((err, res) => {
          let hospitals = {};
          hospitals[hospitalId1] = {
            assignList: [patientId, patientId2],
            unassignList: [],
          };
          agent.post(HOST + '/hospitals/patients')
          .send(hospitals)
          .end((err, res) => {
            done();
          })
        })
      })
    });

    test('Should assign patients to hospitals without beds field and beds number stay undefined', done => {
      agent.post(HOST + '/hospitals')
      .send(defaultHospital)
      .end((err, res) => {
        hospitalId1 = res.body._id;
        let hospitals = {};
        hospitals[hospitalId1] = {
          assignList: [patientId, patientId2],
          unassignList: [],
          beds: undefined,
        };
        agent.post(HOST + '/hospitals/patients')
        .send(hospitals)
        .end((err, res) => {
          agent.get(HOST + '/hospitals/' + hospitalId1)
          .send()
          .end((err, res) => {
            let hospital1 = res.body;
            expect(hospital1.patients.length).to.be(2);
            expect(hospital1.patients).to.contain(String(patientId));
            expect(hospital1.patients).to.contain(String(patientId2));
            expect(hospital1.beds).to.be(undefined);
            done();
          })
        })
      })
    });

    test('Should unassign patients from hospitals with beds field and beds number also get updated', done => {
      agent.post(HOST + '/hospitals')
      .send(defaultHospital)
      .end((err, res) => {
        hospitalId1 = res.body._id;
        let hospitals = {};
        hospitals[hospitalId1] = {
          assignList: [patientId, patientId2],
          unassignList: [],
          beds: 2,
        };
        agent.post(HOST + '/hospitals/patients')
        .send(hospitals)
        .end((err, res) => {
          let hospitals = {};
          hospitals[hospitalId1] = {
            assignList: [],
            unassignList: [patientId],
            beds: 3,
          }
          agent.post(HOST + '/hospitals/patients')
          .send(hospitals)
          .end((err, res) => {
            agent.get(HOST + '/hospitals/' + hospitalId1)
            .send()
            .end((err, res) => {
              let hospital1 = res.body;
              expect(hospital1.patients.length).to.be(1);
              expect(hospital1.patients).to.contain(String(patientId2));
              expect(hospital1.beds).to.be(3);
              done();
            })
          })
        })
      })
    });
  })

  suite('Update partial hospital information', () => {
    test('Should update ER bed number with given hospital id', done => {
      agent.post(HOST + '/hospitals')
      .send(defaultHospital)
      .end((err, res) => {
        let hospitalId = res.body._id;
        let data = {
          _id: hospitalId,
          beds: 4
        }
        agent.put(HOST + '/hospitals/beds')
        .send(data)
        .end((err, res) => {
          agent.get(HOST + '/hospitals/' +hospitalId)
          .send()
          .end((err, res) => {
            let hospital = res.body;
            expect(hospital.beds).to.be(4);
            done();
          })
        })
      })
    });
  })

  suiteTeardown(db.teardown);
});
