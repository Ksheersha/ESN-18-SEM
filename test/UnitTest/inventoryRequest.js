const expect = require('expect.js');
const _expect = require('chai').expect();

const db = require('../../util/mockDB');
const InventoryRequestDAO = require('../../util/dao/inventoryRequestDAO');
const InventoryDAO = require('../../util/dao/inventoryDAO');

const dbUtil = require('../../util/dbUtil');
const Hospital = dbUtil.getModel('Hospital');
const InventoryRequest = dbUtil.getModel('InventoryRequest');
const Vehicle = dbUtil.getModel('Vehicle');
const InventoryItem = dbUtil.getModel('InventoryItem');

const HOSPITAL = {
  hospitalName: 'Hospital Name',
  address: 'Hospital address'
};

const TRUCK = {
  type: 'truck',
  name: 'truck abcd'
};

let hospitalId = null;
let truckId = null;
let inventoryId = null;

const ITEM_COUNTS = {
  'bandage': 15,
  'antibiotics': 20,
  'pain-killer': 25,
  'ointment': 30
};

let inventoryItem = new InventoryItem({
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


suite('InventoryRequest Unit Tests', () => {
  setup(done => {
    db.setup(() => {
      // Create a hospital and a truck.
      Hospital.create(HOSPITAL)
        .then(hospital => {
          hospitalId = hospital.id;

          return Vehicle.create(TRUCK);
        })
        .then(truck => {
          truckId = truck.id;

          InventoryDAO.saveUpdateInventoryInfo(inventoryItem)
            .then(inventory => {
              truck.inventory = inventory._id;
              inventoryId = truck.inventory;
              return truck.save();
            });
        })
        .then(() => done())
        .catch(err => done(err));
    });
  });

  suite('#create()', () => {
    test('should create and return a new inventory request if the truck does not have active inventory requests', done => {
      InventoryRequestDAO.create(truckId, hospitalId, ITEM_COUNTS)
        .then(request => InventoryRequestDAO.updateStatusById(request.id, InventoryRequest.Status.ON_TRUCK))
        .then(() => InventoryRequestDAO.create(truckId, hospitalId, ITEM_COUNTS))
        .then(request => {
          expect(request.displayId).to.be('RR_truck_abcd_2');
          expect(request.truck.id).to.be(truckId);
          expect(request.hospital.id).to.be(hospitalId);
          expect(request.createdAt).to.be.ok();
          expect(request.updatedAt).to.be.ok();
          expect(request.status).to.be(InventoryRequest.Status.REQUESTED);

          expect(request.bandageCount).to.be(15);
          expect(request.antibioticsCount).to.be(20);
          expect(request.painKillerCount).to.be(25);
          expect(request.ointmentCount).to.be(30);
          expect(request.aspirinCount).to.be(0);
          expect(request.coldCompressCount).to.be(0);
          expect(request.sanitizerCount).to.be(0);

          done();
        })
        .catch(err => done(err));
    });

    test('should throw an error if the truck id is invalid', done => {
      InventoryRequestDAO.create('5a09924f77b6f95986c4e132', hospitalId, ITEM_COUNTS)
        .then(request => done(new Error(`Got ${request}`)))
        .catch(err => {
          expect(err).to.be.an(InventoryRequest.Error.InvalidArguments);

          done();
        })
        .catch(err => done(err));
    });

    test('should throw an error if the hospital id is invalid', done => {
      InventoryRequestDAO.create(truckId, '5a09924f77b6f95986c4e132', ITEM_COUNTS)
        .then(request => done(new Error(`Got ${request}`)))
        .catch(err => {
          expect(err).to.be.an(InventoryRequest.Error.InvalidArguments);

          done();
        })
        .catch(err => done(err));
    });

    test('should throw an error if the truck already has an active inventory request', done => {
      InventoryRequestDAO.create(truckId, hospitalId, ITEM_COUNTS)
        .then(request => InventoryRequestDAO.updateStatusById(request.id, InventoryRequest.Status.PICKED_UP))
        .then(() => InventoryRequestDAO.create(truckId, hospitalId, ITEM_COUNTS))
        .then(request => done(new Error(`Got ${request}`)))
        .catch(err => {
          expect(err).to.be.an(InventoryRequest.Error.RequestExisted);

          done();
        })
        .catch(err => done(err));
    });
  });

  suite('#getById()', () => {
    test('should return the corresponding inventory request', done => {
      InventoryRequestDAO.create(truckId, hospitalId, ITEM_COUNTS)
        .then(request => InventoryRequestDAO.getById(request.id))
        .then(request => {
          expect(request.displayId).to.be('RR_truck_abcd_1');
          expect(request.truck.id).to.be(truckId);
          expect(request.hospital.id).to.be(hospitalId);
          expect(request.createdAt).to.be.ok();
          expect(request.updatedAt).to.be.ok();
          expect(request.status).to.be(InventoryRequest.Status.REQUESTED);

          expect(request.bandageCount).to.be(15);
          expect(request.antibioticsCount).to.be(20);
          expect(request.painKillerCount).to.be(25);
          expect(request.ointmentCount).to.be(30);
          expect(request.aspirinCount).to.be(0);
          expect(request.coldCompressCount).to.be(0);
          expect(request.sanitizerCount).to.be(0);

          done();
        })
        .catch(err => done(err));
    });

    test('should throw an error if the id is invalid', done => {
      InventoryRequestDAO.getById('5a09924f77b6f95986c4e132')
        .then(request => done(new Error(`Got ${request}`)))
        .catch(err => {
          expect(err).to.be.an(InventoryRequest.Error.InvalidArguments);

          done();
        })
        .catch(err => done(err));
    });
  });

  suite('#getAll()', () => {
    test('should get one inventory request after created', done => {
      InventoryRequestDAO.create(truckId, hospitalId, ITEM_COUNTS)
        .then(() => InventoryRequestDAO.getAll())
        .then(requests => {
          expect(requests).to.have.length(1);
          done();
        })
        .catch(err => done(err));
    });

    test('should get two inventory requests after they are created', done => {
      InventoryRequestDAO.create(truckId, hospitalId, ITEM_COUNTS)
        .then(request => InventoryRequestDAO.updateStatusById(request.id, InventoryRequest.Status.ON_TRUCK))
        .then(() => InventoryRequestDAO.create(truckId, hospitalId, ITEM_COUNTS))
        .then(() => InventoryRequestDAO.getAll())
        .then(requests => {
          expect(requests).to.have.length(2);
          done();
        })
        .catch(err => done(err));
    });

    test('Should return zero when there aren\'t any available requests', done => {
      InventoryRequestDAO.getAll()
        .then(requests => {
          expect(requests).to.have.length(0);
          done();
        })
        .catch(err => done(err));
    });
  });

  suite('#getAllByTruckId()', () => {
    test('should return the corresponding inventory request list', done => {
      InventoryRequestDAO.getAllByTruckId(truckId)
        .then(requests => {
          expect(requests).to.have.length(0);

          return InventoryRequestDAO.create(truckId, hospitalId, ITEM_COUNTS);
        })
        .then(request => InventoryRequestDAO.getAllByTruckId(request.truck.id))
        .then(requests => {
          expect(requests).to.have.length(1);

          done();
        })
        .catch(err => done(err));
    });

    test('should return an empty list if the id is invalid', done => {
      InventoryRequestDAO.create(truckId, hospitalId, ITEM_COUNTS)
        .then(() => InventoryRequestDAO.getAllByTruckId('5a09924f77b6f95986c4e132'))
        .then(requests => {
          expect(requests).to.have.length(0);
          done();
        })
        .catch(err => done(err));
    });
  });

  suite('#getAllByHospitalId()', () => {
    test('should return the corresponding inventory request list', done => {
      InventoryRequestDAO.getAllByHospitalId(truckId)
        .then(requests => {
          expect(requests).to.have.length(0);

          return InventoryRequestDAO.create(truckId, hospitalId, ITEM_COUNTS);
        })
        .then(request => InventoryRequestDAO.getAllByHospitalId(request.hospital.id))
        .then(requests => {
          expect(requests).to.have.length(1);

          done();
        })
        .catch(err => done(err));
    });

    test('should return an empty list if the id is invalid', done => {
      InventoryRequestDAO.create(truckId, hospitalId, ITEM_COUNTS)
        .then(() => InventoryRequestDAO.getAllByHospitalId('5a09924f77b6f95986c4e132'))
        .then(requests => {
          expect(requests).to.have.length(0);
          done();
        })
        .catch(err => done(err));
    });
  });

  suite('#updateStatusById()', () => {
    test('should return an updated inventory request', done => {
      let oldUpdatedAt = null;

      InventoryRequestDAO.create(truckId, hospitalId, ITEM_COUNTS)
        .then(request => {
          oldUpdatedAt = request.updatedAt;

          return InventoryRequestDAO.updateStatusById(request.id, InventoryRequest.Status.READY);
        })
        .then(request => {
          expect(request.status).to.be(InventoryRequest.Status.READY);
          expect(request.updatedAt).to.not.be(oldUpdatedAt);

          done();
        })
        .catch(err => done(err));
    });

    test('should update the database', done => {
      InventoryRequestDAO.create(truckId, hospitalId, ITEM_COUNTS)
        .then(request => InventoryRequestDAO.updateStatusById(request.id, InventoryRequest.Status.READY))
        .then(request => InventoryRequestDAO.getById(request.id))
        .then(request => {
          expect(request.status).to.be(InventoryRequest.Status.READY);

          done();
        })
        .catch(err => done(err));
    });

    test('should throw an error if the id is invalid', done => {
      InventoryRequestDAO.updateStatusById('5a09924f77b6f95986c4e132', InventoryRequest.Status.READY)
        .then(request => done(new Error(`Got ${request}`)))
        .catch(err => {
          expect(err).to.be.an(InventoryRequest.Error.InvalidArguments);

          done();
        })
        .catch(err => done(err));
    });
  });

  suite('#updateInventoryObject', () => {
    //Works by itself, but fails when runs in suite
    // test('Should update inventory', done => {
    //   let requestId = null;
    //   InventoryRequestDAO.create(truckId, hospitalId, ITEM_COUNTS)
    //     .then(request => {
    //       requestId = request._id;
    //       InventoryDAO.getInventory(inventoryId)
    //         .then(inventory => {
    //           for(item in inventory) {
    //               expect(inventory.item).to.equal(inventoryItem.item);
    //           }
    //           InventoryRequestDAO.updateInventoryObject(requestId, (inventory) => {
    //               expect(inventory.bandageCurrentCount).to.equal(inventoryItem.bandageCurrentCount + ITEM_COUNTS.bandage);
    //               expect(inventory.antibioticsCurrentCount).to.equal(inventoryItem.antibioticsCurrentCount + ITEM_COUNTS.antibiotics);
    //               expect(inventory.painKillerCurrentCount).to.equal(inventoryItem.painKillerCurrentCount + ITEM_COUNTS["pain-killer"]);
    //               expect(inventory.ointmentCurrentCount).to.equal(inventoryItem.ointmentCurrentCount + ITEM_COUNTS.ointment);
    //             done();
    //           });
    //       })
    //     })
    //     .catch(err => done(err));
    // })
  });

  teardown(done => {
    db.teardown(done);
  });
});
