let expect = require('expect.js');
let agent = require('superagent');

let PORT = 3000;
let HOST = 'http://localhost:' + PORT;

process.env.NODE_ENV = 'test';
// Initiate Server
let www = require('../../bin/www');
let db = require('../../util/mockDB');
let dbUtil = require('../../util/dbUtil');
let Incident = dbUtil.getModel('Incident');

let user = {
  userName: 'testUser',
  passWord: 'test',
  register: 'true',
  role: 'Citizen',
  isActive: true,
  isOnline: false
};

let dispatcher = {
  userName: 'testDispatcher',
  passWord: 'test',
  register: 'true',
  role: 'Dispatcher',
  isActive: true,
  isOnline: false
};

let commander = {
  userName: 'testCommander',
  passWord: 'test',
  register: 'true',
  role: 'Nurse',
  isActive: true,
  isOnline: false
};

let userId;
let dispatcherId;
let incidentId;
let commanderId;
let patientId;
let badId = '1234567890asdfghjkl';
let address = 'new incident address';
let location = {
  latitude: 37.3951436,
  longitude: -122.0823248
};
let newAddress = 'address update';
let newLocation = {
  latitude: 37.3851436,
  longitude: -122.0723248
};
let priority = '1';
let emergencyType = 1; // fire
let newEmergencyType = 2; // medical
let displayId = 'I_testUser_1';
let responderGroupID;
let dispatcherGroupID;

