let expect = require('expect.js');

process.env.NODE_ENV = "test";
let db = require('../../util/mockDB');
let DAO = require('../../util/dao/userDAO').UserDAO;
let LocationDAO = require('../../util/dao/locationDAO').LocationDAO;
let dbUtil = require('../../util/dbUtil');
let User = dbUtil.getModel('User');

suite('Join Community Unit Tests', function() {
  suiteSetup(function (done) {
    db.setup(function () {
      done();
    })
  })

  test('Add a new user', function(done) {
    let user = {
      username: "findingInternshipIsHard",
      password: "tureStory",
      status: "OK",
      role:User.roleType.CITIZEN,
      isCoordinator: false,
      isActive: false,
      isOnline: false
    };
    DAO.addUser(user).then(function(u) {
      expect(u.username).to.equal('findingInternshipIsHard');
      expect(u.status.status).to.equal('OK');
      done();
    }, function(err) {
      fail(err);
      done();
    });
  });

  test('Fail to add new user by missing username', function(done) {
    let user = {
      passWord: "tureStory",
    };
    DAO.addUser(user).then(function(u) {
      fail();
    }, function(err) {
      expect(err).not.to.be.equal(null);
      done();
    });
  });

  test('Fail to add new user by missing password', function(done) {
    let user = {
      userName: "giveMeAnOfferPlease",
    };
    DAO.addUser(user).then(function(u) {
      fail();
    }, function(err) {
      expect(err).not.to.be.equal(null);
      done();
    });
  });

  test('Get a user list', function(done) {
    let user = {
        username: "aaaaaaaaa",
        password: "atLeastGiveMeInterview",
        status: "OK",
        role:User.roleType.CITIZEN,
        isCoordinator: false,
        isActive: false,
        isOnline: false
    };

    DAO.addUser(user).then(function(u) {
      DAO.getAllUsers({}, {username: 1}, function(err, users) {
        expect(err).to.be.equal(null);
        expect(users[0].username).to.equal('aaaaaaaaa');
        done();
      });
    });
  });

  test('Update user role and coordinator authorization', function (done) {
    let user = {
        username: "aaaaaaaaa",
        password: "atLeastGiveMeInterview",
        status: "OK",
        role:User.roleType.CITIZEN,
        isCoordinator: false,
        isActive: false,
        isOnline: false
    };

    DAO.addUser(user).then(function (user) {
      DAO.updateUser(user.id, {isCoordinator: true}).then(function (u) {
        expect(u.role).to.equal(User.roleType.CITIZEN);
        expect(u.isCoordinator).to.equal(true);
        done();
      }, function (err) {
        expect(err).not.to.be.equal(null);
        done();
      });
    }, function(err) {
      expect(err).not.to.be.equal(null);
      done();
    });
  });

  test('A Adminitrator user can not be changed into a non-coordinator one', function (done) {
    let user = {
        username: "aaaaaaaaa",
        password: "atLeastGiveMeInterview",
        status: "OK",
        role:User.roleType.ADMINSTRATOR,
        isCoordinator: true,
        isActive: false,
        isOnline: false
    };

    DAO.addUser(user).then(function (user) {
      DAO.updateUser(user.id, {isCoordinator: false}).then(function (u) {
        fail();
        done();
      }, function (err) {
        expect(err).not.to.be.equal(null);
        done();
      });
    }, function(err) {
      expect(err).not.to.be.equal(null);
      done();
    });
  });

  test('Post last logout for user', function (done) {
    let user = {
        username: "hello",
        password: "world",
        status: "OK",
        role:User.roleType.CITIZEN,
        isCoordinator: false,
        isActive: false,
        isOnline: false
    };

    DAO.addUser(user)
    .then(function (user) {
      DAO.recordLogoutTime(user._id)
      .then(function (u) {
        expect(u.lastLogout).not.to.be.equal(null);
        done();
      })
    });
  });

  test('Get last logout for user', function (done) {
    let user = {
        username: "hello",
        password: "world",
        status: "OK",
        role:User.roleType.CITIZEN,
        isCoordinator: false,
        isActive: false,
        isOnline: false
    };

    DAO.addUser(user)
    .then(function (user) {
      DAO.recordLogoutTime(user._id)
      .then(function (u) {
        DAO.getLastLogoutForUser(user._id)
        .then( function (uL) {
          expect(uL.lastLogout).to.be.eql(u.lastLogout);
          done();
        });
      })
    });
  });

  test('Get location for user', function(done) {
    let user = {
      username: "obov",
      password: "1234",
      register: "true",
      status: "OK",
      role:'Citizen',
      isActive: false,
      isOnline: false
    };
    let location = { latitude: "23.4444", longitude: "-120.3333" };
    DAO.addUser(user).then(function(u) {
      let uid = u._id;
      let loc = LocationDAO.createNewLocation(location);
      DAO.updateUser({_id: uid}, {location: loc})
      .then(function(result) {
        expect(result.ok).to.equal(1);
        return DAO.getLastLocationById({_id: uid});
      }).then(function(uL) {
        expect(uL.location.coordinates[1]).to.equal(parseFloat(location.latitude));
        expect(uL.location.coordinates[0]).to.equal(parseFloat(location.longitude));
        done();
      });
    }, function(err) {
      fail(err);
    });
  });

  suiteTeardown(db.teardown);
});
