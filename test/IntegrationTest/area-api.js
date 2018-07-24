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
let dbUtil = require('../../util/dbUtil');
let Area = dbUtil.getModel('Area');


let policeChief = {
  username: "policeChief",
  password: "test",
  status: 'OK',
  role: 'PoliceChief',
};

let policeChiefId = null;

suite('Area API', function() {
  suiteSetup(function(done) {
    db.setup(function() {
      done();
    });
  });

  test('Create 3 Areas', function(done) {
   let a = new Area();
    a['name'] = 'Area_1';
    a.save()
    .then( function() {
      let b = new Area();
      b['name'] = 'Area_2';
      return b.save()
    })
    .then( function () {
      let c = new Area();
      c['name'] = 'Area_3';
      return c.save()
    })
    .then( function () {
      done();
    })
  });

  test('Get all areas', done => {
    agent.get(HOST + '/areas')
    .send()
    .end(function (err, res) {
      expect(err).to.be(null);
      expect(res.status).to.be(200);
      expect(res.body.length).to.be(3);
      done();
    });
  });
  
  suiteTeardown(db.teardown);
});

