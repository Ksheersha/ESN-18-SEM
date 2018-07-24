let expect = require('expect.js');

process.env.NODE_ENV = "test";
let db = require('../../util/mockDB');

let UserDAO = require('../../util/dao/userDAO').UserDAO;
let MessageDAO = require('../../util/dao/messageDAO').MessageDAO;
let LocationDAO = require('../../util/dao/locationDAO').LocationDAO;

suite('Map Info Unit Test', function() {
  suiteSetup(function (done) {
    db.setup(function () {
      done();
    })
  })
  
  test('Update location', function(done) {
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
    UserDAO.addUser(user).then(function(u) {
      let uid = u._id;
      let loc = LocationDAO.createNewLocation(location);
      UserDAO.updateUser({
        _id: uid
      }, {
        location: loc
      }).then(function(result) {
        expect(result.ok).to.equal(1);
        return UserDAO.findUser({
          _id: uid
        });
      }).then(function(update_user) {
        expect(update_user.username).to.equal(user.username);
        expect(update_user.location.coordinates[1]).to.equal(parseFloat(location.latitude));
        expect(update_user.location.coordinates[0]).to.equal(parseFloat(location.longitude));
        done();
      });
    }, function(err) {
      fail(err);
    });
  });

  test('Update phone number', function(done) {
    let user = {
      username: "test123",
      password: "1234",
      register: "true",
      status: "OK",
      role:'Citizen',
      isActive: false,
      isOnline: false
    };
    let phone = "123 456 7890";
    UserDAO.addUser(user).then(function(u) {
      let uid = u._id;
      UserDAO.updateUser({
        _id: uid
      }, {
        phoneNumber: phone
      }).then(function(result) {
        expect(result.ok).to.equal(1);
        return UserDAO.findUser({
          _id: uid
        });
      }).then(function(update_user) {
        expect(update_user.username).to.equal(user.username);
        expect(update_user.phoneNumber).to.equal(phone);
        done();
      });
    }, function(err) {
      fail(err);
    });
  });

  test('Get latest public message', function(done) {
    let user = {
      username: "kobebryant",
      password: "0824",
      register: "true",
      status: "OK",
      role:'Citizen',
      isActive: false,
      isOnline: false

    };
    let message1 = {
      username: "kobebryant", content: "Give me the god damn ball!!", status: "EMERGENCY"
    }
    let message2 = {
      username: "kobebryant", content: "Mamba Out", status: "EMERGENCY"
    }
    UserDAO.addUser(user).then(function(u) {
      message1['uid'] = u._id;
      message2['uid'] = u._id;
      MessageDAO.addMessage(message1).then(function(msg1) {
        MessageDAO.addMessage(message2).then(function(msg2) {
          MessageDAO.getLatestMessage(function(err, result){
            expect(err).to.equal(null);
            let msg = null;
            for (let i in result){
              if (result[i]._id === String(u._id)){
                msg = result[i];
                break;
              }
            }
            expect(msg.content).to.equal(message2.content);
            done();
          });
        });
      });
    });
  });

  suiteTeardown(db.teardown);
});
