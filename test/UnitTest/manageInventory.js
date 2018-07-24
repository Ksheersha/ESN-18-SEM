const expect = require('expect.js');

const db = require('../../util/mockDB');
const InventoryDAO = require('../../util/dao/inventoryDAO');
const VehicleDAO = require('../../util/dao/vehicleDAO');
let UserDAO = require('../../util/dao/userDAO').UserDAO;
let OrganizationDAO = require('../../util/dao/organizationDAO')



const dbUtil = require('../../util/dbUtil');
const InventoryItem = dbUtil.getModel('InventoryItem');
const Vehicle = dbUtil.getModel('Vehicle');

const TRUCK = {
  type: 'truck',
  name: 'truck abc',

};
let truckId = null;
let inventoryId = null;
let paramedicId = null;
let fireFighterId = null;
let fireChiefId = null;

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

let inventoryItem1 = new InventoryItem({
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


});

suite('Manage Inventory Unit Tests', () => {
  setup(done => {
    db.setup(() => {
      // Create users and truck and inventory.
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
        .then(inventory1 =>{
          inventoryId =  inventory1.id;

        }).then(() => done())
        .catch(err => done(err));
    });
  });

  test('Create inventory with truck assignment to FireChief', function(done){
    let numVehicles = 2;
    let update = {'vehicles': numVehicles};
    OrganizationDAO.updateOrganization(fireChiefId, update)
      .then(function(org) {
        for (let i = 0; i < org.vehicles.length; i++) {
          VehicleDAO.getTruckById(org.vehicles[i])
            .then(function (truck) {
              expect(truck.inventory).to.not.be(null);
            })
        }
        done();
      })
      .catch(err => done(err));
  });

  test('Should throw error if getting a truck by wrong id', function(done){
    let badId = '123abcd';
    VehicleDAO.getTruckById(badId)
      .catch(err => {
        expect(err).not.to.be(null);
        done();
      })
  });

  test('Should throw error if getting an inventory by wrong id', function(done){
    let badId = '123abcd';
    InventoryDAO.getInventory(badId)
      .catch(err => {
        expect(err).not.to.be(null);
        done();
      })
  });

  test('Should return the corresponding inventory with the inventoryId', done =>{
    InventoryDAO.getInventory(inventoryId)
      .then(function(inventory){
        expect(inventory.bandageCurrentCount).to.be(25);
        expect(inventory.bandageExpectedCount).to.be(25);
        expect(inventory.antibioticsCurrentCount).to.be(10);
        expect(inventory.antibioticsExpectedCount).to.be(10);
        expect(inventory.painKillerCurrentCount).to.be(20);
        expect(inventory.painKillerExpectedCount).to.be(20);
        expect(inventory.ointmentCurrentCount).to.be(15);
        expect(inventory.ointmentExpectedCount).to.be(15);
        expect(inventory.aspirinCurrentCount).to.be(25);
        expect(inventory.aspirinExpectedCount).to.be(25);
        expect(inventory.coldCompressCurrentCount).to.be(5);
        expect(inventory.coldCompressExpectedCount).to.be(5);
        expect(inventory.sanitizerCurrentCount).to.be(4);
        expect(inventory.sanitizerExpectedCount).to.be(4);

        done();

      })
      .catch(err => done(err));
  });

  test('Should return the nothing for wrong inventory id', done => {
    InventoryDAO.getInventory('5a09924f77b6f95986c4e132')
      .then(function (inventory) {
        expect(inventory).to.be.null;

        done();
      })
      .catch(err => done(err));
  });

  test('Should save the inventory', done => {
    InventoryDAO.saveUpdateInventoryInfo(inventoryItem1)
      .then(function (newinventory) {
        expect(newinventory.bandageCurrentCount).to.be(25);
        expect(newinventory.bandageExpectedCount).to.be(25);
        expect(newinventory.antibioticsCurrentCount).to.be(10);
        expect(newinventory.antibioticsExpectedCount).to.be(10);
        expect(newinventory.painKillerCurrentCount).to.be(20);
        expect(newinventory.painKillerExpectedCount).to.be(20);
        expect(newinventory.ointmentCurrentCount).to.be(15);
        expect(newinventory.ointmentExpectedCount).to.be(15);
        expect(newinventory.aspirinCurrentCount).to.be(25);
        expect(newinventory.aspirinExpectedCount).to.be(25);
        expect(newinventory.coldCompressCurrentCount).to.be(5);
        expect(newinventory.coldCompressExpectedCount).to.be(5);
        expect(newinventory.sanitizerCurrentCount).to.be(4);
        expect(newinventory.sanitizerExpectedCount).to.be(4);

        done();
    })
      .catch(err => done(err));

  });

  test('Should update the count of some of inventory items', done => {
    let inventoryItem2 = {
      bandageCurrentCount: 20,
      bandageExpectedCount: 25,

      antibioticsCurrentCount: 10,
      antibioticsExpectedCount: 10,

      painKillerCurrentCount: 20,
      painKillerExpectedCount: 20,

      ointmentCurrentCount: 15,
      ointmentExpectedCount: 15,

      aspirinCurrentCount: 20,
      aspirinExpectedCount: 25,

      coldCompressCurrentCount: 5,
      coldCompressExpectedCount: 5,

      sanitizerCurrentCount: 4,
      sanitizerExpectedCount: 4


    };


    inventoryItem2.inventoryId = inventoryId;
    InventoryDAO.saveUpdateInventoryInfo(inventoryItem2)
      .then(existingInventory => {
        expect(existingInventory.bandageCurrentCount).to.be(20);
        done();
      })
    .catch(err => done(err));
  });




  teardown(done => {
    db.teardown(done);
  });
});
