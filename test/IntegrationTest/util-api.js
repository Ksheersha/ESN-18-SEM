const expect = require('expect.js');
const agent = require('superagent').agent();

const UtilDAO = require('../../util/dao/utilDAO');

const PORT = 3000;
const HOST = 'http://localhost:' + PORT;

process.env.NODE_ENV = 'test';

// Initiate Server
const www = require('../../bin/www');
const db = require('../../util/mockDB');

const user = {
  userName: 'kobebryant',
  passWord: '0824',
  register: 'true',
  status: 'OK',
  role: 'Nurse',
  isActive: false,
  isOnline: false
};

const pin1 = {
  type: 'pin',
  location: {
    latitude: -78.2,
    longitude: 123.5
  },
  note: 'Pin 1'
};
let pin1_id = null;

const pin2 = {
  type: 'pin',
  location: {
    latitude: -88.2,
    longitude: 133.5
  },
  note: 'Pin 2'
};
let pin2_id = null;

const pin3Form = {
  type: 'pin',
  latitude: -28.2,
  longitude: 33.5,
  note: 'Pin 3'
};
let pin3_id = null;

const block1 = {
  type: 'block',
  location: {
    latitude: 68.2,
    longitude: -33.5
  },
  note: 'Block 1'
};
let block1_id = null;

const blockForm2 = {
  type: 'block',
  latitude: 78.2,
  longitude: -43.5,
  note: 'Block 2'
};

const partialForm = {
  type: 'block',
  latitude: 78.2,
  longitude: -43.5
};

const invalidForm = {
  type: 'block',
  latitude: 'abc',
  longitude: -43.5,
  note: 'Block 2'
};

suite('Util API Tests', () => {
  setup(done => {
    db.setup(() => {
      UtilDAO.create(pin1) // Add utils to the database.
        .then(pin1 => {
          pin1_id = pin1._id;
          return UtilDAO.create(pin2);
        })
        .then(pin2 => {
          pin2_id = pin2._id;
          return UtilDAO.create(block1);
        })
        .then(block1 => {
          block1_id = block1.id;
          return agent.post(HOST + '/users').send(user); // Register a new user.
        })
        .then(res => done())
        .catch(err => done(err));
    });
  });

  suite('GET /map/utils', () => {
    test('should return a Util list grouped by types that are accessible', done => {
      agent.get(HOST + '/map/utils')
        .send()
        .then(res => {
          expect(res.status).to.be(200);

          expect('pin' in res.body).to.be.ok();
          expect('incident' in res.body).to.be.ok();
          expect('block' in res.body).to.not.be.ok();
          expect(res.body.pin).to.have.length(2);
          expect(res.body.incident).to.have.length(0);

          done();
        })
        .catch(err => done(err));
    });
  });

  suite('POST /map/utils', () => {
    test('should return the created util', done => {
      agent.post(HOST + '/map/utils')
        .send(pin3Form)
        .then(res => {
          expect(res.status).to.be(201);
          expect(res.body.type).to.be(pin3Form.type);
          expect(res.body.location.longitude).to.be(pin3Form.longitude);
          expect(res.body.location.latitude).to.be(pin3Form.latitude);
          expect(res.body.note).to.be(pin3Form.note);
          done();
        })
        .catch(err => done(err));
    });

    test('should return 403 if the user does not have the privilege to create the util', done => {
      agent.post(HOST + '/map/utils')
        .send(blockForm2)
        .then(res => done(new Error(`Got ${res}`)))
        .catch(err => {
          expect(err.status).to.be(403);
          done();
        });
    });

    test('should return 422 if some fields are missing', done => {
      agent.post(HOST + '/map/utils')
        .send(partialForm)
        .then(res => done(new Error(`Got ${res}`)))
        .catch(err => {
          expect(err.status).to.be(422);
          done();
        });
    });

    test('should return 422 if some fields are invalid', done => {
      agent.post(HOST + '/map/utils')
        .send(invalidForm)
        .then(res => done(new Error(`Got ${res}`)))
        .catch(err => {
          expect(err.status).to.be(422);
          done();
        });
    });

    test('should save the created util to the database', done => {
      agent.post(HOST + '/map/utils')
        .send(pin3Form)
        .then(res => UtilDAO.getById(res.body._id))
        .then(util => {
          expect(util).to.be.ok();
          expect(util.type).to.be(pin3Form.type);
          expect(util.location.longitude).to.be(pin3Form.longitude);
          expect(util.location.latitude).to.be(pin3Form.latitude);
          expect(util.note).to.be(pin3Form.note);
          done();
        })
        .catch(err => done(err));
    });
  });

  suite('DELETE /utils/:utilId', () => {
    test('should return 204 on success', done => {
      agent.delete(HOST + '/map/utils/' + pin1_id)
        .then(res => {
          expect(res.status).to.be(204);
          done();
        })
        .catch(err => done(err));
    });

    test('should return 403 if the user does not have the privilege to delete the util', done => {
      agent.delete(HOST + '/map/utils/' + block1_id)
        .then(res => done(new Error(`Got ${res}`)))
        .catch(err => {
          expect(err.status).to.be(403);
          done();
        });
    });

    test('should return 404 if the id is invalid', done => {
      agent.delete(HOST + '/map/utils/5a09924f77b6f95986c4e132')
        .then(res => done(new Error(`Got ${res}`)))
        .catch(err => {
          expect(err.status).to.be(404);
          done();
        });
    });

    test('should delete in the database', done => {
      agent.delete(HOST + '/map/utils/' + pin1_id)
        .catch(err => done(err))
        .then(res => UtilDAO.getById(res.body._id))
        .then(util => done(new Error(`Got ${util}`)))
        .catch(err => done());
    });
  });

  teardown(done => {
    db.teardown(done);
  });
});
