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

let dispatcher = {
  username: 'dispatch123',
  password: '1234',
  register: 'true',
  status: 'OK',
  role: 'Dispatcher',
  isActive: false,
  isOnline: false
};

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

let numVehicles = 3;
let org;

suite('Resource API', function() {
  suiteSetup(function(done) {
    db.setup(function() {
      UserDAO.addUser(policeChief)
      .then(user => {
        policeChiefId = user._id;
        return UserDAO.addUser(patrolOfficer);
      })
      .then(user => {
        fireChiefId = user._id;
        return UserDAO.addUser(dispatcher);
      })
      .then(user => {
        patrolOfficerId = user._id;
      })
      .then(() => done())
      .catch(err => done(err));
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

  test('Update organization vehicles by policeChief id', function(done){
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

  test('Get resources', done => {
    agent.get(HOST + '/resource')
    .send()
    .end(function(err, res) {
      expect(res.status).to.be(200);
      expect(res.body.length).to.be(3);
      done();
    })
  })

  test('Update resources', done => {
    let vehicles = org.vehicles;

    vehicles[0].allocated = {
      kind: 'Area', 
      to: '5ae26a391d76c21f923cf414'
    };

    let updatedResources = {
      resources: vehicles
    }
    agent.put(HOST + '/resource')
    .send(updatedResources)
    .end(function(err, res) {
      expect(res.status).to.be(200);
      expect(res.body.length).to.be(1);
      expect(res.body[0].allocated.kind).to.be('Area');
      expect(res.body[0].allocated.to).to.be('5ae26a391d76c21f923cf414');
      done();
    })
  })


  suiteTeardown(db.teardown);
});

