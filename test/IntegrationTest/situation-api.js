let expect = require('expect.js');
let agent = require('superagent');

let PORT = 3000;
let HOST = 'http://localhost:' + PORT;

process.env.NODE_ENV = 'test';
// Initiate Server
let www = require('../../bin/www');
let db = require('../../util/mockDB');
let dbUtil = require('../../util/dbUtil');
let Situation = dbUtil.getModel('Situation');

let user = {
  userName: 'testUser',
  passWord: 'test',
  register: 'true',
  role: 'Citizen',
  isActive: true,
  isOnline: false
};

let situationToCreate = {
  name: "New Situation",
  creatorId: user._id,
  address: "Situation Address",
  affectedRadius: 2,
  location: {
    longitude: 123.123,
    latitude: -35.1234
  },
  description: "Situation Description",
  specialNotes: "Situation Special Notes",
  affectedUsers: []
};

let situation1 = {
  name: "New Situation1",
  creatorId: user._id,
  address: "Situation Address 1",
  affectedRadius: 5,
  location: {
    longitude: -122.044183,
    latitude: 37.384927
  },
  description: "Situation Description 1",
  specialNotes: "Situation Special Notes 1",
  affectedUsers: []
};

let situation2 = {
  name: "New Situation 2",
  creatorId: user._id,
  address: "Situation Address 2",
  affectedRadius: 5,
  location: {
    longitude: -122.041308,
    latitude: 37.390280
  },
  description: "Situation Description 2",
  specialNotes: "Situation Special Notes 2",
  affectedUsers: []
};

let situation3 = {
  name: "New Situation 3",
  creatorId: user._id,
  address: "Situation Address 3",
  affectedRadius: 5,
  location: {
    longitude: -122.040578,
    latitude: 37.383768
  },
  description: "Situation Description 3",
  specialNotes: "Situation Special Notes 3",
  affectedUsers: []
};

let situationId;
let badId = "1234567qwertyui";

