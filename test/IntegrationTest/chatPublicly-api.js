let expect = require('expect.js');
let agent = require('superagent');

let PORT = 3000;
let HOST = 'http://localhost:' + PORT;

process.env.NODE_ENV = "test";
// Initiate Server
let www = require('../../bin/www');
let db = require('../../util/mockDB');
//let server = app.listen(PORT)

// Populate with a dummy message
suite('Chat Publicly API', function() {
  suiteSetup(function (done) {
    db.setup(function () {
      done();
    })
  })
  
  test('Add a new message', function(done) {
    // Dummy Message
    let message = {
      username: "JD", uid: "12345", content: "Hello World", status: "EMERGENCY"
    };
    agent.post(HOST + '/messages/public')
      .send(message)
      .end(function(err, res) {
        expect(err).to.be.equal(null);
        expect(res.statusCode).to.be.equal(200);
        agent.get(HOST + '/messages/public')
          .send()
          .end(function(err, res) {
            let messages = res.body;
            expect(messages).to.be.an('array');
            let msg = messages.find((m) => (m.username === message.username &&
              m.content === message.content && m.status === message.status));
            expect(msg).to.not.be.equal(undefined);
            done();
          });
      });
  });

  test('Fail to post a new message because missing content', function(done) {
    // Dummy Message
    let message = {
      username: "JD", uid: "12345", status: "EMERGENCY"
    };
    agent.post(HOST + '/messages/public')
      .send(message)
      .end(function(err, res) {
        expect(err).not.to.be.equal(null);
        expect(res.statusCode).to.be.equal(404);
        done();
      });
  });

  test('Get all messages from a specific user', function(done) {
    // Dummy Message
    let message = {
      username: "JD", uid: "12345", status: "EMERGENCY"
    };
    agent.get(HOST + '/messages/public/JD')
      .send()
      .end(function(err, res) {
        expect(err).to.be.equal(null);
        expect(res.statusCode).to.be.equal(200);
        let messages = res.body;
        expect(messages[0].content).to.be.equal("Hello World");
        done();
      });
  });

  test('Search for messages', function(done) {
    // Dummy Message
    let message = {
      username: "JD", uid: "12345", content: "Hello World", status: "EMERGENCY"
    };
    agent.get(HOST + '/messages/public?keywords=Hello')
      .send()
      .end(function(err, res) {
        let messages = res.body;
        expect(messages).to.be.an('array');
        let msg = messages.find((m) => (m.username === message.username &&
          m.content === message.content && m.status === message.status));
        expect(msg).to.not.be.equal(undefined);
        done();
      });
  });

  suiteTeardown(db.teardown);
});
