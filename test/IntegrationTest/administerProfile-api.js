let expect = require('expect.js');
let agent = require('superagent');

let PORT = 3000;
let HOST = 'http://localhost:' + PORT;

process.env.NODE_ENV = "test";
// Initiate Server
let www = require('../../bin/www');
let db = require('../../util/mockDB');
let dbUtil = require('../../util/dbUtil');
let User = dbUtil.getModel('User');

let user = {
  userName: "test",
  passWord: "test",
  role:"Administrator",
  register: "true",
  isActive:true
};
// Populate with a dummy message
suite('Administer Profile API', function() {
  suiteSetup(function (done) {
    db.setup(function () {
      done();
    })
  })

  test('Set user profile', function(done) {
    this.timeout(5000);
    agent.post(HOST+'/users')
    .send(user)
    .end(function (err,res) {
      expect(err).to.be.equal(null);
      expect(res.statusCode).to.be.equal(201);
      agent.get(HOST+'/users')
      .send()
      .end(function (err,res) {
        expect(err).to.be.equal(null);
        expect(res.statusCode).to.be.equal(200);

        let id = res.body[0]._id; //esnadmin ID
        let data ={
          username : "rkzai",
          password: "test",
          role:User.roleType.CITIZEN,
          isCoordinator: false,
          isActive:false
        };
        clients_list.push({'id':id, "Socket":io});
        agent.post(HOST+'/users/id/'+id)
        .send(data)
        .end(function (err,res) {
          expect(err).to.be.equal(null);
          expect(res.statusCode).to.be.equal(200);

          agent.get(HOST + '/users/id/'+id)
          .send()
          .end(function (err,res) {
            expect(err).to.be.equal(null);
            expect(res.statusCode).to.be.equal(200);
            expect(res.body.username).to.be.equal(data.username);
            expect(res.body.role).to.be.equal(data.role);
            expect(res.body.isCoordinator).to.be.equal(data.isCoordinator);
            expect(res.body.isActive).to.be.equal(data.isActive);
            done();
          });
        });
      });
    });
  });

  suiteTeardown(db.teardown);
});
