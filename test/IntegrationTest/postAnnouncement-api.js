let expect = require('expect.js');
let agent = require('superagent');

let PORT = 3000;
let HOST = 'http://localhost:' + PORT;

process.env.NODE_ENV = "test";
// Initiate Server
let www = require('../../bin/www');
let db = require('../../util/mockDB');
//let server = app.listen(PORT)

suite('Announcement API', function(){
  suiteSetup(function (done) {
    db.setup(function () {
      done();
    })
  })

  test('Add a new announcement', function(done) {
    let user = {
      userName: "yangyue",
      passWord: "1234567",
      register: "true"
    };
    // Dummy Announcement
    let announcement = {
      userName: "esnadmin",
      content: "Hello World",
      status: "EMERGENCY"
    };

    // Register a new user
    agent.post(HOST+'/users')
    .send(user)
    .end(function(err, res){
      agent.get(HOST+'/users')
      .send()
      .end(function (err1, res1) {
        agent.post(HOST+'/announcements/public')
        .send(announcement)
        .end(function(err2, res2){
          expect(err2).to.be.equal(null);
          expect(res2.statusCode).to.be.equal(200);
          done();
        });
      });
    });
  });

  test('Fail to add a new announcement by missing content', function(done) {
    let user = {
      userName: "yangyue",
      passWord: "1234567",
      register: "true"
    };
    // Dummy Announcement
    let announcement = {
      userName: "esnadmin",
      status: "EMERGENCY"
    };

    // Register a new user
    agent.post(HOST+'/users')
    .send(user)
    .end(function(err, res){
      agent.get(HOST+'/users')
      .send()
      .end(function (err1, res1) {
        agent.post(HOST+'/announcements/public')
        .send(announcement)
        .end(function(err, res){
          expect(err).not.to.be.equal(null);
          expect(res.statusCode).to.be.equal(500);
          done();
        });
      });
    });
  });

  test('Fail to add a new announcement by user who does not exist', function(done) {
    // Dummy Announcement
    let announcement = {
      userName: "esnadmin",
      status: "EMERGENCY"
    };

    agent.post(HOST+'/announcements/public')
    .send(announcement)
    .end(function(err, res){
      expect(err).not.to.be.equal(null);
      expect(res.statusCode).to.be.equal(500);
      done();
    });
  });

  test('Fail to add a new announcement by user who does not have Coordinator permission', function(done) {
    let user = {
      userName: "yangyue",
      passWord: "1234567",
      register: "true"
    };
    // Dummy Announcement
    let announcement = {
      userName: "yangyue",
      content: "Hello World",
      status: "EMERGENCY"
    };

    // Register a new user
    agent.post(HOST+'/users')
    .send(user)
    .end(function(err, res){
      agent.get(HOST+'/users')
      .send()
      .end(function (err1, res1) {
        agent.post(HOST+'/announcements/public')
        .send(announcement)
        .end(function(err2, res2){
          expect(res2.statusCode).to.be.equal(405);
          done();
        });
      });
    });
  });

  test('Search for announcement', function(done) {
    let user = {
      userName: "yangyue",
      passWord: "1234567",
      register: "true"
    };
    // Dummy Announcement
    let announcement = {
      userName: "esnadmin",
      content: "Hello World",
      status: "EMERGENCY"
    };

    // Register a new user
    agent.post(HOST+'/users')
    .send(user)
    .end(function(err, res){
      agent.get(HOST+'/users')
      .send()
      .end(function (err1, res1) {
        agent.post(HOST+'/announcements/public')
        .send(announcement)
        .end(function(err2, res2){
          agent.get(HOST+'/announcements/public?keywords=Hello')
          .send()
          .end(function(err3, res3){
            let announcements = res3.body;
            expect(announcements).to.be.an('array');
            let announce = announcements.find((m) => (m.username == announcement.userName &&
          m.content == announcement.content && m.status == announcement.status));
            expect(announce).to.not.be.equal(undefined);
            done();
          });
        });
      });
    });
  });

  suiteTeardown(db.teardown);
});
