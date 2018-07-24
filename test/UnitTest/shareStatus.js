let expect = require('expect.js');

process.env.NODE_ENV = "test";
let db = require('../../util/mockDB');

let UserDAO = require('../../util/dao/userDAO').UserDAO;
let StatusDAO = require('../../util/dao/statusDAO').StatusDAO;

suite('Share Status Unit Test', function() {
  suiteSetup(function (done) {
    db.setup(function () {
      done();
    })
  })
  
  test('Change status', function(done) {
    let user = {
      username: "test123",
      password: "1234",
      register: "true",
      status: "OK",
      role:'Citizen',
      isActive: false,
      isOnline: false
    };
    let statusData = {
      status: "OK",
    };
    UserDAO.addUser(user).then(function(user) {
      statusData['userID'] = user._id;
      var status = StatusDAO.createNewStatus(statusData);
      UserDAO.updateUser({ _id: statusData.userID}, {status: status})
      .then(function(result) {
        expect(result.ok).to.equal(1);
        return UserDAO.findUser({
          _id: statusData.userID
        });
      })
      .then(function(update_user) {
        expect(update_user.username).to.equal(user.username);
        expect(update_user.status.status).to.equal("OK");
        done();
      });
    }, function(err) {
      fail(err);
    });
  });

  test('Fail to change status by missing status infomation', function(done) {
    let user = {
      username: "obov",
      password: "1234",
      register: "true",
      status: "OK",
      role:'Citizen',
      isActive: false,
      isOnline: false
    };
    let statusData = {};
    UserDAO.addUser(user).then(function(user) {
      statusData['userID'] = user._id;
      var status = StatusDAO.createNewStatus(statusData);
      expect(status.status).to.equal(undefined);
      done();
    });
  });
  
  suiteTeardown(db.teardown);
});
