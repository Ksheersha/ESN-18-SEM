let expect = require('expect.js');

process.env.NODE_ENV = "test";
let db = require('../../util/mockDB');

let UserDAO = require('../../util/dao/userDAO').UserDAO;
let GroupDAO = require('../../util/dao/groupDAO');
let AlertDAO = require('../../util/dao/alertDAO');
let dbUtil = require('../../util/dbUtil');
let User = dbUtil.getModel('User');
let Group = dbUtil.getModel('Group');
let Alert = dbUtil.getModel('Alert');

let fireChief = {
  username: "Superman",
  password: "kent",
  register: "true",
  status: "OK",
  role: 'FireChief',
  isActive: false,
  isOnline: false
};

let fireman = {
  username: "Batman",
  password: "wayne",
  register: "true",
  status: "OK",
  role: 'Firefighter',
  isActive: false,
  isOnline: false
};

let fireChiefId;
let firemanId;
let groupName = "fireAlert";
let groupDescription = "test fire group";
let groupId;
let AlertContent = "ALOHA";

suite('Send Alert Message Unit Test', function() {
  suiteSetup(function(done) {
    db.setup(function() {
      // Adding two user: one is fireChief the other is fireman
      UserDAO.addUser(fireChief)
        .then(function(fireChiefData) {
          fireChiefId = fireChiefData._id;
          UserDAO.addUser(fireman)
            .then(function (firemanData) {
              // Adding two character into one group
              firemanId = firemanData._id;
              let groupData = {
                "name" : groupName,
                "description" : groupDescription,
                "participants" : [firemanId],
                "owner" : fireChiefId
              };
              GroupDAO.addGroup(groupData)
                .then(function (group) {
                  groupId = group._id;
                  done();
                });
            })
        });
    });
  });

  test('Create Alert Message', function(done) {
    AlertDAO.createAlert(fireChiefId,groupId,AlertContent)
      .then(function (AlertMessage) {
        expect(AlertMessage).to.have.property('sendId');
        expect(AlertMessage.sendId).to.equal(fireChiefId);
        expect(AlertMessage).to.have.property('groupId');
        expect(AlertMessage.groupId).to.equal(groupId);
        expect(AlertMessage).to.have.property('content');
        expect(AlertMessage.content).to.equal(AlertContent);
        expect(AlertMessage).to.have.property('recipients');
        expect(AlertMessage.recipients).to.have.length(1);
        done();
      });
  });


  test('Get Alert Message By Id', function(done) {
    AlertDAO.createAlert(fireChiefId,groupId,AlertContent)
      .then(function (AlertMessage) {
        let alertMessageId = AlertMessage._id;
        AlertDAO.getAlertMessage(alertMessageId)
          .then(function (reAlertMessage) {
            expect(reAlertMessage.sendId.toString()).to.equal(fireChiefId.toString());
            expect(reAlertMessage.groupId.toString()).to.equal(groupId.toString());
            expect(reAlertMessage.content).to.equal(AlertContent);
            expect(reAlertMessage.recipients).to.have.length(1);
            done();
          })
      });
  });

  test('Update Alert Message', function(done) {
    AlertDAO.createAlert(fireChiefId,groupId,AlertContent)
      .then(function (AlertMessage) {
        let alertMessageId = AlertMessage._id;
        AlertDAO.updateAlertMessageList(firemanId,alertMessageId)
          .then(function (reAlertMessage) {
            expect(reAlertMessage.sendId.toString()).to.equal(fireChiefId.toString());
            expect(reAlertMessage.groupId.toString()).to.equal(groupId.toString());
            expect(reAlertMessage.content).to.equal(AlertContent);
            done();
          })
      });
  });



  suiteTeardown(db.teardown);
});
