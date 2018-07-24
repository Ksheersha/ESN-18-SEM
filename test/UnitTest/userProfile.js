let expect = require('expect.js');

process.env.NODE_ENV = "test";
let db = require('../../util/mockDB');

let UserDAO = require('../../util/dao/userDAO').UserDAO;
let UserProfileDAO = require('../../util/dao/userProfileDAO');
let dbUtil = require('../../util/dbUtil');
let User = dbUtil.getModel('User');
let UserPersonal = dbUtil.getModel('UserPersonal');

let id;

suite('User Profile Unit Tests', function() {
  suiteSetup(function (done) {
    db.setup(function () {
      done();
    })
  })
  
  // testing personal profile
  test('Add all personal info', function(done) {
    let user = {
      username: "test123",
      password: "1234",
      register: "true",
      status: "OK",
      role:'Citizen',
      isActive: false,
      isOnline: false
    };

    let personalInfo = {
      name: "CMU Silicon Valley",
      dob: "2002-01-01",
      sex: UserPersonal.sex.MALE,
      address: "Building 23, NASA Research Park, Moffett Field, CA 94035",
      phoneNumber: "(650) 335-2800",
      email: "test@test.com"
    };

    UserDAO.addUser(user)
    .then(function(user) {
      id = user._id;
      personalInfo['userId'] = user._id;
      UserProfileDAO.savePersonalInfo(personalInfo)
      .then(function(userInfo) {
        expect(userInfo.name).to.equal('CMU Silicon Valley');
        expect(userInfo.dob).to.eql(new Date('2002-01-01'));
        expect(userInfo.sex).to.equal(UserPersonal.sex.MALE);
        expect(userInfo.address).to.equal('Building 23, NASA Research Park, Moffett Field, CA 94035');
        expect(userInfo.phoneNumber).to.equal('(650) 335-2800');
        expect(userInfo.email).to.equal('test@test.com');
        done();
      });
    });
  });

  test('Edit personal info', function(done) {
    let personalInfo = {
      userId: id,
      name: "CMU Silicon Valley",
      dob: "2002-01-01",
      sex: UserPersonal.sex.FEMALE,
      address: "Building 23, NASA Research Park, Moffett Field, CA 94035",
      phoneNumber: "(098) 765-4321",
      email: "cmu@cmu.com"
    };

    UserProfileDAO.savePersonalInfo(personalInfo)
    .then(function(userInfo) {
      expect(userInfo.name).to.equal('CMU Silicon Valley');
      expect(userInfo.dob).to.eql(new Date('2002-01-01'));
      expect(userInfo.sex).to.equal(UserPersonal.sex.FEMALE);
      expect(userInfo.address).to.equal('Building 23, NASA Research Park, Moffett Field, CA 94035');
      expect(userInfo.phoneNumber).to.equal('(098) 765-4321');
      expect(userInfo.email).to.equal('cmu@cmu.com');
      done();
    });
  });

  test('Wrong id for saving personal info', function(done) {
    let personalInfo = {
      userId: "1234567890asdfghjkl"
    };

    UserProfileDAO.savePersonalInfo(personalInfo)
    .then()
    .catch(function(err) {
      expect(err).not.to.be.equal(null);
      done();
    })
  });

  test('Get personal info', function(done) {
    UserProfileDAO.getPersonalInfo(id)
    .then(function(userInfo) {
      expect(userInfo.name).to.equal('CMU Silicon Valley');
      expect(userInfo.dob).to.eql(new Date('2002-01-01'));
      expect(userInfo.sex).to.equal(UserPersonal.sex.FEMALE);
      expect(userInfo.address).to.equal('Building 23, NASA Research Park, Moffett Field, CA 94035');
      expect(userInfo.phoneNumber).to.equal('(098) 765-4321');
      expect(userInfo.email).to.equal('cmu@cmu.com');
      done();
    });
  });

  test('Wrong id for getting personal info', function(done) {
    let userId = "1234567890asdfghjkl";

    UserProfileDAO.getPersonalInfo(userId)
    .then()
    .catch(function(err) {
      expect(err).not.to.be.equal(null);
      done();
    })
  });

  // testing med stuff
  test('Add medical info', function(done) {
    let medicalInfo = {
      userId: id,
      medCondition: "diabetic",
      medDrugs: "claritin, insulin",
      medAllergies: "cats"
    };

    UserProfileDAO.saveMedicalInfo(medicalInfo)
    .then(function(userInfo) {
      expect(userInfo.medCondition).to.equal('diabetic');
      expect(userInfo.medDrugs).to.equal('claritin, insulin');
      expect(userInfo.medAllergies).to.equal('cats');
      done();
    });
  });

  test('Edit medical info', function(done) {
    let medicalInfo = {
      userId: id,
      medCondition: "epileptic",
      medDrugs: "none",
      medAllergies: "none"
    };

    UserProfileDAO.saveMedicalInfo(medicalInfo)
    .then(function(userInfo) {
      expect(userInfo.medCondition).to.not.be.equal('diabetic');
      expect(userInfo.medDrugs).to.not.be.equal('claritin, insulin');
      expect(userInfo.medAllergies).to.not.be.equal('cats');
      done();
    });
  });

  test('Wrong id for medical info', function(done) {
    let medicalInfo = {
      userId: "1234567890asdfghjkl"
    };

    UserProfileDAO.saveMedicalInfo(medicalInfo)
    .then()
    .catch(function(err) {
      expect(err).not.to.be.equal(null);
      done();
    })
  });

  test('Get medical info', function(done) {
    UserProfileDAO.getMedicalInfo(id)
    .then(function(userInfo) {
      expect(userInfo.medCondition).to.equal('epileptic');
      expect(userInfo.medDrugs).to.equal('none');
      expect(userInfo.medAllergies).to.equal('none');
      done();
    });
  });

  test('Wrong id for getting medical info', function(done) {
    let userId = "1234567890asdfghjkl";

    UserProfileDAO.getMedicalInfo(userId)
    .then()
    .catch(function(err) {
      expect(err).not.to.be.equal(null);
      done();
    })
  });

  // testing emergency contact helper functions
  test('Create new Emergency Contact Info', function (done) {
    let emergencyContact = {
      name: "bob",
      phoneNumber: "1234567890",
      email: "bob@cmu.edu"
    };

    let contactInfo = UserProfileDAO.newEmergencyContactInfo(emergencyContact)
    expect(contactInfo.name).to.equal('bob');
    expect(contactInfo.phoneNumber).to.equal('1234567890');
    expect(contactInfo.email).to.equal('bob@cmu.edu');
    done();
  });

  test('Create new Emergency Contacts for user', function (done) {
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

    UserProfileDAO.createNewEmergencyContactsForUser(id, emergencyContacts)
    .then(function(savedEmergencyContacts) {
      expect(savedEmergencyContacts.length).to.be(2);
      expect(savedEmergencyContacts[0].name).to.equal(emergencyContacts[0].name);
      expect(savedEmergencyContacts[0].phoneNumber).to.equal(emergencyContacts[0].phoneNumber);
      expect(savedEmergencyContacts[0].email).to.equal(emergencyContacts[0].email);
      expect(savedEmergencyContacts[1].name).to.equal(emergencyContacts[1].name);
      expect(savedEmergencyContacts[1].phoneNumber).to.equal(emergencyContacts[1].phoneNumber);
      expect(savedEmergencyContacts[1].email).to.equal(emergencyContacts[1].email);
      User.findOne({_id: id}, "emergencyContacts")
      .then(function (user) {
        expect(user.emergencyContacts.length).to.be(2);
        done();
      })
    });
  });

  test('Wrong id for create new Emergency Contacts for user', function (done) {
    let badId = "1234567890asdfghjkl";

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

    UserProfileDAO.createNewEmergencyContactsForUser(badId, emergencyContacts)
    .then()
    .catch(function(err) {
      expect(err).not.to.be.equal(null);
      done();
    });
  });

  test('Delete all Emergency Contacts for user', function (done) {
    UserProfileDAO.deleteAllEmergencyContactsForUser(id)
    .then(function(user) {
      expect(user.emergencyContacts.length).to.be(0);
      done();
    })
  });

   test('Wrong id for delete all Emergency Contacts for user', function (done) {
    let badId = "1234567890asdfghjkl";

    UserProfileDAO.deleteAllEmergencyContactsForUser(badId)
    .then()
    .catch(function(err) {
      expect(err).not.to.be.equal(null);
      done();
    });
  });

  // testing single emergency contact
  test('Add 1 Emergency Contact', function (done) {
    let emergencyContact = [{
      name: "bob",
      phoneNumber: "1234567890",
      email: "bob@cmu.edu"
    }];

    UserProfileDAO.saveEmergencyContacts(id, emergencyContact)
    .then(function(savedEmergencyContacts) {
      expect(savedEmergencyContacts.length).to.be(1);
      expect(savedEmergencyContacts[0].name).to.equal('bob');
      expect(savedEmergencyContacts[0].phoneNumber).to.equal('1234567890');
      expect(savedEmergencyContacts[0].email).to.equal('bob@cmu.edu');
      done();
    });
  });

  test('Edit Emergency Contact', function (done) {
    let emergencyContact = [{
      name: "bob1",
      phoneNumber: "1234567891",
      email: "bob1@cmu.edu"
    }];

    UserProfileDAO.saveEmergencyContacts(id, emergencyContact)
    .then(function(savedEmergencyContacts) {
      expect(savedEmergencyContacts.length).to.be(1);
      expect(savedEmergencyContacts[0].name).to.equal('bob1');
      expect(savedEmergencyContacts[0].phoneNumber).to.equal('1234567891');
      expect(savedEmergencyContacts[0].email).to.equal('bob1@cmu.edu');
      done();
    }, function(err) {
      done();
    });
  });
  
  test('Wrong id for getting Emergency Contact', function(done) {
    let badId = "1234567890asdfghjkl";
        
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

    UserProfileDAO.saveEmergencyContacts(badId, emergencyContacts)
    .then(function(userInfo) {
    })
    .catch(function(err) {
      expect(err).not.to.be.equal(null);
      done();
    })
  });

  test('Get Emergency Contact', function (done) {
    UserProfileDAO.getAllEmergencyContacts(id)
    .then(function(userInfo) {
      expect(userInfo[0].name).to.equal('bob1');
      expect(userInfo[0].phoneNumber).to.equal('1234567891');
      expect(userInfo[0].email).to.equal('bob1@cmu.edu');
      done();        
    })
    .catch(function (err) {
      done(err);
    });
  });

  test('Wrong id for getting Emergency Contact', function(done) {
    let userId = "1234567890asdfghjkl";

    UserProfileDAO.getAllEmergencyContacts(userId)
    .then()
    .catch(function(err) {
      expect(err).not.to.be.equal(null);
      done();
    })
  });

  // testing multiple emergency contacts
  test('Add 0 Emergency Contacts', function (done) {
    let emergencyContact = [];
    UserProfileDAO.saveEmergencyContacts(id, emergencyContact)
    .then(function(savedEmergencyContacts) {
      expect(savedEmergencyContacts).to.be(null);
      done();
    });
  });

  test('Add 2 Emergency Contacts', function (done) {
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

    UserProfileDAO.saveEmergencyContacts(id, emergencyContacts)
    .then(function(savedEmergencyContacts) {
      expect(savedEmergencyContacts.length).to.be(2);
      expect(savedEmergencyContacts[0].name).to.equal(emergencyContacts[0].name);
      expect(savedEmergencyContacts[0].phoneNumber).to.equal(emergencyContacts[0].phoneNumber);
      expect(savedEmergencyContacts[0].email).to.equal(emergencyContacts[0].email);
      expect(savedEmergencyContacts[1].name).to.equal(emergencyContacts[1].name);
      expect(savedEmergencyContacts[1].phoneNumber).to.equal(emergencyContacts[1].phoneNumber);
      expect(savedEmergencyContacts[1].email).to.equal(emergencyContacts[1].email);
      done();
    }, function(err) {
      done();
    });
  });

  test('Get 2 Emergency Contact', function (done) {
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
    UserProfileDAO.getAllEmergencyContacts(id)
    .then(function(userInfo) {
      expect(userInfo.length).to.be(2);
      expect(userInfo[0].name).to.equal(emergencyContacts[0].name);
      expect(userInfo[0].phoneNumber).to.equal(emergencyContacts[0].phoneNumber);
      expect(userInfo[0].email).to.equal(emergencyContacts[0].email);
      expect(userInfo[1].name).to.equal(emergencyContacts[1].name);
      expect(userInfo[1].phoneNumber).to.equal(emergencyContacts[1].phoneNumber);
      expect(userInfo[1].email).to.equal(emergencyContacts[1].email);
      done();
    })
    .catch(function (err) {
      done(err);
    });
  });

  suiteTeardown(db.teardown);
});
