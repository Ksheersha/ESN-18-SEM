let expect = require('expect.js');

process.env.NODE_ENV = "test";
let db = require('../../util/mockDB');

let DAO = require('../../util/dao/messageDAO').MessageDAO;

suite('Chat Publicly Unit Test', function() {
  suiteSetup(function (done) {
    db.setup(function () {
      done();
    })
  })
  
  test('Add a new message', function(done) {
    let message = {
      username: "JD",
      uid: "12345",
      content: "Hello World",
      status: "EMERGENCY"
    };
    DAO.addMessage(message).then(function(msg) {
      expect(msg.username).to.equal('JD');
      expect(msg.uid).to.equal('12345');
      expect(msg.content).to.equal('Hello World');
      expect(msg.status).to.equal('EMERGENCY');
      done();
    }, function(err) {
      fail(err);
    });
  });

  test('Fail to add new message by missing content', function(done) {
    let message = {
      username: "JD",
      uid: "12345",
      status: "EMERGENCY"
    };
    DAO.addMessage(message)
    .then(function(msg) {
      fail();
    }, function(err) {
      expect(err).not.to.be.equal(null);
      done();
    });
  });

  test('Fail to add new message by missing username', function(done) {
    let message = {
      uid: "12345",
      content: "Hello World",
      status: "EMERGENCY"
    };
    DAO.addMessage(message)
    .then(function(msg) {
      fail();
    }, function(err) {
      expect(err).not.to.be.equal(null);
      done();
    });
  });

  test('Fail to add new message by missing status', function(done) {
    let message = {
      username: "JD",
      uid: "12345",
      content: "Hello World"
    };
    DAO.addMessage(message)
    .then(function(msg) {
      fail();
    }, function(err) {
      expect(err).not.to.be.equal(null);
      done();
    });
  });

  test('Get all messages', function(done) {
    let msg2 = {
      username: "RK",
      uid: "45678",
      content: "Hi",
      status: "OK"
    };

    DAO.addMessage(msg2).then(function(msg) {
      let project = {
        uid: 1,
        username: 1,
        content: 1,
        status: 1,
        timestamp: 1
      };

      DAO.getMessages({
        to: ""
      }, project, {
        timestamp: 1
      }, function(err, msgs) {
        expect(err).to.be.equal(null);
        expect(msgs[msgs.length-1].username).to.equal('RK');
        expect(msgs[msgs.length-1].content).to.equal('Hi');
        done();
      });
    });
  });

  suiteTeardown(db.teardown);
});
