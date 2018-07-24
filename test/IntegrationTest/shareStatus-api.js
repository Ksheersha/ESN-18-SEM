let expect = require('expect.js');
let agent = require('superagent');

let PORT = 3000;
let HOST = 'http://localhost:' + PORT;

process.env.NODE_ENV = "test";
// Initiate Server
let www = require('../../bin/www');
let db = require('../../util/mockDB');
//let server = app.listen(PORT)

let user = {
  userName: "jiandej",
  passWord: "1234",
  register: "true"
};

suite('Share Status API', function() {
  suiteSetup(function (done) {
    db.setup(function () {
      done();
    })
  })
  
  test('Change Status', function(done) {
    let status = { status: "Help"};
    // Register a new user
    agent.post(HOST + '/users')
      .send(user)
      .end(function(err, res) {
        // Get user id
        agent.get(HOST + '/users')
          .send()
          .end(function(err, user) {;
            let id = user.body[0]._id;
            // Update status
            agent.post(HOST + '/users/status/id/' + id)
              .send(status)
              .end(function(err, res) {
                console.log(err);
                expect(err).to.be.equal(null);
                expect(res.statusCode).to.be.equal(200);
                // Get user to check new status
                agent.get(HOST + '/users')
                  .send()
                  .end(function(err, res) {
                    let help = res.body[0].status.status;
                    // Check status is Help
                    expect(help).to.be.equal(status.status);
                    done();
                  });
              });
          });
      });
  });

  test('Change status fails when missing status information', function(done) {
    let status = {};
    // Get user id
    agent.get(HOST + '/users')
      .send()
      .end(function(err, user) {
        let id = user.body[0]._id;
        // Update status
        agent.post(HOST + '/users/status/id/' + id)
          .send(status)
          .end(function(err, res) {
            expect(err).not.to.be.equal(null);
            expect(res.statusCode).to.be.equal(500);
            done();
          });
      });
  });

  test('Change status fails when giving not exist id', function(done) {
    let status = { status: "Help"};
    // Get user id
    agent.get(HOST + '/users')
      .send()
      .end(function(err, user) {
        let id = "itwrongid";
        // Update status
        agent.post(HOST + '/users/status/id/' + id)
          .send(status)
          .end(function(err, res) {
            expect(err).not.to.be.equal(null);
            expect(res.statusCode).to.be.equal(500);
            done();
          });
      });
  });
  
  suiteTeardown(db.teardown);
});
