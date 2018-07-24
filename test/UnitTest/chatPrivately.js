let expect = require('expect.js');

process.env.NODE_ENV = "test";
let db = require('../../util/mockDB');

let DAO = require('../../util/dao/messageDAO').MessageDAO;

suite('Chat Privately Unit Test', function() {
  suiteSetup(function (done) {
    db.setup(function () {
      done();
    })
  })
  
  test('Add a new private message', function(done) {
    let message = {
      username: "JianDeJiang",
      uid: "123456",
      content: "Give me a internship God!!!!!!!!!!!!",
      status: "EMERGENCY"
    };
    let targetId = "4567"
    DAO.addPrivateMessage(targetId, message, function(err, msg) {
      expect(err).to.be.equal(null);
      expect(msg.username).to.equal('JianDeJiang');
      expect(msg.uid).to.equal('123456');
      expect(msg.content).to.equal('Give me a internship God!!!!!!!!!!!!');
      expect(msg.status).to.equal('EMERGENCY');
      done();
    });
  });

  test('Fail to add new private message by missing content', function(done) {
    let message = {
      username: "JianDeJiang",
      uid: "123456",
      status: "EMERGENCY"
    };
    let targetId = "4567"
    DAO.addPrivateMessage(targetId, message, function(err, msg){
      expect(err).not.to.be.equal(null);
      done();
    });
  });

  test('Fail to add new message by missing username', function(done) {
    let message = {
      uid: "123456",
      content: "Give me a internship God!!!!!!!!!!!!",
      status: "EMERGENCY"
    };
    let targetId = "4567"
    DAO.addPrivateMessage(targetId, message, function(err, msg){
      expect(err).not.to.be.equal(null);
      done();
    });
  });

  test('Fail to add new message by missing status', function(done) {
    let message = {
      username: "JianDeJiang",
      uid: "123456",
      content: "Give me a internship God!!!!!!!!!!!!"
    };
    let targetId = "4567"
    DAO.addPrivateMessage(targetId, message, function(err, msg){
      expect(err).not.to.be.equal(null);
      done();
    });
  });

  test('Get all private messages', function(done) {
    let message = {
      username: "JianDeJiang",
      uid: "246",
      content: "Do not give me rejection plz",
      status: "EMERGENCY"
    };
    let targetId = "135"

    DAO.addPrivateMessage(targetId, message, function(err, msg) {
      let condition = {
        "$or": [
          {"$and":[{"uid": message.uid},{"to": targetId}]},
          {"$and":[{"uid": targetId},{"to": message.uid}]}
        ]
      };

      DAO.getPrivateMessage(condition, {timestamp: 1}, function(err, msgs) {
        expect(err).to.be.equal(null);
        expect(msgs[0].username).to.equal('JianDeJiang');
        expect(msgs[0].content).to.equal('Do not give me rejection plz');
        expect(msgs[0].status).to.equal('EMERGENCY');
        done();
      });
    });
  });

  suiteTeardown(db.teardown);
});
