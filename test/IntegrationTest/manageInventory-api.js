process.env.NODE_ENV = 'test';

const expect = require('expect.js');
let HTTPStatus = require('http-status');
let _expect = require('chai').expect;
const agent = require('superagent').agent();

const PORT = 3000;
const HOST = 'http://localhost:' + PORT;
// const PATH = '';
// const ROOT = HOST + PATH;

// Initiate Server
const www = require('../../bin/www');
const db = require('../../util/mockDB');

const dbUtil = require('../../util/dbUtil');
//const InventoryRequest = dbUtil.getModel('InventoryRequest');
const InventoryItem = dbUtil.getModel('InventoryItem');
const User = dbUtil.getModel('User');
const Vehicle = dbUtil.getModel('Vehicle');

//const InventoryRequestDAO = require('../../util/dao/inventoryRequestDAO');
const UserDAO = require('../../util/dao/userDAO').UserDAO;
const InventoryDAO = require('../../util/dao/inventoryDAO');
let OrganizationDAO = require('../../util/dao/organizationDAO');

let fireFighter = {
  username: "fireFighter",
  password: "test",
  status: 'OK',
  role: 'Firefighter',
};

let fireChief = {
  username: "fireChief",
  password: "test",
  status: 'OK',
  role: 'FireChief',
};

let paramedic = {
  username: "paramedix",
  password: "test",
  status: 'OK',
  role: 'Paramedic',
};

const TRUCK = {
  type: 'truck',
  name: 'truck abcd'
};

let inventoryItem = {
  bandageCurrentCount: 25,
  bandageExpectedCount: 25,

  antibioticsCurrentCount: 10,
  antibioticsExpectedCount: 10,

  painKillerCurrentCount: 20,
  painKillerExpectedCount: 20,

  ointmentCurrentCount: 15,
  ointmentExpectedCount: 15,

  aspirinCurrentCount: 25,
  aspirinExpectedCount: 25,

  coldCompressCurrentCount: 5,
  coldCompressExpectedCount: 5,

  sanitizerCurrentCount: 4,
  sanitizerExpectedCount: 4


};

let inventoryItem1 = {
  bandageCurrentCount: 25,
  bandageExpectedCount: 25,

  antibioticsCurrentCount: 10,
  antibioticsExpectedCount: 10,

  painKillerCurrentCount: 20,
  painKillerExpectedCount: 20,

  ointmentCurrentCount: 15,
  ointmentExpectedCount: 15,

  aspirinCurrentCount: 25,
  aspirinExpectedCount: 25,

  coldCompressCurrentCount: 5,
  coldCompressExpectedCount: 5,

  sanitizerCurrentCount: 4,
  sanitizerExpectedCount: 4


};

let truckId = null;
let inventoryId = null;
let paramedicId = null;
let fireFighterId = null;
let fireChiefId = null;
let numVehicles = 2;
let update = {'vehicles': numVehicles};
let vehicles = [];