suite('Incident API', function () {
  suiteSetup(function (done) {
    db.setup(function () {
      done();
    });
  });

  test('Add a New User', function (done) {
    agent.post(HOST + '/users')
      .send(user)
      .end(function (err, res) {
        expect(err).to.be.equal(null);
        expect(res.statusCode).to.be.equal(201);
        agent.get(HOST + '/users/username/' + user.userName)
          .send()
          .end(function (err, res) {
            userId = res.body.id;
            done();
          });
      });
  });

  test('Add a New Dispatcher', function (done) {
    agent.post(HOST + '/users')
      .send(dispatcher)
      .end(function (err, res) {
        expect(err).to.be.equal(null);
        expect(res.statusCode).to.be.equal(201);
        agent.get(HOST + '/users/username/' + dispatcher.userName)
          .send()
          .end(function (err, res) {
            dispatcherId = res.body.id;
            let data = {
              username: 'testDispatcher',
              password: 'test',
              role: 'Dispatcher',
              isActive: true,
              isOnline: false
            };

            agent.post(HOST + '/users/id/' + dispatcherId)
              .send(data)
              .end(function (err, res) {
                expect(res.statusCode).to.be.equal(200);
                done();
              });
          });
      });
  });

  test('Add a New Responder', function (done) {
    agent.post(HOST + '/users')
      .send(commander)
      .end(function (err, res) {
        expect(err).to.be.equal(null);
        expect(res.statusCode).to.be.equal(201);
        agent.get(HOST + '/users/username/' + commander.userName)
          .send()
          .end(function (err, res) {
            commanderId = res.body.id;
            let data = {
              username: 'testCommander',
              password: 'test',
              role: 'Nurse',
              isActive: true,
              isOnline: false
            };
            agent.post(HOST + '/users/id/' + commanderId)
              .send(data)
              .end(function (err, res) {
                expect(res.statusCode).to.be.equal(200);
                done();
              });
          });
      });
  });

  test('Create new incident', function (done) {
    let body = {
      role: user.role,
      callerId: userId
    };
    agent.post(HOST + '/incidents')
      .send(body)
      .end(function (err, res) {
        expect(err).to.be.equal(null);
        expect(res.statusCode).to.be.equal(201);
        incidentId = res.body.incidentId;
        done();
      });
  });


  test('Cannot create new incident when one is already open', function(done) {
    let body = {
      role: user.role,
      callerId: userId
    };
    agent.post(HOST + "/incidents")
    .send(body)
    .end(function(err, res) {
      expect(res.statusCode).to.be.equal(200);
      expect(res.body.incidentId).to.be(incidentId);
      done();
    });
  });

  test('Update incident state for existing incident', function (done) {
    let body = {
      incidentId: incidentId
    };
    agent.put(HOST + '/incidents/state')
      .send(body)
      .end(function (err, res) {
        expect(err).to.be(null);
        expect(res.statusCode).to.be.equal(200);
        expect(res.body._id).to.be.equal(incidentId);
        expect(res.body.state).to.be.equal(Incident.incidentState.TRIAGE);
        done();
      });
  });

  test('Update incident state for bad incident id', function (done) {
    let body = {
      incidentId: badId
    };
    agent.put(HOST + '/incidents/state')
      .send(body)
      .end(function (err, res) {
        expect(err).not.to.be(null);
        expect(res.statusCode).to.be.equal(500);
        done();
      });
  });

  test('Create new incident with fake callerId', function (done) {
    let body = {
      role: 'Citizen',
      callerId: badId
    };
    agent.post(HOST + '/incidents')
      .send(body)
      .end(function (err, res) {
        expect(err).not.to.be(null);
        expect(res.statusCode).to.be.equal(500);
        done();
      });
  });

  test('Add incident address to existing incident', function (done) {
    let body = {
      incidentId: incidentId,
      address: address,
      latitude: location.latitude,
      longitude: location.longitude
    };
    agent.put(HOST + '/incidents/location')
      .send(body)
      .end(function (err, res) {
        expect(err).to.be(null);
        expect(res.statusCode).to.be.equal(200);
        expect(res.body._id).to.be.equal(body.incidentId);
        expect(res.body.address).to.be.equal(body.address);
        expect(res.body.location.latitude).to.be.equal(body.latitude);
        expect(res.body.location.longitude).to.be.equal(body.longitude);
        done();
      });
  });

  test('Update incident address for existing incident', function (done) {
    let body = {
      incidentId: incidentId,
      address: newAddress,
      latitude: newLocation.latitude,
      longitude: newLocation.longitude
    };
    agent.put(HOST + '/incidents/location')
      .send(body)
      .end(function (err, res) {
        expect(err).to.be(null);
        expect(res.statusCode).to.be.equal(200);
        expect(res.body._id).to.be.equal(body.incidentId);
        expect(res.body.address).to.be.equal(body.address);
        expect(res.body.location.latitude).to.be.equal(body.latitude);
        expect(res.body.location.longitude).to.be.equal(body.longitude);
        done();
      });
  });

  test('Add incident address to existing incident', function (done) {
    let body = {
      incidentId: badId,
      address: address,
      latitude: location.latitude,
      longitude: location.longitude
    };
    agent.put(HOST + '/incidents/location')
      .send(body)
      .end(function (err, res) {
        expect(err).not.to.be(null);
        expect(res.statusCode).to.be.equal(500);
        done();
      });
  });

  test('Get incident address from existing incident', function (done) {
    agent.get(HOST + '/incidents/location/' + incidentId)
      .send()
      .end(function (err, res) {
        expect(err).to.be(null);
        expect(res.statusCode).to.be.equal(200);
        expect(res.body.address).to.be.equal(newAddress);
        expect(res.body.location.latitude).to.be.equal(newLocation.latitude);
        expect(res.body.location.longitude).to.be.equal(newLocation.longitude);
        done();
      });
  });

  test('Get incident address from incident with fake incident id', function (done) {
    agent.get(HOST + '/incidents/location/' + badId)
      .send()
      .end(function (err, res) {
        expect(err).not.to.be(null);
        expect(res.statusCode).to.be.equal(500);
        done();
      });
  });

  test('Add incident type to existing incident', function (done) {
    let body = {
      incidentId: incidentId,
      emergencyType: emergencyType
    };
    agent.put(HOST + '/incidents/type')
      .send(body)
      .end(function (err, res) {
        expect(err).to.be(null);
        expect(res.statusCode).to.be.equal(200);
        expect(res.body._id).to.be.equal(body.incidentId);
        expect(res.body.emergencyType).to.be.equal(emergencyType);
        done();
      });
  });

  test('Update incident answers to existing incident', function (done) {
    let answers = {
      patient: '1',
      sex: '',
      citizenAge: '1',
      conscient: '2',
      smoke: '1',
      breathing: '',
      citizenChiefComplaint: '1',
      citizenPatientsProfile: '',
      flame: '1',
      fireInjury: '1',
      hazardous: '1',
      citizenPeople: '1',
      getOut: '1',
      weapon: '1',
      weaponInjury: '1',
      citizenSuspectDescription: '1',
      suspectLeft: '1',
      safe: '1',
      citizenCrimeDetail: '1'
    };

    let data = {
      incidentId: incidentId, 
      answerInfo: JSON.stringify(answers)
    };

    agent.put(HOST + '/incidents/answer')
      .send(data)
      .end(function (err, res) {
        expect(err).to.be.equal(null);
        expect(res.statusCode).to.be.equal(200);
        done();
      });
  });

  test('Get incident answers to existing incident', function (done) {
    let answers = {
      patient: '1',
      sex: '',
      citizenAge: '1',
      conscient: '2',
      smoke: '1',
      breathing: '',
      citizenChiefComplaint: '1',
      citizenPatientsProfile: '',
      flame: '1',
      fireInjury: '1',
      hazardous: '1',
      citizenPeople: '1',
      getOut: '1',
      weapon: '1',
      weaponInjury: '1',
      citizenSuspectDescription: '1',
      suspectLeft: '1',
      safe: '1',
      citizenCrimeDetail: '1'
    };
    agent.get(HOST + '/incidents/answer/' + incidentId)
      .send()
      .end(function (err, res) {
        expect(err).to.be.equal(null);
        expect(res.statusCode).to.be.equal(200);
        let user = res.body;
        expect(user.incidentId).to.be.equal(answers.incidentId);
        expect(user.patient).to.be.equal(answers.patient);
        expect(user.sex).to.be.equal(answers.sex);
        expect(user.citizenAge).to.be.equal(answers.citizenAge);
        expect(user.conscient).to.be.equal(answers.conscient);
        expect(user.smoke).to.be.equal(answers.smoke);
        expect(user.citizenChiefComplaint).to.be.equal(answers.citizenChiefComplaint);
        expect(user.flame).to.be.equal(answers.flame);

        done();
      });
  });

  test('Update incident type for existing incident', function (done) {
    let body = {
      incidentId: incidentId,
      emergencyType: newEmergencyType
    };
    agent.put(HOST + '/incidents/type')
      .send(body)
      .end(function (err, res) {
        expect(err).to.be(null);
        expect(res.statusCode).to.be.equal(200);
        expect(res.body._id).to.be.equal(body.incidentId);
        expect(res.body.emergencyType).to.be.equal(body.emergencyType);
        done();
      });
  });

  test('Add incident type to existing incident', function (done) {
    let body = {
      incidentId: badId,
      emergencyType: emergencyType
    };
    agent.put(HOST + '/incidents/type')
      .send(body)
      .end(function (err, res) {
        expect(err).not.to.be(null);
        expect(res.statusCode).to.be.equal(500);
        done();
      });
  });

  test('Get incident type from existing incident', function (done) {
    agent.get(HOST + '/incidents/incidentType/' + incidentId)
      .send()
      .end(function (err, res) {
        expect(err).to.be(null);
        expect(res.statusCode).to.be.equal(200);
        expect(res.body.emergencyType).to.be.equal(newEmergencyType);
        done();
      });
  });

  test('Get incident type from incident with fake incident id', function (done) {
    agent.get(HOST + '/incidents/incidentType/' + badId)
      .send()
      .end(function (err, res) {
        expect(err).not.to.be(null);
        expect(res.statusCode).to.be.equal(500);
        done();
      });
  });

  test('Get incident displayId from existing incident', function (done) {
    agent.get(HOST + '/incidents/display/' + incidentId)
      .send()
      .end(function (err, res) {
        expect(err).to.be(null);
        expect(res.statusCode).to.be.equal(200);
        expect(res.body.displayId).to.be.equal(displayId);
        done();
      });
  });

  test('Get incident displayId from incident with fake incident id', function (done) {
    agent.get(HOST + '/incidents/incidentType/' + badId)
      .send()
      .end(function (err, res) {
        expect(err).not.to.be(null);
        expect(res.statusCode).to.be.equal(500);
        done();
      });
  });

  test('Update priority for existing incident', function (done) {
    let body = {
      incidentId: incidentId,
      priority: priority
    };
    agent.put(HOST + '/incidents/priority')
      .send(body)
      .end(function (err, res) {
        expect(err).to.be(null);
        expect(res.statusCode).to.be.equal(200);
        done();
      });
  });

  test('Update priority for fake incident', function (done) {
    let body = {
      incidentId: badId,
      priority: priority
    };
    agent.put(HOST + '/incidents/priority')
      .send(body)
      .end(function (err, res) {
        expect(err).not.to.be(null);
        expect(res.statusCode).to.be.equal(500);
        done();
      });
  });

  test('Get incident info for step 5 in dispatcher 911 for existing incident', function (done) {
    agent.get(HOST + '/incidents/incidentInfo/' + incidentId)
      .send()
      .end(function (err, res) {
        expect(err).to.be(null);
        expect(res.statusCode).to.be.equal(200);
        expect(res.body.priority).to.be.equal(priority);
        done();
      });
  });

  test('Get incident info for step 5 in dispatcher 911 for fake incident', function (done) {
    agent.get(HOST + '/incidents/incidentInfo/' + badId)
      .send()
      .end(function (err, res) {
        expect(err).not.to.be(null);
        expect(res.statusCode).to.be.equal(500);
        done();
      });
  });

  test('Create new incident as first responder', function (done) {
    let body = {
      role: dispatcher.role,
      userId: userId
    };
    agent.post(HOST + '/incidents')
      .send(body)
      .end(function (err, res) {
        expect(err).to.be.equal(null);
        expect(res.statusCode).to.be.equal(201);
        done();
      });
  });

  test('Create new incident with fake userId', function (done) {
    let body = {
      role: dispatcher.role,
      userId: badId
    };
    agent.post(HOST + '/incidents')
      .send(body)
      .end(function (err, res) {
        expect(err).not.to.be(null);
        expect(res.statusCode).to.be.equal(500);
        done();
      });
  });

  test('Get all open incidents', function (done) {
    agent.get(HOST + '/incidents/open')
    .send()
    .end(function (err, res) {
      expect(res.statusCode).to.be.equal(200);
      expect(res.body.length).to.be(2);
      done();
    })
  })

  test('Create new incident when there is already an open incident assigned to you', function (done) {
    let body = {
      role: dispatcher.role,
      userId: userId
    };
    agent.post(HOST + '/incidents')
      .send(body)
      .end(function (err, res) {
        expect(res.statusCode).to.be.equal(200);
        done();
      });
  });

  test('Update commander for existing incident', function (done) {
    let body = {
      incidentId: incidentId,
      commanderId: commanderId
    };
    agent.put(HOST + '/incidents/commander')
      .send(body)
      .end(function (err, res) {
        expect(err).to.be(null);
        expect(res.statusCode).to.be.equal(200);
        done();
      });
  });

  test('Update commander for fake incident', function (done) {
    let body = {
      incidentId: badId,
      priority: commanderId
    };
    agent.put(HOST + '/incidents/commander')
      .send(body)
      .end(function (err, res) {
        expect(err).not.to.be(null);
        expect(res.statusCode).to.be.equal(500);
        done();
      });
  });

  test('Create a dispatcher group and update id for existing incident', function(done) {
    let group = {
      "name": "dispatcher group",
      "description": "this is a group",
      "participants": [userId]
    };
    agent.post(HOST + '/group/create/' + dispatcherId)
      .send(group)
      .end(function(err, res) {
        dispatcherGroupID = res.body;
        let body = {
          incidentId: incidentId,
          dispatcherGroupId: dispatcherGroupID
        };
        agent.put(HOST + '/incidents/dispatcherGroup')
          .send(body)
          .end(function (err, res) {
            expect(err).to.be(null);
            expect(res.statusCode).to.be.equal(200);
            expect(res.body.dispatcherGroupId).to.be.equal(dispatcherGroupID);
            done();
          });
      });
  });


  test('Create a responder group and update id for existing incident', function(done) {
    let group = {
      "name": "responder group",
      "description": "this is a group",
      "participants": [userId, dispatcherId]
    };
    agent.post(HOST + '/group/create/' + commanderId)
      .send(group)
      .end(function(err, res) {
        responderGroupID = res.body;
        let body = {
          incidentId: incidentId,
          responderGroupId: responderGroupID
        };
        agent.put(HOST + '/incidents/responderGroup')
          .send(body)
          .end(function (err, res) {
            expect(err).to.be(null);
            expect(res.statusCode).to.be.equal(200);
            expect(res.body.responderGroupId).to.be.equal(responderGroupID);
            done();
          });
      });
  });

  test('Create new patient from incident id', function (done) {
    agent.get(HOST + '/incidents/' + incidentId + '/patient')
    .send()
    .end(function (err, res) {
      expect(err).to.be(null);
      expect(res.statusCode).to.be.equal(200);
      patientId = res.body._id;
      done();
    })
  });

  test('Get patient by incident id', function (done) {
    agent.get(HOST + '/incidents/' + incidentId + '/patient')
    .send()
    .end(function (err, res) {
      expect(err).to.be(null);
      expect(res.statusCode).to.be.equal(200);
      expect(res.body._id).to.be.eql(patientId);
      done();
    })
  });

  test('Not get patient by fake incident id', function (done) {
    agent.get(HOST + '/incidents/' + badId + '/patient')
    .send()
    .end(function (err, res) {
      expect(err).not.to.be(null);
      expect(res.statusCode).to.be.equal(404);
      done();
    })
  });

  test('Update patient by incident id', function (done) {
    let body = {
      priority: '1',
      name: 'Wuyingying'
    };
    agent.patch(HOST + '/incidents/' + incidentId + '/patient')
    .send(body)
    .end(function(err, res) {
      expect(err).to.be(null);
      agent.get(HOST + '/incidents/' + incidentId + '/patient')
      .send()
      .end(function(err, res) {
        expect(err).to.be(null);
        expect(res.body._id).to.be.eql(patientId);
        expect(res.body.priority).to.be.eql(body.priority);
        expect(res.body.name).to.be.eql(body.name);
        expect(res.body.location).to.be.eql('road');
        done();
      });
    })
  });

  test('Not update patient with invalid fields', function (done) {
    let body = {
      priority: '5'
    };
    agent.patch(HOST + '/incidents/' + incidentId + '/patient')
    .send(body)
    .end(function (err, res) {
      expect(err).not.to.be(null);
      expect(res.statusCode).to.be.equal(422);
      done();
    })
  });

  test('Not update patient with fake incident id', function (done) {
    let body = {
      priority: '2'
    };
    agent.patch(HOST + '/incidents/' + badId + '/patient')
    .send(body)
    .end(function (err, res) {
      expect(err).not.to.be(null);
      expect(res.statusCode).to.be.equal(404);
      done();
    })
  });

  test('Get incident state for existing incident', function (done) {
    let body = {
      incidentId: incidentId
    };
    agent.get(HOST + '/incidents/state/'+incidentId)
      .send(body)
      .end(function (err, res) {
        expect(err).to.be(null);
        expect(res.statusCode).to.be.equal(200);
        expect(res.body._id).to.be.equal(incidentId);
        expect(res.body.state).to.be.equal(Incident.incidentState.TRIAGE);
        done();
      });
  });

  test('Get incident state for bad incident id', function (done) {
    let body = {
        incidentId: badId
    };
    agent.get(HOST + '/incidents/state/'+badId)
      .send(body)
      .end(function (err, res) {
        expect(err).not.to.be(null);
        expect(res.statusCode).to.be.equal(500);
        done();
      });
  });


  test('Close incident state for existing incident', function (done) {
    let body = {
      incidentId: incidentId
    };
    agent.put(HOST + '/incidents/closedState/'+incidentId)
      .send(body)
      .end(function (err, res) {
         expect(err).to.be(null);
         expect(res.statusCode).to.be.equal(200);
         expect(res.body._id).to.be.equal(incidentId);
         expect(res.body.state).to.be.equal(Incident.incidentState.CLOSED);
         done();
      });
  });

  test('Close incident state for bad incident id', function (done) {
    let body = {
       incidentId: badId
    };
    agent.put(HOST + '/incidents/closedState/'+badId)
      .send(body)
      .end(function (err, res) {
         expect(err).not.to.be(null);
         expect(res.statusCode).to.be.equal(500);
         done();
      });
  });


  suiteTeardown(db.teardown);
});
