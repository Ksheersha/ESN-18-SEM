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
suite('Join page', function() {
  suiteSetup(function (done) {
    db.setup(function () {
      done();
    })
  })
  
  test('Get join page html', function(done) {
    agent.get(HOST + '/').send().end(function(err, res){
      expect(err).to.be.equal(null);
      done();
    });
  });
  
  suiteTeardown(db.teardown);
});