suite('Manage Inventory API', () => {
  setup(done => {
    db.setup(() => {
      UserDAO.addUser(paramedic)
        .then(user => {
          paramedicId = user.id
          return UserDAO.addUser(fireFighter);
        })
        .then(user => {
          fireFighterId = user._id;
          return UserDAO.addUser(fireChief);
        })
        .then(user => {
          fireChiefId = user._id;
          return Vehicle.create(TRUCK);
        })
        .then(truck => {
          truckId = truck.id;
          return InventoryItem.create(inventoryItem)
        })
        .then(inventory1 => {
          inventoryId = inventory1.id;
          return OrganizationDAO.updateOrganization(fireChiefId, update)
        })
        .then(organization => {
          vehicles = organization.vehicles;

          // Login as the firechief.
          return agent.post(HOST + '/users').send({
            userName: fireChief.username,
            passWord: fireChief.password
          });
        })

        .then(() => done())
        .catch(err => done(err));
    });
  });

  suite('Create and get inventory', function () {
    test('Create inventory on truck when allocated to firechief', (done) => {
      let numVehicles = 3;
      let update = {'vehicles': numVehicles};
      agent.post(HOST + '/organization/chief/' + fireChiefId)
        .send(update)
        .end(function (err, res) {
          expect(err).to.be(null);
          expect(res.statusCode).to.be.equal(201);
          org = res.body;
          expect(org.vehicles.length).to.be.equal(numVehicles);
          expect(org.vehicles[0].type).to.be.equal('truck');
          expect(org.vehicles[0].inventory).not.to.be(null);
          done();
        });

    });

    test('Create and get inventory on truck by id', (done) => {
      agent.post(HOST + '/organization/chief/' + fireChiefId)
        .send(update)
        .end(function (err, res) {
          org = res.body;
          vehicleId1 = org.vehicles[0]._id;
          agent.get(HOST + '/vehicles/truck/' + vehicleId1)
            .send()
            .end((err, res) => {
              expect(err).to.be(null);
              expect(res.statusCode).to.be.eql(200);
              expect(res.body._id).to.be.eql(vehicleId1);
              done();
            });
        });

    });

    test('Get truck by valid id', (done) => {
      agent.get(HOST + '/vehicles/truck/' + truckId)
        .send()
        .end((err, res) => {
          expect(err).to.be(null);
          expect(res.statusCode).to.be.eql(200);
          expect(res.body._id).to.be.eql(truckId);
          done();
        });
    });

    test('Get truck with invalid id', (done) => {
      invalidVehicleId = '123abc';
      agent.get(HOST + '/vehicles/truck/' + invalidVehicleId)
        .send()
        .end((err, res) => {
          expect(err).not.to.be(null);
          expect(err).to.be.an(Error);
          done();
        });
    });

    test('Get inventory list by inventory id', (done) => {
      agent.get(HOST + '/inventories/' + inventoryId)
        .send()
        .end((err, res) => {
          expect(err).to.be(null);
          expect(res.statusCode).to.be.eql(200);
          expect(res.body._id).to.be.eql(inventoryId);
          expect(res.body.bandageCurrentCount).to.be.eql(25);
          expect(res.body.bandageExpectedCount).to.be.eql(25);
          expect(res.body.antibioticsCurrentCount).to.be.eql(10);
          expect(res.body.antibioticsExpectedCount).to.be.eql(10);
          expect(res.body.painKillerCurrentCount).to.be.eql(20);
          expect(res.body.painKillerExpectedCount).to.be.eql(20);
          expect(res.body.ointmentCurrentCount).to.be.eql(15);
          expect(res.body.ointmentExpectedCount).to.be.eql(15);
          expect(res.body.aspirinCurrentCount).to.be.eql(25);
          expect(res.body.aspirinExpectedCount).to.be.eql(25);
          expect(res.body.coldCompressCurrentCount).to.be.eql(5);
          expect(res.body.coldCompressExpectedCount).to.be.eql(5);
          expect(res.body.sanitizerCurrentCount).to.be.eql(4);
          expect(res.body.sanitizerExpectedCount).to.be.eql(4);
          done();
        });
    });

    test('Get inventory with invalid id', (done) => {
      invalidInventoryId = '123abc';
      agent.get(HOST + '/inventories/' + invalidInventoryId)
        .send()
        .end((err, res) => {
          expect(err).not.to.be(null);
          expect(err).to.be.an(Error);
          done();
        });
    });

    test('Create/save and get an inventory with the given id from the system', (done) => {
      inventoryItem1.inventoryId = inventoryId;
      agent.post(HOST + '/inventories')
        .send(inventoryItem1)
        .end((err, res) => {
          expect(res.statusCode).to.be.eql(200);
          expect(res.body.bandageCurrentCount).to.be.eql(25);
          expect(res.body.bandageExpectedCount).to.be.eql(25);
          expect(res.body.antibioticsCurrentCount).to.be.eql(10);
          expect(res.body.antibioticsExpectedCount).to.be.eql(10);
          expect(res.body.painKillerCurrentCount).to.be.eql(20);
          expect(res.body.painKillerExpectedCount).to.be.eql(20);
          expect(res.body.ointmentCurrentCount).to.be.eql(15);
          expect(res.body.ointmentExpectedCount).to.be.eql(15);
          expect(res.body.aspirinCurrentCount).to.be.eql(25);
          expect(res.body.aspirinExpectedCount).to.be.eql(25);
          expect(res.body.coldCompressCurrentCount).to.be.eql(5);
          expect(res.body.coldCompressExpectedCount).to.be.eql(5);
          expect(res.body.sanitizerCurrentCount).to.be.eql(4);
          expect(res.body.sanitizerExpectedCount).to.be.eql(4);
          done();

        });
    });


    teardown(done => {
      db.teardown(done);
    });
  })
});

