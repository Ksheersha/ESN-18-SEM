let expect = require('expect.js');
let agent = require('superagent');

let PORT = 3000;
let HOST = 'http://localhost:' + PORT;

process.env.NODE_ENV = "test";
// Initiate Server
let www = require('../../bin/www');
let db = require('../../util/mockDB');

let owner = {
  userName: "testowner",
  passWord: "test",
  register: "true",
  role: 'Citizen',
  isActive: true,
  isOnline: false
};

let participant = {
  userName: "testparticipant",
  passWord: "test",
  register: "true",
  role: 'Citizen',
  isActive: true,
  isOnline: false
}

let group = {
  "name": "testGroup",
  "description": "this is a group",
  "participants": []
};

let ownerId, participantId, groupId, groupId2;

let non_exist_id = 'ffffffffffffffffffffffff';


suite('Group API', function() {

  suiteSetup(function(done) {
    db.setup(function() {
      // add one user and get the id
      agent.post(HOST + '/users')
      .send(owner)
      .end(function(err, res) {
          agent.get(HOST + '/users/username/' + owner.userName)
          .end(function(err, res) {
            ownerId = res.body.id;
            agent.post(HOST + '/users')
            .send(participant)
            .end(function(err, res) {
              agent.get(HOST + '/users/username/' + participant.userName)
              .end(function(err, res) {
                participantId = res.body.id;
                done();
              });
            });         
          });
        });
    });
});

  test('Get citizen group info with info and public groups', function(done) {
    agent.get(HOST + '/group/list/' + ownerId)
      .end(function(err, res) {
        expect(err).to.be.equal(null);
        expect(res.statusCode).to.be.equal(200);
        groupData = res.body;
        expect(groupData).to.have.property('ownedGroups');
        expect(groupData.ownedGroups).to.be.empty();        
        expect(groupData).to.have.property('participantGroups');
        expect(groupData.participantGroups).to.have.length(2);        
        infoGroup = groupData.participantGroups[0];
        publicGroup = groupData.participantGroups[1];
        groupnames = [infoGroup.name, publicGroup.name]
        expect(groupnames).to.contain('Info');
        expect(groupnames).to.contain('Public');
        done();
      });
  });

  test('Get group info with one owned group', function(done) {
    agent.post(HOST + '/group/create/' + ownerId)
      .send(group)
      .end(function(err, res) {
        groupId = res.body;
        agent.get(HOST + '/group/list/' + ownerId)
          .end(function(err, res) {
            expect(err).to.be.equal(null);
            expect(res.statusCode).to.be.equal(200);
            groupData = res.body;
            expect(groupData).to.have.property('ownedGroups');
            expect(groupData.ownedGroups).to.have.length(1);
            agent.delete(HOST + '/group/delete/' + groupId)
            .end(function(err, res) {
              done();
            });           
          });
      });
  });

  test('Get group info with wrong id format', function(done) {
    agent.get(HOST + '/group/list/' + 'wrong_id')
      .end(function(err, res) {
        expect(err).not.to.be.equal(null);
        expect(res.statusCode).to.be.equal(500);
        done();
      });
  });

  test('Get group name with wrong id', function(done) {
    agent.get(HOST + '/group/name/' + 'wrongid')
      .end(function(err, res) {
        expect(err).not.to.be.equal(null);
        expect(res.statusCode).to.be.equal(500);
        done();
      });
  });

  test('Get group info with non-exist id', function(done) {
    agent.get(HOST + '/group/list/' + non_exist_id)
      .end(function(err, res) {
        expect(err).to.be.equal(null);
        expect(res.statusCode).to.be.equal(200);
        groupData = res.body;
        expect(groupData).to.have.property('ownedGroups');
        expect(groupData.ownedGroups).to.be.empty();
        done();
      });
  });

  test('Create group with valid info', function(done) {
    agent.post(HOST + '/group/create/' + ownerId)
    .send(group)
    .end(function(err, res) {
      groupId = res.body;
      expect(err).to.be.equal(null);
      expect(res.statusCode).to.be.equal(201);
        agent.get(HOST + '/group/list/' + ownerId)
          .end(function(err, res) {
            expect(err).to.be.equal(null);
            expect(res.statusCode).to.be.equal(200);
            groupData = res.body;
            expect(groupData).to.have.property('ownedGroups');
            expect(groupData.ownedGroups).to.have.length(1);
            agent.delete(HOST + '/group/delete/' + groupId)
            .end(function(err, res) {
              done();
            });             
          });
    });
  });

  test('Update group with valid info', function(done) {
    agent.post(HOST + '/group/create/' + ownerId)
    .send(group)
    .end(function(err, res) {
      groupId = res.body;    
      let updateGroup = group;
      let description = "a new description";
      updateGroup["description"] = description;
      updateGroup["participants"] = [participantId];

      agent.post(HOST + '/group/update/' + groupId)
      .send(updateGroup)
      .end(function(err, res) {
        expect(err).to.be.equal(null);
        expect(res.statusCode).to.be.equal(202);

        agent.get(HOST + '/group/list/' + ownerId)
        .end(function(err, res) {
          expect(err).to.be.equal(null);
          expect(res.statusCode).to.be.equal(200);
          groupData = res.body;
          expect(groupData).to.have.property('ownedGroups');
          expect(groupData.ownedGroups).to.have.length(1);
          group = groupData.ownedGroups[0];
          expect(group.description).to.equal(description);
          expect(group.participants).to.contain(participantId);
          agent.delete(HOST + '/group/delete/' + groupId)
          .end(function(err, res) {
            done();
          });
        });
      });
    });
  });

  test('Delete group with exist groupId', function(done) {
    let updateGroup = group;
    updateGroup["name"] = "testGroup2";    
    agent.post(HOST + '/group/create/' + ownerId)
    .send(updateGroup)
    .end(function(err, res) {
      groupId = res.body;
      agent.delete(HOST + '/group/delete/' + groupId)
      .end(function(err, res) {
        expect(err).to.be.equal(null);
        expect(res.statusCode).to.be.equal(202);
        agent.get(HOST + '/group/list/' + ownerId)
        .end(function(err, res) {
          expect(err).to.be.equal(null);
          expect(res.statusCode).to.be.equal(200);
          groupData = res.body;
          expect(groupData.ownedGroups).to.not.contain(groupId);
          agent.delete(HOST + '/group/delete/' + groupId)
          .end(function(err, res) {
            done();
          });          
        });
      });
    });
  });

  test('Delete group with non-exist groupId', function(done) {
    agent.delete(HOST + '/group/delete/' + non_exist_id)
    .end(function(err, res) {
      expect(err).to.be.equal(null);
      expect(res.statusCode).to.be.equal(202);
      done();
    });
  });

  test('Check group exist with exist groupId', function(done) {
    agent.post(HOST + '/group/create/' + ownerId)
    .send(group)
    .end(function(err, res) {
      groupId = res.body;
      agent.post(HOST + '/group/exists')
      .send({'name': group.name})
      .end(function(err, res) {
        expect(err).to.be.equal(null);
        expect(res.statusCode).to.be.equal(200);
        expect(res.body.existing).to.be.equal(true);
        agent.delete(HOST + '/group/delete/' + groupId)
        .end(function(err, res) {
          done();
        });
      });      
    });
  });

  test('Check group exist with non-exist groupId', function(done) {
    agent.post(HOST + '/group/exists')
    .send({'name': 'NotAGroup'})
    .end(function(err, res) {
      expect(err).to.be.equal(null);
      expect(res.statusCode).to.be.equal(200);
      expect(res.body.existing).to.be.equal(false);
      done();
    });
  });

  test('Quit group with valid userId and groupId', function(done) {
    let updateGroup = group;
    updateGroup["participants"] = [participantId];
    agent.post(HOST + '/group/create/' + ownerId)
    .send(updateGroup)
    .end(function(err, res) {
      groupId = res.body;
      agent.post(HOST + '/group/quit/' + participantId + '/' + groupId)
      .end(function(err, res) {
        expect(err).to.be.equal(null);
        expect(res.statusCode).to.be.equal(202);
        agent.get(HOST + '/group/list/' + participantId)
        .end(function(err, res) {
          expect(err).to.be.equal(null);
          expect(res.statusCode).to.be.equal(200);
          groupData = res.body;
          agent.delete(HOST + '/group/delete/' + groupId)
          .end(function(err, res) {
            done();
          });
        });
      });
    });
  });

  test('Check group naming with correct groupId', function(done) {
    agent.post(HOST + '/group/create/' + ownerId)
    .send(group)
    .end(function(err, res) {
      groupId = res.body;
      agent.post(HOST + '/group/naming')    
      .send({'_id': groupId, 'name': group.name})
      .end(function(err, res) {
        expect(err).to.be.equal(null);
        expect(res.body).to.have.property('allowed');
        expect(res.body.allowed).to.be.equal(true);
        agent.delete(HOST + '/group/delete/' + groupId)
        .end(function(err, res) {
          done();
        });
      });
    });
  });

  test('Get one group info with wrong id ', function(done) {
    agent.get(HOST + '/group/info/' + 'wrong_id')
    .end(function(err, res) {
      expect(err).not.to.be.equal(null);
      expect(res.statusCode).to.be.equal(500);
      done();
      });
  });

  test('Get group info with correct id', function(done) {
    agent.get(HOST + '/group/info/' + groupId)
    .end(function(err, res) {
      expect(err).to.be.equal(null);
      expect(res.statusCode).to.be.equal(200);
      done();
    });
  });

    suiteTeardown(db.teardown);
});
