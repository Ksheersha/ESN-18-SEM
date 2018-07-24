let expect = require('expect.js');

process.env.NODE_ENV = 'test';

let db = require('../../util/mockDB');
let dbUtil = require('../../util/dbUtil');

let OrganizationDAO = require('../../util/dao/organizationDAO')

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


suite('Organization unit test', function() {
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
    OrganizationDAO.getChiefList()
    .then(function(org) {
      expect(org).to.have.length(2);
      done();
    });
  });

  test('Get organization by policeChief id', function(done) {
    OrganizationDAO.getOrganizationByChiefId(policeChiefId)
    .then(function(org) {
      expect(org.chief.username).to.be(policeChief.username);
      done();
    });
  });

  test('Get organization by fireChief id', function(done) {
    OrganizationDAO.getOrganizationByChiefId(fireChiefId)
    .then(function(org) {
      expect(org.chief.username).to.be.equal(fireChief.username);
      done();
    });
  });

  test('Get organization by invalid id', function(done) {
    OrganizationDAO.getOrganizationByChiefId('invalidId')
    .catch(err => done());
  });

  test('Update organization persons by policeChief id', function(done){
    let update = {'persons': [patrolOfficerId]};
    OrganizationDAO.updateOrganization(policeChiefId, update)
    .then(function(org) {
      expect(org.persons).to.have.length(1);
      expect(org.persons[0].username).to.be.equal(patrolOfficer.username);
      expect(org.areas).to.have.length(1);
      done();
    });
  });

  test('Update organization persons by fireChief id', function(done){
    let update = {'persons': [firefighterId]};
    OrganizationDAO.updateOrganization(fireChiefId,update)
    .then(function(org) {
      expect(org.persons).to.have.length(1);
      expect(org.persons[0].username).to.be.equal(firefighter.username);
      expect(org.areas).to.have.length(0);
      done();
    });
  });

  test('Update organization vehicles by policeChief id', function(done){
    let numVehicles = 3;
    let update = {'vehicles': numVehicles};
    OrganizationDAO.updateOrganization(policeChiefId, update)
    .then(function(org) {
      expect(org.vehicles.length).to.be.equal(numVehicles);
      expect(org.vehicles[0].type).to.be.equal('car');
      done();
    });
  });

  test('Update organization vehicles by fireChief id', function(done){
    let numVehicles = 2;
    let update = {'vehicles': numVehicles};
    OrganizationDAO.updateOrganization(fireChiefId, update)
    .then(function(org) {
      expect(org.vehicles.length).to.be.equal(numVehicles);
      expect(org.vehicles[0].type).to.be.equal('truck');
      done();
    });
  });  

  test('Update organization vehicles by invalid id', function(done){
    let numVehicles = 3;
    let update = {'vehicles': numVehicles};
    OrganizationDAO.updateOrganization('invalidId', update)
    .catch(err => done());
  }); 

  test('Update organization vehicles by patrolOfficer id', function(done){
    let numVehicles = 3;
    let update = {'vehicles': numVehicles};
    OrganizationDAO.updateOrganization(patrolOfficerId, update)
    .catch(err => {
      done();
    });
  });  

  test('Update organization vehicles by firefighter id', function(done){
    let numVehicles = 3;
    let update = {'vehicles': numVehicles};
    OrganizationDAO.updateOrganization(firefighterId, update)
    .catch(err => {
      done();
    });
  });  


  suiteTeardown(db.teardown);
});
