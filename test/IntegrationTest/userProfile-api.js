let expect = require('expect.js');
let agent = require('superagent');

let PORT = 3000;
let HOST = 'http://localhost:' + PORT;

process.env.NODE_ENV = "test";
// Initiate Server
let www = require('../../bin/www');
let db = require('../../util/mockDB');

let user = {
  userName: "test",
  passWord: "test",
  register: "true",
  role:'Citizen',
  isActive: true,
  isOnline: false
};
let userId;
suite('User Profile API', function() {
  suiteSetup(function (done) {
    db.setup(function () {
      done();
    })
  })
    test('Add a New User', function(done) {
    agent.post(HOST+'/users')
    .send(user)
    .end(function(err, res){
      expect(err).to.be.equal(null);
      expect(res.statusCode).to.be.equal(201);
      agent.get(HOST+'/users/username/' + user.userName)
      .send()
      .end(function(err, res) {
        userId = res.body.id;
        done();
      });
    });
  });

  /* Personal information Integration tests */
  test('Add personal info', function(done) {
    let personalInfo = {
      userId: userId,
      name: "CMU Silicon Valley",
      dob: "2002-01-01",
      sex: 1,
      address: "Building 23, NASA Research Park, Moffett Field, CA 94035", 
      phoneNumber: "(650) 335-2800", 
      email: "test@test.com"
    };
    agent.post(HOST + "/profile/personalInfo")
    .send(personalInfo)
    .end(function(err, res) {
      expect(err).to.be.equal(null);
      expect(res.statusCode).to.be.equal(200);
      done();
    });
  });

  test('Update personal info', function(done) {
    let personalInfo = {
      userId: userId,
      name: "CMU Silicon Valley",
      dob: "2002-01-01",
      sex: 1,
      address: "Building 23, NASA Research Park, Moffett Field, CA 94035", 
      phoneNumber: "(650) 335-2800", 
      email: "test@test.com"
    };
    agent.post(HOST + "/profile/personalInfo")
    .send(personalInfo)
    .end(function(err, res) {
      expect(err).to.be.equal(null);
      expect(res.statusCode).to.be.equal(200);
      done();
    });
  });

  test('Save personal info with fake ID', function(done) {
    let personalInfo = {
      userId: "1234567890asdfghjkl",
      name: "CMU Silicon Valley",
      dob: "2002-01-01",
      sex: 1,
      address: "Building 23, NASA Research Park, Moffett Field, CA 94035", 
      phoneNumber: "(650) 335-2800", 
      email: "test@test.com"
    };
    agent.post(HOST + "/profile/personalInfo")
    .send(personalInfo)
    .end(function(err, res) {
      expect(err).not.to.be.equal(null);
      expect(res.statusCode).to.be.equal(500);
      done();
    });
  });

  test('Get personal info', function(done) {
    let personalInfo = {
      userId: userId,
      name: "CMU Silicon Valley",
      dob: "2002-01-01",
      sex: 1,
      address: "Building 23, NASA Research Park, Moffett Field, CA 94035", 
      phoneNumber: "(650) 335-2800", 
      email: "test@test.com"
    };
    agent.get(HOST + "/profile/personalInfo/" + userId)
    .send()
    .end(function(err, res) {
      expect(err).to.be.equal(null);
      expect(res.statusCode).to.be.equal(200);
      let user = res.body;
      expect(user.name).to.be.equal(personalInfo.name);
      expect(user.address).to.be.equal(personalInfo.address);
      expect(user.phoneNumber).to.be.equal(personalInfo.phoneNumber);
      expect(user.email).to.be.equal(personalInfo.email);
      expect(user.sex).to.be.equal(personalInfo.sex);      
      done();
    });
  });

  test('Get personal info with fake ID', function(done) {
    let personalInfo = {
      userId: "1234567890asdfghjkl",
    };
    agent.get(HOST + "/profile/personalInfo/" + personalInfo.userId)
    .send()
    .end(function(err, res) {
      expect(err).not.to.be.equal(null);
      expect(res.statusCode).to.be.equal(500);
      done();
    });
  });

  /* Medical information Integration tests */
  test('Add Medical info', function(done) {
    let medicalInfo = {
      userId: userId,
      medCondition: "diabetic",
      medDrugs: "claritin, insulin",
      medAllergies: "cats"
    };
    agent.post(HOST + "/profile/medicalInfo")
    .send(medicalInfo)
    .end(function(err, res) {
      expect(err).to.be.equal(null);
      expect(res.statusCode).to.be.equal(200);
      done();
    });
  });

  test('Update medical info', function(done) {
    let medicalInfo = {
      userId: userId,
      medCondition: "diabetic1",
      medDrugs: "claritin",
      medAllergies: "cats and dogs"
    };
    agent.post(HOST + "/profile/medicalInfo")
    .send(medicalInfo)
    .end(function(err, res) {
      expect(err).to.be.equal(null);
      expect(res.statusCode).to.be.equal(200);
      done();
    });
  });

  test('Save medical info with fake ID', function(done) {
    let medicalInfo = {
      userId: "1234567890asdfghjkl",
      medCondition: "diabetic1",
      medDrugs: "claritin",
      medAllergies: "cats and dogs"
    };
    agent.post(HOST + "/profile/medicalInfo")
    .send(medicalInfo)
    .end(function(err, res) {
      expect(err).not.to.be.equal(null);
      expect(res.statusCode).to.be.equal(500);
      done();
    });
  });

  test('Get medical info', function(done) {
    let medicalInfo = {
      userId: userId,
      medCondition: "diabetic1",
      medDrugs: "claritin",
      medAllergies: "cats and dogs"
    };
    agent.get(HOST + "/profile/medicalInfo/" + medicalInfo.userId)
    .send()
    .end(function(err, res) {
      expect(err).to.be.equal(null);
      expect(res.statusCode).to.be.equal(200);
      let medInfo = res.body;
      expect(medInfo.medCondition).to.be.equal(medicalInfo.medCondition);
      expect(medInfo.medDrugs).to.be.equal(medicalInfo.medDrugs);
      expect(medInfo.medAllergies).to.be.equal(medicalInfo.medAllergies);
      done();
    });
  });

  test('Get medical info with fake ID', function(done) {
    let medicalInfo = {
      userId: "1234567890asdfghjkl",
    };
    agent.get(HOST + "/profile/medicalInfo/" + medicalInfo.userId)
    .send()
    .end(function(err, res) {
      expect(err).not.to.be.equal(null);
      expect(res.statusCode).to.be.equal(500);
      done();
    });
  });

  /* Emergency Contact Integration tests */
  test('Add Emergency Contact info', function(done) {
    let emergencyContact = [{
      name: "bob",
      phoneNumber: "1234567890",
      email: "bob@email.com"
    }];
    let body = {'emergencyContacts' : emergencyContact};
    agent.post(HOST + "/profile/emergencyContacts/" + userId)
    .send(body)
    .end(function(err, res) {
      expect(err).to.be.equal(null);
      expect(res.statusCode).to.be.equal(200);
      done();
    });
  });

  test('Update Emergency Contact info', function(done) {
    let emergencyContacts = [
      {
        name: "bob1",
        phoneNumber: "1234567891",
        email: "bob1@cmu.edu"
      },
      {
        name: "bob2",
        phoneNumber: "1234567892",
        email: "bob2@cmu.edu"
      }
    ];
    let body = {'emergencyContacts' : emergencyContacts};
    agent.post(HOST + "/profile/emergencyContacts/" + userId)
    .send(body)
    .end(function(err, res) {
      expect(err).to.be.equal(null);
      expect(res.statusCode).to.be.equal(200);
      done();
    });
  });

  test('Save Emergency Contact info with fake ID', function(done) {
    let badId = "1234567890asdfghjkl";
    let emergencyContact = [{
      name: "bob1",
      phoneNumber: "1234567891",
      email: "bob1@email.com"
    }];
    agent.post(HOST + "/profile/emergencyContacts/" + badId)
    .send(emergencyContact)
    .end(function(err, res) {
      expect(err).not.to.be.equal(null);
      expect(res.statusCode).to.be.equal(500);
      done();
    });
  });

  test('Get Emergency Contact info', function(done) {
    let emergencyContacts = [
      {
        name: "bob1",
        phoneNumber: "1234567891",
        email: "bob1@cmu.edu"
      },
      {
        name: "bob2",
        phoneNumber: "1234567892",
        email: "bob2@cmu.edu"
      }
    ];
    agent.get(HOST + "/profile/emergencyContacts/" + userId)
    .send()
    .end(function(err, res) {
      expect(err).to.be.equal(null);
      expect(res.statusCode).to.be.equal(200);
      let eContacts = res.body;
      expect(eContacts[0].name).to.be.equal(emergencyContacts[0].name);
      expect(eContacts[0].phoneNumber).to.be.equal(emergencyContacts[0].phoneNumber);
      expect(eContacts[0].email).to.be.equal(emergencyContacts[0].email);
      expect(eContacts[1].name).to.be.equal(emergencyContacts[1].name);
      expect(eContacts[1].phoneNumber).to.be.equal(emergencyContacts[1].phoneNumber);
      expect(eContacts[1].email).to.be.equal(emergencyContacts[1].email);
      done();
    });
  });

  test('Get Emergency Contact info with fake ID', function(done) {
    let badId = "1234567890asdfghjkl";
    agent.get(HOST + "/profile/emergencyContacts/" + badId)
    .send()
    .end(function(err, res) {
      expect(err).not.to.be.equal(null);
      expect(res.statusCode).to.be.equal(500);
      done();
    });
  });

  suiteTeardown(db.teardown);
});
