let expect = require('expect.js');
let agent = require('superagent');

let PORT = 3000;
let HOST = 'http://localhost:' + PORT;

process.env.NODE_ENV = "test";
// Initiate Server
let www = require('../../bin/www');
let db = require('../../util/mockDB');

let user = {
  userName: "test",
  passWord: "test",
  register: "true",
  role: 'Citizen',
  isActive: true,
  isOnline: false
};

let group = {
  "name": "testGroup",
  "description": "this is a group",
  "participants": JSON.stringify([])
};

let id;
let groupId;

suite('Group Message API',function () {
  suiteSetup(function(done) {
    db.setup(function() {
      // add one user and get the id
      agent.post(HOST + '/users')
        .send(user)
        .end(function(err, res) {
          agent.get(HOST + '/users/username/' + user.userName)
            .send()
            .end(function(err, res) {
              id = res.body.id;
              group['owner'] = res.body.id;
              done();
            });
        });
    });
  });

  test('Send text message to group and retrieve', function(done) {
    let senderId = "123"
    let data = {
      uid: id, // receiver
      sendUid: senderId,
      username: "rkzai",
      content: "Tested tested",
      status: "OK",
    }

    agent.post(HOST + '/group/create/' + id)
      .send(group)
      .end(function(err, res) {
        groupId = res.body;
        data.uid = groupId;
        agent.post(HOST + '/messages/group')
          .send(data)
          .end(function(err, res) {
            expect(err).to.be.equal(null);
            expect(res.statusCode).not.to.be.equal(500);
            expect(res.statusCode).to.be.equal(201);
            // test the get method
            agent.get(HOST + '/messages/group/' + groupId)
              .send()
              .end(function(err, res) {

                let messages = res.body;
                expect(messages).to.be.an('array');

                // if there will be existed message in the list
                let msg = messages.find((m) => (m.uid === senderId &&
                  m.to === groupId && m.content === data.content) &&
                  m.status === data.status && m.username === data.username);

                expect(err).to.be.equal(null);
                expect(res.statusCode).not.to.be.equal(404);
                expect(msg).to.not.be.equal(undefined);
                done();
              });
          });
      });
  });

  test('Send image message to group and retrieve', function(done) {
    let senderId = "123"
    let data = {
      uid: id, // receiver
      sendUid: senderId,
      username: "rkzai",
      content: "dummy image",
      status: "OK",
    }


    agent.post(HOST + '/group/create/' + id)
      .send(group)
      .end(function(err, res) {
        groupId = res.body;
        data.uid = groupId;
        agent.post(HOST + '/messages/group/image')
          .send(data)
          .end(function(err, res) {
            expect(err).to.be.equal(null);
            expect(res.statusCode).not.to.be.equal(404);
            expect(res.statusCode).to.be.equal(201);

            // test the get method
            agent.get(HOST + '/messages/group/' + groupId)
              .send()
              .end(function(err, res) {

                let messages = res.body;
                expect(messages).to.be.an('array');

                // if there will be existed message in the list
                let msg = messages.find((m) => (m.uid === senderId &&
                  m.to === groupId) && m.status === data.status && m.username === data.username);

                expect(err).to.be.equal(null);
                expect(res.statusCode).not.to.be.equal(404);
                expect(msg).to.not.be.equal(undefined);
                done();
              });
          });
      });
  });



  suiteTeardown(db.teardown);
});
