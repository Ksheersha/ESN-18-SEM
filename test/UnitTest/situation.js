process.env.NODE_ENV = "test";
let expect = require('expect.js');
let db = require('../../util/mockDB');
let dbUtil = require('../../util/dbUtil');
let UserDAO = require('../../util/dao/userDAO').UserDAO;
let SituationDAO = require('../../util/dao/situationDAO');
let Situation = dbUtil.getModel('Situation');

let user = {
  username: 'test123',
  password: '1234',
  register: 'true',
  status: 'OK',
  role: 'Citizen',
  isActive: false,
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

suite('Situation unit tests', function () {
  suiteSetup(function (done) {
    db.setup(function () {
      UserDAO.addUser(user)
      .then(function (savedUser) {
        user._id = savedUser._id;
        done();
      });
    });
  });

  test('Create situation for User', function (done) {
    SituationDAO.createNewSituation(situationToCreate)
    .then(function (savedSituation) {
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
    })
  });

  test('Find situation information', function (done) {
    SituationDAO.getSituationInfo(situationId)
    .then(function (savedSituation) {
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
    SituationDAO.getSituationInfo(badId)
    .catch(function (err) {
      expect(err).not.to.be(null);
      done();
    });
  });

  test('Find situations by date', function (done) {
    SituationDAO.createNewSituation(situation1)
    .then(function (s) {
      situation1._id = s._id;
      SituationDAO.createNewSituation(situation2)
      .then(function (s) {
        situation2._id = s._id;
        SituationDAO.createNewSituation(situation3)
        .then(function (s) {
          situation3._id = s._id;
          SituationDAO.getAllSituationsByDate()
          .then(function (situations) {
            expect(situations.length).to.eql(4);
            expect(situations[0]._id).to.eql(situation3._id);
            expect(situations[1]._id).to.eql(situation2._id);
            expect(situations[2]._id).to.eql(situation1._id);
            expect(situations[3]._id).to.eql(situationId);
            done();
          });
        });
      });
    });
  });

  test('Find situations by distance', function (done) {
    let userLocation = {
      longitude: -122.040580,
      latitude: 37.383770
    };

    SituationDAO.getAllSituationByDistance(userLocation)
    .then(function (situations) {
      expect(situations.length).to.eql(4);
      expect(situations[0]._id.toString()).to.eql(situation3._id.toString());
      expect(situations[1]._id.toString()).to.eql(situation1._id.toString());
      expect(situations[2]._id.toString()).to.eql(situation2._id.toString());
      expect(situations[3]._id.toString()).to.eql(situationId.toString());
      done();
    });
  });

  test('Find situations by distance without location should fail', function (done) {
    SituationDAO.getAllSituationByDistance()
    .catch(function (err) {
      expect(err).not.to.be(null);
      done();
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
    SituationDAO.updateSituationInfo(situationId, newSituationInfo)
    .then(function (updatedInfo) {
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

  test('Get situations for user after last logout', function (done) {
    let date = new Date(2017, 1, 1, 0, 0, 0, 0);
    let userLocation = {
      longitude: -122.040580,
      latitude: 37.383770
    };
    SituationDAO.getSituationsAfterDate(date, userLocation)
    .then(function (situations) {
      expect(situations.length).to.eql(3);
      expect(situations[0]._id).to.eql(situation3._id);
      expect(situations[1]._id).to.eql(situation1._id);
      expect(situations[2]._id).to.eql(situation2._id);
      done();
    })
  });

  test('Add to affected user list', function (done) {
    SituationDAO.updateAffectedUserList(situationId, user._id)
      .then(function (situation) {
        expect(situation.affectedUsers[0]).to.eql(user._id);
        done();
      })
  });

  test('Get affected user list ', function (done) {
    SituationDAO.getAffectedUserList(situationId)
      .then(function (affectedUsers) {
        expect(affectedUsers[0]).to.eql(user._id);
        done();
      })
  });

  test('Pop out affected user list ', function (done) {
    SituationDAO.updateAffectedUserList(situationId, user._id)
      .then(function (situations) {
        expect(situations.affectedUsers.length).to.eql(0);
        done();
      })
  });

  test('Close situations ', function (done) {
    SituationDAO.closeSituation(situationId)
      .then(function (situations) {
        expect(situations.state).to.eql(Situation.situationState.CLOSED);
        done();
      })
  });



  suiteTeardown(db.teardown);
});
