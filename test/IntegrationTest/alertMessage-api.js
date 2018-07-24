let expect = require('expect.js');
let agent = require('superagent');

let PORT = 3000;
let HOST = 'http://localhost:' + PORT;

process.env.NODE_ENV = "test";
// Initiate Server
let www = require('../../bin/www');
let db = require('../../util/mockDB');

let owner = {
  userName: "FireChief",
  passWord: "test",
  register: "true",
  role: 'FireChief',
  isActive: true,
  isOnline: false
};

let participant = {
  userName: 'Firefighter',
  passWord: "test",
  register: "true",
  role: 'Firefighter',
  isActive: true,
  isOnline: false
};

let group = {
  "name": "incident",
  "description": "this is a group",
  "participants": []
};

let ownerId, participantId, groupId;

let non_exist_id = 'ffffffffffffffffffffffff';


suite('Alert Message API', function() {

  // Setup a group
  suiteSetup(function(done) {
    db.setup(function() {
      // add one user and get the id
      agent.post(HOST + '/users')
        .send(owner)
        .end(function(err, res) {
          agent.get(HOST + '/users/username/' + owner.userName)
            .end(function(err, res) {
              ownerId = res.body.id;
              agent.post(HOST + '/users/id/' + ownerId)
                .send(owner)
                .end(function (err,res) {
                  agent.post(HOST + '/users')
                    .send(participant)
                    .end(function(err, res) {
                      agent.get(HOST + '/users/username/' + participant.userName)
                        .end(function(err, res) {
                          participantId = res.body.id;
                          agent.post(HOST +'/users/id/' + participantId)
                            .send(participant)
                            .end(function (err,res) {
                              done();
                            });
                        });
                    });
                });
            });
        });
    });
  });


  test('Send alert message to the group', function(done) {
    agent.post(HOST + '/group/create/' + ownerId)
      .send(group)
      .end(function(err, res) {
        groupId = res.body;
        agent.get(HOST + '/group/list/' + ownerId)
          .end(function(err, res) {
            expect(err).to.be.equal(null);
            expect(res.statusCode).to.be.equal(200);
            groupData = res.body;
            expect(groupData).to.have.property('ownedGroups');
            expect(groupData.ownedGroups).to.have.length(1);
            let alertMessage = {
              sendId: ownerId,
              groupId: groupId,
              content: "dummy alert"
            };
            agent.post(HOST + '/alert')
              .send(alertMessage)
              .end(function (err,res) {
                let alertData = res.body;
                expect(res.statusCode).to.be.equal(200);
                expect(alertData.sendId).to.be.equal(alertMessage.sendId);
                expect(alertData.groupId).to.be.equal(alertMessage.groupId);
                expect(alertData.content).to.be.equal(alertMessage.content);
                expect(alertData.recipients).to.have.length(0);
                agent.delete(HOST + '/group/delete/' + groupId)
                  .end(function(err, res) {
                    done();
                  });
              });
          });
      });
  });

  test('Send alert message to the group with wrong group id', function(done) {
    agent.post(HOST + '/group/create/' + ownerId)
      .send(group)
      .end(function(err, res) {
        groupId = res.body;
        agent.get(HOST + '/group/list/' + ownerId)
          .end(function(err, res) {
            expect(err).to.be.equal(null);
            expect(res.statusCode).to.be.equal(200);
            groupData = res.body;
            expect(groupData).to.have.property('ownedGroups');
            expect(groupData.ownedGroups).to.have.length(1);
            let alertMessage = {
            };
            agent.post(HOST + '/alert')
              .send(alertMessage)
              .end(function (err,res) {
                let alertData = res.body;
                expect(res.statusCode).to.be.equal(500);
                agent.delete(HOST + '/group/delete/' + groupId)
                  .end(function(err, res) {
                    done();
                  });
              });
          });
      });
  });

  test('Get alert message with message id', function(done) {
    agent.post(HOST + '/group/create/' + ownerId)
      .send(group)
      .end(function(err, res) {
        groupId = res.body;
        agent.get(HOST + '/group/list/' + ownerId)
          .end(function(err, res) {
            expect(err).to.be.equal(null);
            expect(res.statusCode).to.be.equal(200);
            groupData = res.body;
            expect(groupData).to.have.property('ownedGroups');
            expect(groupData.ownedGroups).to.have.length(1);
            let alertMessage = {
              sendId: ownerId,
              groupId: groupId,
              content: "dummy alert"
            };
            agent.post(HOST + '/alert')
              .send(alertMessage)
              .end(function (err,res) {
                expect(res.statusCode).to.be.equal(200);
                let alertMessageId = res.body._id;
                agent.get(HOST + '/alert/' + alertMessageId)
                  .end(function (err,res) {
                    let alertData = res.body;
                    expect(res.statusCode).to.be.equal(200);
                    expect(alertData.sendId).to.be.equal(alertMessage.sendId);
                    expect(alertData.groupId).to.be.equal(alertMessage.groupId);
                    expect(alertData.content).to.be.equal(alertMessage.content);
                    expect(alertData.recipients).to.have.length(0);
                    agent.delete(HOST + '/group/delete/' + groupId)
                      .end(function(err, res) {
                        done();
                      });
                  });
              });
          });
      });
  });


  test('Update alert message with message id', function(done) {
    group["participants"] = [participantId];
    agent.post(HOST + '/group/create/' + ownerId)
      .send(group)
      .end(function(err, res) {
        groupId = res.body;
        let alertMessage = {
          sendId: ownerId,
          groupId: groupId,
          content: "dummy alert"
        };
        agent.post(HOST + '/alert')
          .send(alertMessage)
          .end(function (err,res) {
            expect(res.statusCode).to.be.equal(200);
            let alertMessageId = res.body._id;
            agent.get(HOST + '/alert/' + alertMessageId)
              .end(function (err,res) {
                let alertData = res.body;
                expect(res.statusCode).to.be.equal(200);
                expect(alertData.recipients).to.have.length(1);
                let data = {
                  alertId: alertData._id,
                  userId: participantId
                };
                agent.post(HOST + '/alert/list/')
                  .send(data)
                  .end(function (err,res) {
                    let alertData = res.body;
                    expect(res.statusCode).to.be.equal(200);
                    agent.delete(HOST + '/group/delete/' + groupId)
                      .end(function(err, res) {
                        group.participants.pop();
                        done();
                      });
                  });
              });
          });
      });
  });

  suiteTeardown(db.teardown);
});
