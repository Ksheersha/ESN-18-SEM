let expect = require('expect.js');
let agent = require('superagent');

let PORT = 3000;
let HOST = 'http://localhost:' + PORT;

process.env.NODE_ENV = "test";
// Initiate Server
let www = require('../../bin/www');
let db = require('../../util/mockDB');
//let server = app.listen(PORT)

let user1 = {
  userName: "bobo",
  passWord: "6666",
  register: "true"
};

let user2 = {
  userName: "shee",
  passWord: "shee",
  register: "true"
};

let user3 = {
  userName: "xxxe",
  passWord: "xxxx",
  register: "true"
}

suite('Share Supply API', function() {
  suiteSetup(function (done) {
    db.setup(function () {
      done();
    })
  })
  
  test('Add Supply', function(done) {
    // Register a new user
    agent.post(HOST + '/users')
      .send(user1)
      .end(function(err, res) {
        // Get user id
        agent.get(HOST + '/users')
          .send()
          .end(function(err, user) {
            let id = user.body[0]._id;
            let supply = {
              name: "supplyTest",
              quantity: "1",
              location: "CMU SV",
              description: "haha",
              ownerId: id
            };
            // add supply
            agent.post(HOST + '/supply')
              .send(supply)
              .end(function(err, res) {
                expect(err).to.be.equal(null);
                expect(res.statusCode).to.be.equal(200);
                // Get supply
                agent.get(HOST + '/supply')
                  .send()
                  .end(function(err, res) {
                    let supplyName = res.body[0].name;
                    // Check status is Help
                    expect(err).to.be.equal(null);
                    expect(supplyName).to.be.equal(supply.name);
                    done();
                  });
              });
          });
      });
  });

  test('Fail to Request a supply of his own', function(done) {
    // Register user
    agent.get(HOST + '/users')
      .send()
      .end(function(err, user) {
        // Get user id
        let requesterId = user.body[0]._id;
        // get supplyId
        agent.get(HOST + '/supply')
          .send()
          .end(function(err, supply) {
            let supplyId = supply.body[0]._id;
            let data = {
              supplyId: supplyId,
              requesterId: requesterId
            };
            agent.post(HOST + '/supply/request')
              .send(data)
              .end(function(err, res) {
                expect(res.statusCode).to.be.equal(401);
                done();
              });
          });
      });
  });

  test('Request supply', function(done) {
    // Register a new user
    agent.post(HOST + '/users')
      .send(user2)
      .end(function(err, res) {
        // Get user id
        agent.get(HOST + '/users')
          .send()
          .end(function (err, user) {
            let requesterId = user.body[1]._id;
            // get supplyId
            agent.get(HOST + '/supply')
              .send()
              .end(function (err, supply) {
                let supplyId = supply.body[0]._id;
                let data = {
                  supplyId: supplyId,
                  requesterId: requesterId
                }
                // request supply
                agent.post(HOST + '/supply/request')
                  .send(data)
                  .end(function (err, res) {
                    expect(res.statusCode).to.be.equal(200);
                    done();
                  });
              });
          });
      });
  });

  test('Fail to Request a supply that is occupied by others', function(done) {
    // Register user
    agent.post(HOST + '/users')
      .send(user3)
      .end(function(err, res) {
        // Get user id
        // Get user id
        agent.get(HOST + '/users')
          .send()
          .end(function (err, user) {
            let requesterId = user.body[2]._id;
            // get supplyId
            agent.get(HOST + '/supply')
              .send()
              .end(function (err, supply) {
                let supplyId = supply.body[0]._id;
                let data = {
                  supplyId: supplyId,
                  requesterId: requesterId
                };
                agent.post(HOST + '/supply/request')
                  .send(data)
                  .end(function (err, res) {
                    expect(res.statusCode).to.be.equal(400);
                    done();
                  });
              });
          });
      });
  });

  test('Get supply by id', function(done) {
    agent.get(HOST + '/supply')
      .send()
      .end(function (err, supply) {
        let supplyId = supply.body[0]._id;
        let supplyName = supply.body[0].name;
        let supplyOwnerId = supply.body[0].ownerId;
        let supplyLocation = supply.body[0].location;
        let supplyDescription = supply.body[0].description;
        agent.get(HOST + '/supply/' + supplyId)
          .send()
          .end(function (err, res) {
            expect(err).to.be.equal(null);
            expect(res.statusCode).to.be.equal(200);
            expect(res.body._id).to.be.equal(supplyId);
            expect(res.body.name).to.be.equal(supplyName);
            expect(res.body.ownerId).to.be.equal(supplyOwnerId);
            expect(res.body.location).to.be.equal(supplyLocation);
            expect(res.body.description).to.be.equal(supplyDescription);
            done();
          });
      });
  });

  test('Fail to Get supply by a non-exist id', function(done) {
    agent.get(HOST + '/supply/444444444444444444444444')
      .send()
      .end(function (err, res) {
        // console.log(res);
        expect(res.statusCode).to.be.equal(404);
        done();
      });
  });

  test('Delete supply fail by deleting someone else\'s supply', function(done) {
    // Register a new user
    agent.get(HOST + '/users')
      .send()
      .end(function(err, user) {
        // Get user id
        let wrongOwnerId = user.body[1]._id;
          // get supplyId
          agent.get(HOST + '/supply')
            .send()
            .end(function (err, supply) {
              let supplyId = supply.body[0]._id;
              let data = {
                supplyId: supplyId,
                ownerId: wrongOwnerId
              }
              // request supply
              agent.post(HOST + '/supply/delete')
                .send(data)
                .end(function (err, res) {
                  expect(res.statusCode).to.be.equal(401);
                  done();
                });
            });
      });
    });
  
  test('Delete supply successfully', function(done) {
    agent.get(HOST + '/users')
      .send()
      .end(function(err, res) {
        // Get user id
        agent.get(HOST + '/users')
          .send()
          .end(function (err, user) {
            let ownerId = user.body[0]._id;
            // get supplyId
            agent.get(HOST + '/supply')
              .send()
              .end(function (err, supply) {
                let supplyId = supply.body[0]._id;
                let data = {
                  supplyId: supplyId,
                  ownerId: ownerId
                }
                // request supply
                agent.post(HOST + '/supply/delete')
                  .send(data)
                  .end(function (err, res) {
                    expect(res.statusCode).to.be.equal(200);
                    done();
                  });
              });
          });
      });
  });

  test('Delete supply fail with non-existing id', function(done) {
    // Register a new user
    agent.get(HOST + '/users')
      .send()
      .end(function(err, user) {
        // Get user id
        let userId = user.body[1]._id;
        let wrongSupplyId = userId;
          let data = {
            supplyId: wrongSupplyId,
            ownerId: userId
          }
          // request supply
          agent.post(HOST + '/supply/delete')
            .send(data)
            .end(function (err, res) {
              expect(res.statusCode).to.be.equal(404);
              done();
            });
      });
  });

  suiteTeardown(db.teardown);
});
