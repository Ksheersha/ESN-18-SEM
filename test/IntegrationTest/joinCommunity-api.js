let expect = require('expect.js');
let agent = require('superagent');
let HTTPStatus = require('http-status');

let PORT = 3000;
let HOST = 'http://localhost:' + PORT;

process.env.NODE_ENV = 'test';
// Initiate Server
let www = require('../../bin/www');
let db = require('../../util/mockDB');

// Populate with a dummy message
suite('Join Community API', function () {
  suiteSetup(function (done) {
    db.setup(function () {
      done();
    })
  });

  test('Add a New User', function (done) {
    // Dummy User
    let user = {
      userName: 'bigboss',
      passWord: '1234567',
      register: 'true',
      role: 'Citizen',
    };
    // Register a new user
    agent.post(HOST + '/users').send(user).end(function (err, res) {
      expect(err).to.be.equal(null);
      expect(res.statusCode).to.be.equal(201);
      done();
    });
  });

  test('Register fail by missing password', function (done) {
    // Dummy User
    let user = {
      userName: '19ma',
      register: 'true',
      status: 'OK',
      role: 'Citizen',
      isActive: false,
      isOnline: false,
    };
    // Register a new user
    agent.post(HOST + '/users').send(user).end(function (err, res) {
      expect(err).not.to.be.equal(null);
      expect(res.statusCode).to.be.equal(403);
      done();
    });
  });

  test('Register fail by not clicking confirm', function (done) {
    // Dummy User
    let user = {
      userName: 'trump',
      passWord: '1234',
      register: 'false',
    };
    // Register a new user
    agent.post(HOST + '/users').send(user).end(function (err, res) {
      expect(err).not.to.be.equal(null);
      expect(res.statusCode).to.be.equal(401);
      done();
    });
  });

  test('Login as a User', function (done) {
    // Dummy User
    let user = {
      userName: 'bigboss',
      passWord: '1234567',
    };
    // Register a new user
    agent.post(HOST + '/users').send(user).end(function (err, res) {
      expect(err).to.be.equal(null);
      expect(res.statusCode).to.be.equal(200);
      done();
    });
  });

  test('Login with wrong password', function (done) {
    // Dummy User
    let user = {
      userName: 'bigboss',
      passWord: '7654321',
    };
    // Register a new user
    agent.post(HOST + '/users').send(user).end(function (err, res) {
      expect(err).not.to.be.equal(null);
      expect(res.statusCode).to.be.equal(400);
      done();
    });
  });

  test('Get all users', function (done) {
    // Dummy User
    let user = {
      userName: 'bigboss',
      passWord: '1234567',
      register: 'true',
    };
    // Get user list
    agent.get(HOST + '/users').send().end(function (err, res) {
      let size = res.body.length;
      expect(err).to.be.equal(null);
      expect(res.statusCode).to.be.equal(200);
      // expect(res.body).to.deep.include(user);
      expect(res.body).not.to.be.equal(null);
      res.body.forEach(function (u) {
        if (u.username === user.userName) {
          done();
        }
      });
      expect(true).to.be.equal(false);
    });
  });

  test('Search users', function (done) {
    // Dummy User
    let user = {
      userName: 'bigboss',
      passWord: '1234567',
      register: 'true',
    };
    // Get user list
    agent.get(HOST + '/users?keywords=big').send().end(function (err, res) {
      let size = res.body.length;
      expect(err).to.be.equal(null);
      expect(res.statusCode).to.be.equal(200);
      let result = {
        'username': 'bigboss',
        'password': '1234567',
        'role': 'Citizen',
        'status': 'undefined',
        'isOnline': true,
        'isActive': true,
      };
      res.body.forEach(function (u) {
        if (u.username === user.userName) {
          done();
        }
      });
      expect(true).to.be.equal(false);
      // expect(res.body).to.deep.include(result);
      //expect(res.body[size-1].username).to.be.equal(user.userName);
      done();
    });
  });

  test('Search users by status', function (done) {
    // Dummy User
    let user = {
      userName: 'bigboss',
      passWord: '1234567',
      register: 'true',
    };
    // Get user list
    agent.get(HOST + '/users?keywords=ok').send().end(function (err, res) {
      let size = res.body.length;
      expect(err).to.be.equal(null);
      expect(res.statusCode).to.be.equal(200);
      //expect(size).to.be.equal(1);
      done();
    });
  });

  test('Get specific user by username', function (done) {
    // Dummy User
    let user = {
      userName: 'bigboss',
      passWord: '1234567',
      register: 'true',
    };
    // Get a specific user info
    agent.get(HOST + '/users/username/' + user.userName).send().end(function (err, res) {
      expect(err).to.be.equal(null);
      expect(res.statusCode).to.be.equal(200);
      expect(res.body.username).to.be.equal(user.userName);
      done();
    });
  });

  test('Fail to get user info by giving no-exist username', function (done) {
    // Get a specific user info
    agent.get(HOST + '/users/username/' + 'invalid').send().end(function (err, res) {
      expect(err).not.to.be.equal(null);
      expect(res.statusCode).to.be.equal(404);
      done();
    });
  });

  test('Logout redirects to home', (done) => {
    agent.get(HOST + '/logout').end((err, res) => {
      expect(res.statusCode).to.be(200);
      done();
    });
  });

  suiteTeardown(function (done) {
    db.teardown(done);
  })
});

/**
 * This test suite clears and reload the db between every test
 */
let testCitizen1 = {
  username: 'testCitizen1',
  password: '1234',
  register: 'true',
  role: 'Citizen'
};

let testCitizen2 = {
  username: 'testCitizen2',
  password: '1234',
  register: 'true',
  role: 'Citizen'
};

let testResponder1 = {
  username: 'testResponder1',
  password: '1234',
  register: 'true',
  role: 'Firefighter'
};

let testResponder2 = {
  username: 'testResponder2',
  password: '1234',
  register: 'true',
  role: 'Dispatcher'
};

suite('Join Community API, v2', function () {
  suiteSetup(function (done) {
    db.setup(function () {
      let User = db.dbUtil.getModel('User');
      Promise.all([
        User.create(testCitizen1),
        User.create(testCitizen2),
        User.create(testResponder1),
        User.create(testResponder2),
      ]).then(() => {
        done();
      })
        .catch(err => done(err));
    })
  });


  test('Get user list by role, citizen', (done) => {
    agent
    .get(HOST + '/users/contacts/role/Citizen').then((res) => {
      expect(res.statusCode).to.be(HTTPStatus.OK);
      let userlist = res.body;

      expect(userlist.length).to.be(2);
      expect(userlist[0].username).to.contain('Citizen');
      expect(userlist[1].username).to.contain('Citizen');
      done();
    }).catch(err => {
      done(err);
    });
  });

  test('Get user list by role, responder', (done) => {
    agent
    .get(HOST + '/users/contacts/role/Firefighter').then((res) => {
      expect(res.statusCode).to.be(HTTPStatus.OK);
      let userlist = res.body;
      expect(userlist.length).to.be(2);
      expect(userlist[0].username).to.contain('Responder');
      expect(userlist[1].username).to.contain('Responder');
      done();
    }).catch(err => {
      done(err);
    });
  });

  test('Get user list by role, Admin', (done) => {
    agent
    .get(HOST + '/users/contacts/role/Administrator').then((res) => {
      expect(res.statusCode).to.be(HTTPStatus.OK);
      let userlist = res.body;
      expect(userlist.length).to.be(4);
      done();
    }).catch(err => {
      done(err);
    });
  });

  suiteTeardown(db.teardown);
});


