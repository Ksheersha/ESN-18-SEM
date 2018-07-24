process.env.NODE_ENV = 'test';

const expect = require('expect.js');
const agent = require('superagent').agent();

const PORT = 3000;
const HOST = 'http://localhost:' + PORT;
const PATH = '/inventories/requests';
const ROOT = HOST + PATH;

// Initiate Server
const www = require('../../bin/www');
const db = require('../../util/mockDB');

const dbUtil = require('../../util/dbUtil');
const Hospital = dbUtil.getModel('Hospital');
const InventoryRequest = dbUtil.getModel('InventoryRequest');
const User = dbUtil.getModel('User');
const Vehicle = dbUtil.getModel('Vehicle');

const InventoryRequestDAO = require('../../util/dao/inventoryRequestDAO');
const UserDAO = require('../../util/dao/userDAO').UserDAO;

const FIREFIGHTER = {
  username: 'Firefighter',
  password: 'firefighter',
  status: 'OK',
  role: 'Firefighter'
};
let firefighterId = null;

const HOSPITAL = {
  hospitalName: 'Hospital Name',
  address: 'Hospital address'
};
let hospitalId = null;

const TRUCK = {
  type: 'truck',
  name: 'truck abcd'
};
let truckId = null;

const ITEM_COUNTS = {
  'ointment': 2,
  'aspirin': 3,
  'cold-compress': 5,
  'sanitizer': 7
};
let requestId = null;

suite('Inventory Request API', () => {
  setup(done => {
    db.setup(() => {
      UserDAO.addUser(FIREFIGHTER)
        .then(user => {
          firefighterId = user.id;

          return Hospital.create(HOSPITAL);
        })
        .then(hospital => {
          hospitalId = hospital.id;

          return Vehicle.create(TRUCK);
        })
        .then(truck => {
          truckId = truck.id;

          return InventoryRequestDAO.create(truckId, hospitalId, ITEM_COUNTS);
        })
        .then(request => {
          requestId = request.id;

          // Login as the firefighter.
          return agent.post(HOST + '/users').send({
            userName: FIREFIGHTER.username,
            passWord: FIREFIGHTER.password
          });
        })
        .then(() => done())
        .catch(err => done(err));
    });
  });

  suite(`GET ${PATH}`, () => {
    test('should return all the requests of the truck if truckId is given', done => {
      agent
        .get(ROOT)
        .query({truckId: '5a09924f77b6f95986c4e132'})
        .send()
        .then(res => {
          expect(res.status).to.be(200);
          expect(res.body).to.have.length(0);

          return agent
            .get(ROOT)
            .query({truckId})
            .send();
        })
        .then(res => {
          expect(res.status).to.be(200);
          expect(res.body).to.have.length(1);

          done();
        })
        .catch(err => done(err));
    });

    test('should return all the requests of the hospital if hospitalId is given', done => {
      agent
        .get(ROOT)
        .query({hospitalId: '5a09924f77b6f95986c4e132'})
        .send()
        .then(res => {
          expect(res.status).to.be(200);
          expect(res.body).to.have.length(0);

          return agent
            .get(ROOT)
            .query({hospitalId})
            .send();
        })
        .then(res => {
          expect(res.status).to.be(200);
          expect(res.body).to.have.length(1);

          done();
        })
        .catch(err => done(err));
    });

    test('should return all the requests in database, even if no hospitalId and truckId is given', done => {
      agent
        .get(ROOT)
        .query({})
        .send()
        .then(res => {
          expect(res.status).to.be(200);
          expect(res.body).to.have.length(1);
          done();
        })
        .catch(err => done(err));
    });
  });

  suite(`POST ${PATH}`, () => {
    test('should create and return a new inventory request if the truck does not have active inventory requests', done => {
      InventoryRequestDAO.updateStatusById(requestId, InventoryRequest.Status.ON_TRUCK)
        .then(() => agent
          .post(ROOT)
          .send({truckId, hospitalId, itemCounts: ITEM_COUNTS}))
        .then(res => {
          expect(res.status).to.be(201);
          expect(res.body.displayId).to.be('RR_truck_abcd_2');
          expect(res.body.truck._id).to.be(truckId);
          expect(res.body.hospital._id).to.be(hospitalId);
          expect(res.body.createdAt).to.be.ok();
          expect(res.body.updatedAt).to.be.ok();
          expect(res.body.status).to.be(InventoryRequest.Status.REQUESTED);

          expect(res.body.bandageCount).to.be(0);
          expect(res.body.antibioticsCount).to.be(0);
          expect(res.body.painKillerCount).to.be(0);
          expect(res.body.ointmentCount).to.be(2);
          expect(res.body.aspirinCount).to.be(3);
          expect(res.body.coldCompressCount).to.be(5);
          expect(res.body.sanitizerCount).to.be(7);

          done();
        })
        .catch(err => done(err));
    });

    test('should return 422 if some fields are missing', done => {
      agent
        .post(ROOT)
        .send({hospitalId, itemCounts: ITEM_COUNTS})
        .then(res => done(new Error(`Got ${res}`)))
        .catch(err => {
          expect(err.status).to.be(422);

          done();
        })
        .catch(err => done(err));
    });

    test('should return 409 if the truck already has an active inventory request', done => {
      agent
        .post(ROOT)
        .send({truckId, hospitalId, itemCounts: ITEM_COUNTS})
        .then(res => done(new Error(`Got ${res}`)))
        .catch(err => {
          expect(err).to.be.an(Error);
          expect(err.status).to.be(409);

          done();
        })
        .catch(err => done(err));
    });
  });

  suite(`GET ${PATH}/:requestId`, () => {
    test('should return the corresponding inventory request', done => {
      agent
        .get(`${ROOT}/${requestId}`)
        .send({})
        .then(res => {
          expect(res.status).to.be(200);
          expect(res.body._id).to.be(requestId);

          done();
        })
        .catch(err => done(err));
    });

    test('should return 404 if the id is invalid', done => {
      agent
        .get(ROOT + '/5a09924f77b6f95986c4e132')
        .send()
        .then(res => done(new Error(`Got ${res}`)))
        .catch(err => {
          expect(err).to.be.an(Error);
          expect(err.status).to.be(404);

          done();
        })
        .catch(err => done(err));
    });
  });

  suite(`PATCH ${PATH}/:requestId`, () => {
    test('should update and return the corresponding inventory request', done => {
      agent
        .patch(`${ROOT}/${requestId}`)
        .send({status: 'ready'})
        .then(res => {
          expect(res.status).to.be(200);
          expect(res.body._id).to.be(requestId);
          expect(res.body.status).to.be('ready');

          done();
        })
        .catch(err => done(err));
    });

    test('should return 404 if the id is invalid', done => {
      agent
        .patch(ROOT + '/5a09924f77b6f95986c4e132')
        .send({status: 'ready'})
        .then(res => done(new Error(`Got ${res}`)))
        .catch(err => {
          expect(err.status).to.be(404);

          done();
        })
        .catch(err => done(err));
    });

    test('should return 422 if the status is invalid', done => {
      agent
        .patch(`${ROOT}/${requestId}`)
        .send({status: 'an invalid status'})
        .then(res => done(new Error(`Got ${res}`)))
        .catch(err => {
          expect(err.status).to.be(422);

          done();
        })
        .catch(err => done(err));
    });
  });

  teardown(done => {
    db.teardown(done);
  });
});
