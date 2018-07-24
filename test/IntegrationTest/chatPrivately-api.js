let expect = require('expect.js');
let agent = require('superagent');

let PORT = 3000;
let HOST = 'http://localhost:' + PORT;

process.env.NODE_ENV = "test";
// Initiate Server
let www = require('../../bin/www');
let db = require('../../util/mockDB');

// Populate with a dummy message
suite('Chat Privately API', function() {
  suiteSetup(function (done) {
    db.setup(function () {
      done();
    })
  })

  test('Add a private message while two people online', function(done) {
    clients_list.push({'id':"321", "Socket":io});
    clients_list.push({'id':"123", "Socket":io});
    let receiverId = "321"
    let senderId = "123"
    let data = {
      uid: receiverId, // receiver
      sendUid: senderId,
      username: "rkzai",
      content: "Tested tested",
      status: "OK",
    }
    // test the post method
    agent.post(HOST + '/messages/private')
      .send(data)
      .end(function(err, res) {
        expect(err).to.be.equal(null);
        expect(res.statusCode).not.to.be.equal(404);
        expect(res.statusCode).to.be.equal(201);
        // test the get method
        agent.get(HOST + '/messages/private/' + receiverId + '/' + senderId)
          .send()
          .end(function(err, res) {
            let messages = res.body;
            expect(messages).to.be.an('array');

            // if there will be existed message in the list
            let msg = messages.find((m) => (m.uid === senderId &&
              m.to === receiverId && m.content === data.content) &&
              m.status === data.status && m.username === data.username);

            expect(err).to.be.equal(null);
            expect(res.statusCode).not.to.be.equal(500);
            expect(msg).to.not.be.equal(undefined);
            done();
          });
      });
  });

  test('Add a private message while receiver is offline', function(done) {
    clients_list = [];
    clients_list.push({'id':"123", "Socket":io});
    let receiverId = "321"
    let senderId = "123"
    // Dummy Message
    let data = {
      uid: receiverId, // receiver
      sendUid: senderId,
      username: "rkzai",
      content: "Tested tested",
      status: "OK",
    }
    // test the post method
    agent.post(HOST + '/messages/private')
      .send(data)
      .end(function(err, res) {
        expect(err).to.be.equal(null);
        expect(res.statusCode).not.to.be.equal(404);
        expect(res.statusCode).to.be.equal(201);
        // test the get method
        agent.get(HOST + '/messages/private/' + receiverId + '/' + senderId)
          .send()
          .end(function(err, res) {
            let messages = res.body;
            expect(messages).to.be.an('array');

            // if there will be existed message in the list
            let msg = messages.find((m) => (m.uid === senderId &&
              m.to === receiverId && m.content === data.content) &&
              m.status === data.status && m.username === data.username);

            expect(err).to.be.equal(null);
            expect(res.statusCode).not.to.be.equal(404);
            expect(msg).to.not.be.equal(undefined);
            done();
          });
      });
  });

  test('Receiver is offline and has unread messages', function(done) {
    clients_list = [];
    clients_list.push({'id':"123", "Socket":io});
    unread_list.push({'id':"321", "Socket":io});
    let receiverId = "321"
    let senderId = "123"
    // Dummy Message
    let data = {
      uid: receiverId, // receiver
      sendUid: senderId,
      username: "rkzai",
      content: "Tested tested",
      status: "OK",
    }
    // test the post method
    agent.post(HOST + '/messages/private')
      .send(data)
      .end(function(err, res) {
        expect(err).to.be.equal(null);
        expect(res.statusCode).not.to.be.equal(404);
        expect(res.statusCode).to.be.equal(201);
        // test the get method
        agent.get(HOST + '/messages/private/' + receiverId + '/' + senderId)
          .send()
          .end(function(err, res) {
            let messages = res.body;
            expect(messages).to.be.an('array');

            // if there will be existed message in the list
            let msg = messages.find((m) => (m.uid === senderId &&
              m.to === receiverId && m.content === data.content) &&
              m.status === data.status && m.username === data.username);

            expect(err).to.be.equal(null);
            expect(res.statusCode).not.to.be.equal(404);
            expect(msg).to.not.be.equal(undefined);
            done();
          });
      });
  });

  test('Fail to add private message by missing content', function(done) {
    let receiverId = "321"
    let senderId = "123"
    // Dummy Message
    let data = {
      uid: receiverId, // receiver
      sendUid: senderId,
      username: "rkzai",
      status: "OK",
    }
    // test the post method
    agent.post(HOST + '/messages/private')
      .send(data)
      .end(function(err, res) {
        expect(err).not.to.be.equal(null);
        expect(res.statusCode).to.be.equal(500);
        done();
      });
  });

  test('Search private message', function(done) {
    clients_list.push({'id':"321", "Socket":io});
    clients_list.push({'id':"123", "Socket":io});
    let receiverId = "321"
    let senderId = "123"
    // Dummy Message
    let data = {
      uid: receiverId, // receiver
      sendUid: senderId,
      username: "rkzai",
      content: "Tested tested",
      status: "OK",
    }
    agent.get(HOST + '/messages/private/' + receiverId + '/' + senderId+'?keywords=Tested')
      .send()
      .end(function(err, res) {
        let messages = res.body;
        expect(messages).to.be.an('array');

        // if there will be existed message in the list
        let msg = messages.find((m) => (m.uid === senderId &&
          m.to === receiverId && m.content === data.content) &&
          m.status === data.status && m.username === data.username);
        expect(err).to.be.equal(null);
        expect(res.statusCode).not.to.be.equal(404);
        expect(msg).to.not.be.equal(undefined);
        done();
      });
  });

  suiteTeardown(db.teardown);
});
