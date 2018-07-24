let expect = require('expect.js');

process.env.NODE_ENV = "test";
let db = require('../../util/mockDB');

let UserDAO = require('../../util/dao/userDAO').UserDAO;
let GroupDAO = require('../../util/dao/groupDAO');
let dbUtil = require('../../util/dbUtil');
let User = dbUtil.getModel('User');
let Group = dbUtil.getModel('Group');

let user = {
  username: "test123",
  password: "1234",
  register: "true",
  status: "OK",
  role: 'Citizen',
  isActive: false,
  isOnline: false
};

let id;

let group = {
  "name": "testGroup",
  "description": "this is a group",
  "participants": [],
  "owner": id
};

suite('Access Group Directory Unit Test', function() {
  suiteSetup(function(done) {
    db.setup(function() {
      // setting up mock database with test user
      UserDAO.addUser(user)
        .then(function(user) {
          id = user._id;
          done();
        });
    });
  });

  test('get groups information with zero groups', function(done) {
    GroupDAO.getAllGroupsByUserId(id)
      .then(function(groupData) {
        expect(groupData).to.have.property('ownedGroups');
        expect(groupData.ownedGroups).to.be.empty();
        expect(groupData).to.have.property('participantGroups');
        expect(groupData.participantGroups).to.be.empty();
        done();
      });
  });

  test('get group information with one owned group', function(done) {
    // setting up database: add one groups
    let group = {
      "name": "testGroup",
      "description": "this is a group",
      "participants": [],
      "owner": id
    };
    GroupDAO.addGroup(group).then(function(group) {
      GroupDAO.getAllGroupsByUserId(id)
        .then(function(groupData) {
          expect(groupData).to.have.property('ownedGroups');
          expect(groupData.ownedGroups).to.have.length(1);
          expect(groupData).to.have.property('participantGroups');
          expect(groupData.participantGroups).to.be.empty();
          done();
        });
    });
  });

  suiteTeardown(db.teardown);
});
