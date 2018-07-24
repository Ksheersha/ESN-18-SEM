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

let policeChiefId = null;
let fireChiefId = null;
let patrolOfficerId = null;
let firefighterId = null;

suite('Organization API', function() {
  suiteSetup(function(done) {
    db.setup(function() {
      UserDAO.addUser(policeChief)
      .then(user => {
        policeChiefId = user._id;
        return UserDAO.addUser(fireChief);
      })
      .then(user => {
        fireChiefId = user._id;
        return UserDAO.addUser(patrolOfficer);
      })
      .then(user => {
        patrolOfficerId = user._id;
        return UserDAO.addUser(firefighter);
      })
      .then(user => {
        firefighterId = user._id;
      })
      .then(() => done())
      .catch(err => done(err));
    });
  });

  test('Get organization list', function(done) {
    agent.get(HOST + '/organization/')
    .send()
    .end(function(err, res) {
      expect(err).to.be(null);
      expect(res.statusCode).to.be.equal(200);
      org = res.body;
      expect(org).to.have.length(2);
      done();
    });
  });

  test('Get organization by policeChief id', function(done) {
    agent.get(HOST + '/organization/chief/' + policeChiefId)
    .send()
    .end(function(err, res) {
      expect(err).to.be(null);
      expect(res.statusCode).to.be.equal(200);
      org = res.body;
      expect(org.chief._id).to.be.equal(policeChiefId.toString());
      done();
    });
  });

  test('Get organization by fireChief id', function(done) {
    agent.get(HOST + '/organization/chief/' + fireChiefId)
    .send()
    .end(function(err, res) {
      expect(err).to.be(null);
      expect(res.statusCode).to.be.equal(200);
      org = res.body;
      expect(org.chief._id).to.be.equal(fireChiefId.toString());
      done();
    });
  });

  test('Get organization by invalid id', function(done) {
    agent.get(HOST + '/organization/chief/' + 'invalidId')
    .send()
    .end(function(err, res) {
      expect(err).not.to.be(null);
      expect(res.statusCode).to.be.equal(500);
      done();
    });
  });

  test('Update organization persons by policeChief id', function(done){
    let update = {'persons': [patrolOfficerId]};
    agent.post(HOST + '/organization/chief/' + policeChiefId)
    .send(update)
    .end(function(err, res) {
      expect(err).to.be(null);
      expect(res.statusCode).to.be.equal(201);
      org = res.body;
      expect(org.persons).to.have.length(1);
      expect(org.persons[0]._id).to.be.equal(patrolOfficerId.toString());
      expect(org.areas).to.have.length(1);
      done();
    });
  });

  test('Update organization persons by fireChief id', function(done){
    let update = {'persons': [firefighterId]};
    agent.post(HOST + '/organization/chief/' + fireChiefId)
    .send(update)
    .end(function(err, res) {
      expect(err).to.be(null);
      expect(res.statusCode).to.be.equal(201);
      org = res.body;
      expect(org.persons).to.have.length(1);
      expect(org.persons[0]._id).to.be.equal(firefighterId.toString());
      expect(org.areas).to.have.length(0);
      done();
    });
  });

  test('Update organization vehicles by policeChief id', function(done){
    let numVehicles = 3;
    let update = {'vehicles': numVehicles};
    agent.post(HOST + '/organization/chief/' + policeChiefId)
    .send(update)
    .end(function(err, res) {
      expect(err).to.be(null);
      expect(res.statusCode).to.be.equal(201);
      org = res.body;
      expect(org.vehicles.length).to.be.equal(numVehicles);
      expect(org.vehicles[0].type).to.be.equal('car');
      done();
    });
  });

  test('Update organization vehicles by fireChief id', function(done){
    let numVehicles = 2;
    let update = {'vehicles': numVehicles};
    agent.post(HOST + '/organization/chief/' + fireChiefId)
    .send(update)
    .end(function(err, res) {
      expect(err).to.be(null);
      expect(res.statusCode).to.be.equal(201);
      org = res.body;
      expect(org.vehicles.length).to.be.equal(numVehicles);
      expect(org.vehicles[0].type).to.be.equal('truck');
      done();
    });
  });  

  test('Update organization vehicles by invalid id', function(done){
    let numVehicles = 3;
    let update = {'vehicles': numVehicles};
    agent.post(HOST + '/organization/chief/' + 'invalidId')
    .send(update)
    .end(function(err, res) {
      expect(err).not.to.be(null);
      expect(res.statusCode).to.be.equal(500);
      done();
    });
  }); 

  test('Update organization vehicles by patrolOfficer id', function(done){
    let numVehicles = 3;
    let update = {'vehicles': numVehicles};
    agent.post(HOST + '/organization/chief/' + patrolOfficerId)
    .send(update)
    .end(function(err, res) {
      expect(err).not.to.be(null);
      expect(res.statusCode).to.be.equal(500);
      done();
    });
  });  

  test('Update organization vehicles by firefighter id', function(done){
    let numVehicles = 3;
    let update = {'vehicles': numVehicles};
    agent.post(HOST + '/organization/chief/' + firefighterId)
    .send(update)
    .end(function(err, res) {
      expect(err).not.to.be(null);
      expect(res.statusCode).to.be.equal(500);
      done();
    });
  });

  test('Get organization by patrolOfficer id', done => {
    agent.get(HOST + '/organization/personnel/' + patrolOfficerId)
      .then(res => {
        _expect(res.statusCode).to.equal(HTTPStatus.OK);
        _expect(res.body.chief._id).to.equal(policeChiefId.toString());
        done();
    })
      .catch(err => {
        done(err);
    })
  });

  test('Get organization by personnel with policeChiefId should be empty', done => {
    agent.get(HOST + '/organization/personnel/' + policeChiefId)
      .then(res => {
        _expect(res.statusCode).to.equal(HTTPStatus.OK);
        _expect(res.body).to.be.empty;
        done();
    })
      .catch(err => {
        done(err);
    })
  });

  test('Get organization by firefighter id', done => {
    agent.get(HOST + '/organization/personnel/' + firefighterId)
    .then(res => {
      _expect(res.statusCode).to.equal(HTTPStatus.OK);
      _expect(res.body.chief._id).to.equal(fireChiefId.toString());
      done();
    })
    .catch(err => {
      done(err);
    })
  });

  test('Get organization by personnel with fireChiefId should be empty', done => {
    agent.get(HOST + '/organization/personnel/' + fireChiefId)
    .then(res => {
      _expect(res.statusCode).to.equal(HTTPStatus.OK);
      _expect(res.body).to.be.empty;
      done();
    })
    .catch(err => {
      done(err);
    })
  });

  test('Update car with patrol officer', done => {
    agent.get(HOST + '/organization/chief/' + policeChiefId).then(res => {
      let org = res.body;
      _expect(org.vehicles).to.have.lengthOf(3);
      _expect(org.vehicles[0]._id).to.exist;
      let vehicleId = org.vehicles[0]._id;
      let update = {persons: patrolOfficerId};
      return agent.patch(HOST + '/vehicles/id/' + vehicleId)
        .send(update);
    }).then(res => {
      let car = res.body;
      _expect(car.persons).to.include(patrolOfficerId.toString());
      done();
    }).catch(err => done(err));
  });

  test('Update car with invalid user', done => {
    agent.get(HOST + '/organization/chief/' + policeChiefId).then(res => {
      let org = res.body;
      _expect(org.vehicles).to.have.lengthOf(3);
      _expect(org.vehicles[0]._id).to.exist;
      let vehicleId = org.vehicles[0]._id;
      let update = {persons: 'invalid'};
      return agent.patch(HOST + '/vehicles/id/' + vehicleId)
      .send(update);
    })
    .then(res => {
      done(1);
    })
    .catch(err => {
      _expect(err.status).to.equal(HTTPStatus.INTERNAL_SERVER_ERROR);
      done();
    });
  });

  test('Update car with empty body', done => {
    agent.get(HOST + '/organization/chief/' + policeChiefId).then(res => {
      let org = res.body;
      _expect(org.vehicles).to.have.lengthOf(3);
      _expect(org.vehicles[0]._id).to.exist;
      let vehicleId = org.vehicles[0]._id;
      return agent.patch(HOST + '/vehicles/id/' + vehicleId)
      .send();
    })
    .then(res => {
      done();
    })
    .catch(err => {
      done(1);
    });
  });

  suiteTeardown(db.teardown);
});

