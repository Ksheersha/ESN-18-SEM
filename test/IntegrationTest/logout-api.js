let expect = require('expect.js');
let HTTPStatus = require('http-status');
let _expect = require('chai').expect;
let agent = require('superagent');

let PORT = 3000;
let HOST = 'http://localhost:' + PORT;

process.env.NODE_ENV = "test";
// Initiate Server
let www = require('../../bin/www');
let db = require('../../util/mockDB');

let UserDAO = require('../../util/dao/userDAO').UserDAO;

let policeChief = {
  username: "policeChief",
  password: "test",
  status: 'OK',
  role: 'PoliceChief',
};
let fireChief = {
  username: "fireChief",
  password: "test",
  status: 'OK',
  role: 'FireChief',
};

let patrolOfficer = {
  username: "patrolOfficer",
  password: "test",
  status: 'OK',
  role: 'PatrolOfficer',
};

let firefighter = {
  username: "firefighter",
  password: "test",
  status: 'OK',
  role: 'Firefighter',
};
suite('Logout API', function() {
  suiteSetup(function(done) {
    db.setup(function() {
      UserDAO.addUser(policeChief)
      .then(user => {
        policeChief = user;
        return UserDAO.addUser(fireChief);
      })
      .then(user => {
        fireChief = user;
        return UserDAO.addUser(patrolOfficer);
      })
      .then(user => {
        patrolOfficer = user;
        return UserDAO.addUser(firefighter);
      })
      .then(user => {
        firefighter = user;
      })
      .then(() => done())
      .catch(err => done(err));
    });
  });

  test('Logout with first responder', (done) => {
    // TODO: set proper request header
    user = {userName: policeChief.username, passWord: policeChief.password};
    agent.get(HOST + '/logout')
    .then((res) => {
      expect(res.statusCode).to.be(200);
      done();
    });
  });  

  suiteTeardown(db.teardown);
});
