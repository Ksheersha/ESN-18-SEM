const expect = require('expect.js');

const db = require('../../util/mockDB');
const UtilDAO = require('../../util/dao/utilDAO');

const defaultUtil = {
  type: 'pin',
  location: {latitude: -78.2, longitude: 123.5},
  note: 'Building 19 On Fire'
};

const altUtil = {
  type: 'block',
  location: {latitude: 68.2, longitude: -33.5},
  note: 'Building 23 On Fire'
};

const noType = {
  location: {latitude: -78.2, longitude: 123.5},
  note: 'Building 19 On Fire'
};

const noLocation = {
  type: 'pin',
  note: 'Building 19 On Fire'
};

const noLatitude = {
  type: 'pin',
  location: {longitude: 123.5},
  note: 'Building 19 On Fire'
};

const noLongitude = {
  type: 'pin',
  location: {latitude: -78.2},
  note: 'Building 19 On Fire'
};

// const noNote = {
//   type: 'pin',
//   location: {latitude: -78.2, longitude: 123.5}
// };

function expectUtil (actual, expectedUtil) {
  expect(actual.id).to.be.ok();
  expect(actual.type).to.be(expectedUtil.type);
  expect(actual.location.longitude).to.be(expectedUtil.location.longitude);
  expect(actual.location.latitude).to.be(expectedUtil.location.latitude);
  expect(actual.note).to.be(expectedUtil.note);
}

suite('Util Unit Tests', () => {
  setup(done => {
    db.setup(done);
  });

  suite('#create()', () => {
    test('should return an Util object with an id on success', done => {
      UtilDAO.create(defaultUtil)
        .then(util => {
          expectUtil(util, defaultUtil);
          done();
        })
        .catch(err => done(err));
    });

    test('should save to the database', done => {
      UtilDAO.create(defaultUtil)
        .then(util => UtilDAO.getById(util.id))
        .then(util => {
          expectUtil(util, defaultUtil);
          done();
        })
        .catch(err => done(err));
    });

    test('should throw an error if some fields are missing', done => {
      const partialUtils = [
        noType,
        noLocation,
        noLatitude,
        noLongitude
      ];
      // Note isn't required anymore, and therefore isn't tested
      let promises = [];

      for (let partialUtil of partialUtils) {
        let promise = UtilDAO.create(partialUtil).then(
          util => expect().fail(`Got ${util}`),
          err => {});
        promises.push(promise);
      }

      Promise.all(promises)
        .then(() => done())
        .catch(err => done(err));
    });
  });

  suite('#getById()', () => {
    test('should return the corresponding object when the id is valid', done => {
      UtilDAO.create(defaultUtil)
        .then(util => UtilDAO.getById(util.id))
        .then(util => {
          expectUtil(util, defaultUtil);
          done();
        })
        .catch(err => done(err));
    });

    test('should throw an error if the id is invalid', done => {
      UtilDAO.getById('5a09924f77b6f95986c4e132')
        .then(util => done(new Error(`Got ${util}`)))
        .catch(err => done());
    });
  });

  suite('#getByTypes()', () => {
    test('should return an empty list at initialization', done => {
      UtilDAO.getByTypes()
        .then(utils => {
          expect(utils).to.be.empty();
          done();
        })
        .catch(err => done(err));
    });

    test('should return a list of certain kinds of utils', done => {
      UtilDAO.create(defaultUtil)
        .then(() => UtilDAO.create(altUtil))
        .then(() => UtilDAO.getByTypes([defaultUtil.type]))
        .then(utils => {
          expect(utils).to.have.length(1);
          expectUtil(utils[0], defaultUtil);
          done();
        })
        .catch(err => done(err));
    });
  });

  suite('#getByType()', () => {
    test('should return a list of a certain kind of utils', done => {
      UtilDAO.create(defaultUtil)
        .then(() => UtilDAO.create(altUtil))
        .then(() => UtilDAO.getByType(altUtil.type))
        .then(utils => {
          expect(utils).to.have.length(1);
          expectUtil(utils[0], altUtil);
          done();
        })
        .catch(err => done(err));
    });
  });

  suite('#update()', () => {
    test('should return an updated Util object on success', done => {
      UtilDAO.create(defaultUtil)
        .then(util => UtilDAO.update(util.id, altUtil))
        .then(util => {
          expectUtil(util, altUtil);
          done();
        })
        .catch(err => done(err));
    });

    test('should throw an error if the id is invalid', done => {
      UtilDAO.update('5a09924f77b6f95986c4e132', altUtil)
        .then(util => done(new Error(`Got ${util}`)))
        .catch(err => done());
    });

    test('should update the database', done => {
      let id = null;

      UtilDAO.create(defaultUtil)
        .then(util => {
          id = util.id;
          return UtilDAO.update(id, altUtil);
        })
        .then(() => UtilDAO.getById(id))
        .then(util => {
          expectUtil(util, altUtil);
          done();
        })
        .catch(err => done(err));
    });
  });

  suite('#remove()', () => {
    test('should throw an error if the id is invalid', done => {
      UtilDAO.remove('5a09924f77b6f95986c4e132')
        .then(util => done(new Error(`Got ${util}`)))
        .catch(err => done());
    });

    test('should update the database', done => {
      UtilDAO.create(defaultUtil)
        .then(util => UtilDAO.remove(util.id))
        .then(() => UtilDAO.getByType(defaultUtil.type))
        .then(utils => {
          expect(utils).to.be.empty();
          done();
        })
        .catch(err => done(err));
    });
  });

  teardown(done => {
    db.teardown(done);
  });
});
