let expect = require('expect.js');
let agent = require('superagent');

let PORT = 3000;
let HOST = 'http://localhost:' + PORT;

process.env.NODE_ENV = "test";
// Initiate Server
let www = require('../../bin/www');
let db = require('../../util/mockDB');
//let server = app.listen(PORT)

// Populate with a dummy message
suite('Home page', function() {
  suiteSetup(function (done) {
    db.setup(function () {
      done();
    })
  })
  
  test('Get home page html', function(done) {
    agent.get(HOST + '/homepage').send().end(function(err, res){
      expect(err).to.be.equal(null);
      done();
    });
  });

  test('Page doesn\'t exist', function(done) {
    agent.get(HOST + '/yayayayayaya').send().end(function(err, res){
      expect(err).not.to.be.equal(null);
      expect(res.statusCode).to.be.equal(404);
      done();
    });
  });

  suiteTeardown(db.teardown);
});
