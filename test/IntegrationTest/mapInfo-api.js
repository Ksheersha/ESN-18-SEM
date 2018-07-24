let expect = require('expect.js');
let _expect = require('chai').expect;
let agent = require('superagent');

let PORT = 3000;
let HOST = 'http://localhost:' + PORT;

process.env.NODE_ENV = 'test';
// Initiate Server
let www = require('../../bin/www');
let db = require('../../util/mockDB');
// let server = app.listen(PORT)

let user = {
  userName: 'kobebryant',
  passWord: '0824',
  register: 'true',
  status: 'OK',
  role: 'Citizen',
  isActive: false,
  isOnline: false
};

suite('Map Info API', function () {
  suiteSetup(function (done) {
    db.setup(function () {
      done();
    });
  });

  let location = {
    type: 'Point',
    coordinates: [-120.3333, 23.4444]
  };

  test('Update Location Sucess', function (done) {
    // Register a new user
    agent.post(HOST + '/users')
      .send(user)
      .end(function (err, res) {
        // Get user id
        agent.get(HOST + '/users/username/' + user.userName)
          .send()
          .end(function (err, res) {
            let id = res.body.id;
            // Update location
            agent.post(HOST + '/map/' + id + '/location')
              .send(location)
              .end(function (err, res) {
                expect(err).to.be.equal(null);
                expect(res.statusCode).to.be.equal(200);
                // Get user to check new location
                agent.get(HOST + '/users/username/' + user.userName)
                  .send()
                  .end(function (err, res) {
                    let loc = res.body.location;
                    let username = res.body.username;
                    // Check location is right
                    expect(username).to.be.equal(user.userName);
                    _expect(loc).to.deep.equal(location);
                    done();
                  });
              });
          });
      });
  });

  test('Update location fails when giving not exist id', function (done) {
    let id = 'itwrongid';
    agent.post(HOST + '/map/' + id + '/location')
      .send(location)
      .end(function (err, res) {
        expect(err).not.to.be.equal(null);
        expect(res.statusCode).to.be.equal(500);
        done();
      });
  });

  test('Update phone number sucess', function (done) {
    let phone = {phoneNumber: '123 456 7890'};
    // Register a new user
    agent.post(HOST + '/users')
      .send(user)
      .end(function (err, res) {
        // Get user id
        agent.get(HOST + '/users/username/' + user.userName)
          .send()
          .end(function (err, res) {
            let id = res.body.id;
            // Update phone number
            agent.post(HOST + '/map/' + id + '/phone').send(phone)
              .end(function (err, res) {
                expect(err).to.be.equal(null);
                expect(res.statusCode).to.be.equal(200);
                // Get user to check phone number
                agent.get(HOST + '/users/username/' + user.userName)
                  .send()
                  .end(function (err, res) {
                    let p = res.body.phoneNumber;
                    let username = res.body.username;
                    // Check phone number is right
                    expect(username).to.be.equal(user.userName);
                    expect(p).to.be.equal(phone.phoneNumber);
                    done();
                  });
              });
          });
      });
  });

  test('Update phone number fails when missing phone number', function (done) {
    let phone = {};
    // Get user id
    agent.get(HOST + '/users/username/' + user.userName)
      .send()
      .end(function (err, res) {
        let id = res.body.id;
        // Update phone number
        agent.post(HOST + '/map/' + id + '/phone')
          .send(phone)
          .end(function (err, res) {
            expect(err).not.to.be.equal(null);
            expect(res.statusCode).to.be.equal(500);
            done();
          });
      });
  });

  test('Update phone number fails when giving not exist id', function (done) {
    let phone = '123 456 7890';
    let id = 'itwrongid';
    agent.post(HOST + '/map/' + id + '/phone')
      .send(phone)
      .end(function (err, res) {
        expect(err).not.to.be.equal(null);
        expect(res.statusCode).to.be.equal(500);
        done();
      });
  });

  test('Get Map Information', function (done) {
    let message = {
      username: 'kobebryant', content: 'Give me the god damn ball!!', status: 'EMERGENCY'
    };
    // Register a new user
    agent.post(HOST + '/users')
      .send(user)
      .end(function (err, res) {
        agent.get(HOST + '/users/username/' + user.userName)
          .send()
          .end(function (err, res) {
            message['uid'] = res.body.id;
            agent.post(HOST + '/messages/public')
              .send(message)
              .end(function (err, res) {
                agent.get(HOST + '/map')
                  .send()
                  .end(function (err, res) {
                    expect(err).to.be.equal(null);
                    expect(res.statusCode).to.be.equal(200);
                    let info = null;
                    for (let i in res.body) {
                      if (res.body[i].username == user.userName) {
                        info = res.body[i];
                        break;
                      }
                    }
                    expect(info).not.to.be.equal(null);
                    expect(info.username).to.be.equal(user.userName);
                    expect(info.content).to.be.equal(message.content);
                    done();
                  });
              });
          });
      });
  });

  suiteTeardown(db.teardown);
});
