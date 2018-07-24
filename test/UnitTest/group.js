let expect = require('expect.js');

process.env.NODE_ENV = 'test';

let db = require('../../util/mockDB');
let dbUtil = require('../../util/dbUtil');
let Group = dbUtil.getModel('Group');

let GroupDAO = require('../../util/dao/groupDAO');
let groupId;

suite('Group Unit Tests', function () {
  suiteSetup(function (done) {
    db.setup(function () {
      done();
    });
  });

  test('Create group', function (done) {
    let groupData = {
      name: 'sample',
      description: 'sample description',
    };

    GroupDAO.addGroup(groupData)
      .then(function (group) {
        groupId = group._id;
        expect(group.name).to.be.equal('sample');
        expect(group.description).to.be.equal('sample description');
        done();
      });
  });

  test('Check group name based on groupId', function (done) {
    GroupDAO.getGroupName(groupId)
      .then(function (name) {
        expect(name).to.be.equal('sample');
        done();
      });
  });

  suiteTeardown(db.teardown);
});
