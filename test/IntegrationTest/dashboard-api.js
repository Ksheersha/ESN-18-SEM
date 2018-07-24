let expect = require('expect.js');
let agent = require('superagent');

let PORT = 3000;
let HOST = 'http://localhost:' + PORT;

process.env.NODE_ENV = 'test';
// Initiate Server
let www = require('../../bin/www');
let db = require('../../util/mockDB');
let dbUtil = require('../../util/dbUtil');

suite('Dashboard API', function () {
  suiteSetup(function (done) {
    db.setup(function () {
      done();
    });
  });

  test('Get charts for dashboard', function (done) {
    agent.get(HOST + '/dashboard/dispatcher')
      .send()
      .end(function (err, res) {
        expect(err).to.be(null);
        expect(res.statusCode).to.be.equal(200);
        done();
      });
  });


  suiteTeardown(db.teardown);
});