suite('Situation API', function () {
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
            user._id = res.body.id;
            done();
          });
      });
  });

  test('Create new situation', function (done) {
    let situation = {
      situation: JSON.stringify(situationToCreate)
    }
    agent.post(HOST + '/situations/')
      .send(situation)
      .end(function (err, res) {
        let savedSituation = res.body;
        expect(err).to.be.equal(null);
        expect(res.statusCode).to.be.equal(200);
        expect(savedSituation.name).to.equal(situationToCreate.name);
        expect(savedSituation.creatorId).to.equal(situationToCreate.creatorId);
        expect(savedSituation.address).to.equal(situationToCreate.address);
        expect(savedSituation.affectedRadius).to.equal(situationToCreate.affectedRadius);
        expect(savedSituation.location.coordinates[0]).to.equal(situationToCreate.location.longitude);
        expect(savedSituation.location.coordinates[1]).to.equal(situationToCreate.location.latitude);
        expect(savedSituation.description).to.equal(situationToCreate.description);
        expect(savedSituation.specialNotes).to.equal(situationToCreate.specialNotes);
        expect(savedSituation.affectedUsers.length).to.equal(0);
        expect(parseInt(savedSituation.state)).to.equal(Situation.situationState.OPEN);
        situationId = savedSituation._id;
        done();
      });
  });

  test('Get all situations with no user location', function (done) {
    agent.get(HOST + '/situations/')
      .send()
      .end(function (err, res) {
        expect(res.status).to.be(200);
        expect(res.body.length).to.be(1);
        done();
      });
  })

  test('Get all situations with user location', function (done) {
    let location = {
      longitude: -120.3333,
      latitude: 23.4444
    };
    agent.get(HOST + '/situations?longitude=' + location.longitude + "&latitude=" + location.latitude)
      .send()
      .end(function (err, res) {
        expect(res.status).to.be(200);
        expect(res.body.length).to.be(1);
        done();
      });
  })
  test('Find situation information', function (done) {
    agent.get(HOST + '/situations/' + situationId)
      .send()
      .end(function (err, res) {
        let savedSituation = res.body;
        expect(savedSituation.name).to.equal(situationToCreate.name);
        expect(savedSituation.creatorId).to.equal(situationToCreate.creatorId);
        expect(savedSituation.address).to.equal(situationToCreate.address);
        expect(savedSituation.affectedRadius).to.equal(situationToCreate.affectedRadius);
        expect(savedSituation.location.coordinates[0]).to.equal(situationToCreate.location.longitude);
        expect(savedSituation.location.coordinates[1]).to.equal(situationToCreate.location.latitude);
        expect(savedSituation.description).to.equal(situationToCreate.description);
        expect(savedSituation.specialNotes).to.equal(situationToCreate.specialNotes);
        expect(savedSituation.affectedUsers.length).to.equal(0);
        expect(parseInt(savedSituation.state)).to.equal(Situation.situationState.OPEN);
        done();
      });
  });

  test('Find situation with bad ID', function (done) {
    agent.get(HOST + '/situations/' + badId)
      .send()
      .end(function (err, res) {
        expect(err).not.to.be(null);
        done();
      });
  });

  test('Find situations by date', function (done) {
    let newSituation1 = {
      situation: JSON.stringify(situation1)
    };
    let newSituation2 = {
      situation: JSON.stringify(situation2)
    };
    let newSituation3 = {
      situation: JSON.stringify(situation3)
    };
    agent.post(HOST + '/situations/')
      .send(newSituation1)
      .end(function (err, res) {
        situation1._id = res.body._id;
        agent.post(HOST + '/situations/')
          .send(newSituation2)
          .end(function (err, res) {
            situation2._id = res.body._id;
            agent.post(HOST + '/situations/')
              .send(newSituation3)
              .end(function (err, res) {
                situation3._id = res.body._id;
                agent.get(HOST + '/situations/')
                  .send()
                  .end(function (err, res) {
                    let newSituation = res.body;
                    expect(newSituation.length).to.eql(4);
                    expect(newSituation[0]._id).to.eql(situation3._id);
                    expect(newSituation[1]._id).to.eql(situation2._id);
                    expect(newSituation[2]._id).to.eql(situation1._id);
                    expect(newSituation[3]._id).to.eql(situationId);
                    done();
                  });
              });
          });
      });
  });

  test('Update situation info', function (done) {
    let newSituationInfo = {
      name: "Situation Update",
      creatorId: user._id,
      address: "Updated Address",
      affectedRadius: 230,
      location: {
        longitude: 123.456,
        latitude: -35.9898
      },
      description: "Updated Description",
      specialNotes: "Updated Special Notes",
      affectedUsers: [],
      state: 2
    };

    let newSituation = {
      situation: JSON.stringify(newSituationInfo)
    };

    agent.put(HOST + '/situations/' + situationId)
      .send(newSituation)
      .end(function (err, res) {
        let updatedInfo = res.body;
        expect(updatedInfo._id).to.eql(situationId);
        expect(updatedInfo.name).to.eql(newSituationInfo.name);
        expect(updatedInfo.creatorId).to.eql(newSituationInfo.creatorId);
        expect(updatedInfo.address).to.eql(newSituationInfo.address);
        expect(updatedInfo.affectedRadius).to.eql(newSituationInfo.affectedRadius);
        expect(updatedInfo.location.coordinates[0]).to.eql(newSituationInfo.location.longitude);
        expect(updatedInfo.location.coordinates[1]).to.eql(newSituationInfo.location.latitude);
        expect(updatedInfo.description).to.eql(newSituationInfo.description);
        expect(updatedInfo.specialNotes).to.eql(newSituationInfo.specialNotes);
        expect(updatedInfo.affectedUsers.length).to.eql(0);
        done();
      });
  });

  test('Update situation with bad ID', function (done) {
    agent.put(HOST + '/situations/' + badId)
      .send()
      .end(function (err, res) {
        expect(err).not.to.be(null);
        done();
      });
  });

  test('Add to affected user list', function (done) {
    agent.put(HOST + '/situations/' + situationId + '/affectedUsers')
      .send({userId: user._id})
      .end(function (err, res) {
        expect(res.body.affectedUsers[0]).to.eql(user._id);
        done();
      })
  });

  test('Add to affected user list with bad ID', function (done) {
    agent.put(HOST + '/situations/list/' + badId)
      .send()
      .end(function (err, res) {
        expect(err).not.to.be(null);
        done();
      });
  });

  test('Get affected user list ', function (done) {
    agent.get(HOST + '/situations/' + situationId + '/affectedUsers')
      .send()
      .end(function (err, res) {
        let affectedUsers = res.body;
        expect(affectedUsers.length).to.eql(1);
        expect(affectedUsers[0]).to.eql(user._id);
        done();
      })
  });

  test('Get affected user list with bad ID', function (done) {
    agent.get(HOST + '/situations/list/' + badId)
      .send()
      .end(function (err, res) {
        expect(err).not.to.be(null);
        done();
      });
  });

  test('Pop out affected user list ', function (done) {
    agent.put(HOST + '/situations/' + situationId + '/affectedUsers')
      .send({userId: user._id})
      .end(function (err, res) {
        expect(res.body.affectedUsers.length).to.eql(0);
        done();
      })
  });

  test('Pop out affected user list with bad ID', function (done) {
    agent.put(HOST + '/situations/list/' + badId)
      .send()
      .end(function (err, res) {
        expect(err).not.to.be(null);
        done();
      });
  });

  test('update location of user', function (done) {
    let location = {
      type: 'Point',
      coordinates: [122.3333, -33.4444]
    };

    agent.post(HOST + '/map/' + user._id + '/location')
      .send(location)
      .end(function (err, res) {
        expect(err).to.be.equal(null);
        expect(res.statusCode).to.be.equal(200);
        done();
      });
  });

  test('Get nearby situations of a user', function (done) {
    agent.get(HOST + '/situations/nearby/user/' + user._id)
    .send()
    .end(function(err,res) {
      expect(err).to.be(null);
      expect(res.body.length).to.be(1);
      done();
    })
  });

  test('Get nearby situations of a user with bad Id', function (done) {
    agent.get(HOST + '/situations/nearby/user/' + badId)
      .send()
      .end(function (err, res) {
        expect(err).not.to.be(null);
        done();
      });
  });


  test('Close situations ', function (done) {
    agent.put(HOST + '/situations/close/' + situationId)
      .send()
      .end(function (err, res) {
        expect(res.body.state).to.eql(Situation.situationState.CLOSED);
        done();
      })
  });

  test('close situation with bad ID', function (done) {
    agent.put(HOST + '/situations/close/' + badId)
      .send()
      .end(function (err, res) {
        expect(err).not.to.be(null);
        done();
      });
  });


  suiteTeardown(db.teardown);
});
