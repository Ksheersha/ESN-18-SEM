let expect = require('expect.js');

process.env.NODE_ENV = 'test';

let db = require('../../util/mockDB');
let dbUtil = require('../../util/dbUtil');
let Incident = dbUtil.getModel('Incident');

let IncidentHelper = require('../../helpers/incidentHelper');
let UserDAO = require('../../util/dao/userDAO').UserDAO;
let IncidentDAO = require('../../util/dao/incidentDAO');
let IncidentResponderDAO = require('../../util/dao/incidentResponderDAO');

let callerId;
let dispatcherId;
let firstResponderId;
let incidentId;
let commanderId;
let userName;
let badId = '1234567890asdfghjkl';
let address = 'new incident address';
let location = {
  latitude: 37.3951436,
  longitude: -122.0823248
};
let priority = '1';
let incidentType = Incident.emergencyType.FIRE;
let displayId = 'I_test123_1';

suite('Incident Unit Tests', function () {
  suiteSetup(function (done) {
    db.setup(function () {
      done();
    });
  });

  test('Generate incident display id', function (done) {
    let user = {
      username: 'test123',
      password: '1234',
      register: 'true',
      status: 'OK',
      role: 'Citizen',
      isActive: false,
      isOnline: false
    };

    UserDAO.addUser(user)
    .then(function (user) {
      callerId = user._id;
      IncidentHelper.generateDisplayId(callerId)
      .then(function (id) {
        expect(id).to.equal('I_test123_1');
        done();
      });
    });
  });

  test('Generate display id with bad caller id', function (done) {
    IncidentHelper.generateDisplayId(badId)
      .catch(function (err) {
        expect(err).not.to.be(null);
        done();
      });
  });

  test('Find least busy dispatcher when there are no dispatchers', function (done) {
    IncidentHelper.findLeastBusyDispatcherId()
      .catch(function (err) {
        expect(err).to.equal('No dispatchers found');
        done();
      });
  });

  test('Get Waiting/Triage incident count for dispatcher', function (done) {
    let dispatcher = {
      username: 'dispatch123',
      password: '1234',
      register: 'true',
      status: 'OK',
      role: 'Dispatcher',
      isActive: false,
      isOnline: false
    };

    UserDAO.addUser(dispatcher)
    .then(function (dispatcher) {
      dispatcherId = dispatcher._id;
      IncidentHelper.getWaitingTriageIncidentCountForDispatcher(dispatcherId)
        .then(function (dispatcherCount) {
          expect(dispatcherCount.id).to.be(dispatcherId);
          expect(dispatcherCount.count).to.be(0);
          done();
        });
    });
  });

  test('Get Waiting/Triage incident count for dispatcher with fake id', function (done) {
    IncidentHelper.getWaitingTriageIncidentCountForDispatcher(badId)
    .catch(function (err) {
      expect(err).not.to.be(null);
      done();
    });
  });

  test('Find least busy dispatcher', function (done) {
    IncidentHelper.findLeastBusyDispatcherId()
    .then(function (id) {
      expect(id).to.eql(dispatcherId);
      done();
    });
  });

  test('Create new incident', function (done) {
    IncidentDAO.createNewIncident(callerId)
    .then(function (incident) {
      expect(incident.callerId).to.equal(callerId);
      expect(incident.openingDateTime).to.not.be(null);
      expect(incident.displayId).to.equal('I_test123_1');
      expect(incident.state).to.be(Incident.incidentState.WAITING);
      expect(incident.creatorId).to.be(incident.commanderId);
      incidentId = incident._id;
      done();
    });
  });

  test('Create new incident with bad callerId', function (done) {
    IncidentDAO.createNewIncident(badId)
    .catch(function (err) {
      expect(err).not.to.be(null);
      done();
    });
  });

  test('Update incident state', function (done) {
    IncidentResponderDAO.updateIncidentState(incidentId)
    .then(function (incident) {
      expect(incident.state).to.equal(Incident.incidentState.TRIAGE);
      done();
    });
  });

  test('Update incident state with bad incident Id', function (done) {
    IncidentResponderDAO.updateIncidentState(badId)
    .catch(function (err) {
      expect(err).not.to.be(null);
      done();
    });
  });

  test('Update incident already in TRIAGE', function (done) {
    IncidentResponderDAO.updateIncidentState(incidentId)
    .then(function (incident) {
      expect(incident.state).to.equal(Incident.incidentState.TRIAGE);
      done();
    });
  });

  test('Update incident location', function (done) {
    IncidentDAO.updateIncidentLocation(incidentId, address, location)
    .then(function (incident) {
      expect(incident._id).to.eql(incidentId);
      expect(incident.address).to.equal(address);
      expect(incident.location.latitude).to.equal(location.latitude);
      expect(incident.location.longitude).to.equal(location.longitude);
      done();
    });
  });

  test('Update incident location with bad incident Id', function (done) {
    IncidentDAO.updateIncidentLocation(badId, address, location)
    .catch(function (err) {
      expect(err).not.to.be(null);
      done();
    });
  });

  test('Get incident location', function (done) {
    IncidentDAO.getIncidentLocation(incidentId)
    .then(function (incident) {
      expect(incident.address).to.equal(address);
      done();
    });
  });

  test('Get incident location with bad incident Id', function (done) {
    IncidentDAO.getIncidentLocation(badId)
    .catch(function (err) {
      expect(err).not.to.be(null);
      done();
    });
  });

  test('Update incident type', function (done) {
    IncidentDAO.updateIncidentType(incidentId, incidentType)
    .then(function (incident) {
      expect(incident._id).to.eql(incidentId);
      expect(incident.emergencyType).to.equal(incidentType);
      done();
    });
  });

  test('Update incident type with bad incident Id', function (done) {
    IncidentDAO.updateIncidentType(badId, incidentType)
    .catch(function (err) {
      expect(err).not.to.be(null);
      done();
    });
  });

  test('Get incident type', function (done) {
    IncidentDAO.getIncidentType(incidentId)
    .then(function (incident) {
      expect(incident.emergencyType).to.equal(incidentType);
      done();
    });
  });

  test('Get incident type with bad incident Id', function (done) {
    IncidentDAO.getIncidentType(badId)
      .catch(function (err) {
        expect(err).not.to.be(null);
        done();
      });
  });

  test('Get incident type with bad incident Id', function (done) {
    IncidentDAO.getIncidentType(badId)
      .catch(function (err) {
        expect(err).not.to.be(null);
        done();
      });
  });

  test('Set incident state to WAITING', function (done) {
   IncidentDAO.setIncidentState(incidentId, Incident.incidentState.WAITING)
    .then(function (updatedIncident) {
      expect(updatedIncident._id).to.eql(incidentId);
      expect(updatedIncident.state).to.equal(Incident.incidentState.WAITING);
      done();
    });
  });

  test('Update incident state with wrong incident Id', function (done) {
    IncidentDAO.setIncidentState(badId, Incident.incidentState.WAITING)
    .catch(function (err) {
      expect(err).not.to.be(null);
      done();
    });
  });

  test('Get WAITING incident state', function (done) {
    IncidentResponderDAO.getIncidentState(incidentId)
        .then(function (incident) {
          expect(incident._id).to.eql(incidentId);
          expect(incident.state).to.equal(Incident.incidentState.WAITING);
          done();
        });
  });

  test('Get incident state with bad incident id', function (done) {
    IncidentResponderDAO.getIncidentState(badId)
        .catch(function (err) {
          expect(err).not.to.be(null);
          done();
        });
  });

  test('Update incident priority', function (done) {
    IncidentResponderDAO.updateIncidentPriority(incidentId, priority)
      .then(function (incident) {
        expect(incident._id).to.eql(incidentId);
        expect(incident.priority).to.equal(priority);
        done();
      });
  });

  test('Update incident priority with bad incident Id', function (done) {
    IncidentResponderDAO.updateIncidentPriority(badId, priority)
      .catch(function (err) {
        expect(err).not.to.be(null);
        done();
      });
  });

  test('Get incident display Id', function (done) {
    IncidentDAO.getIncidentDisplayId(incidentId)
      .then(function (incidentDisplayId) {
        expect(incidentDisplayId).to.equal(displayId);
        done();
      });
  });

  test('Get incident display Id with bad incident Id', function (done) {
    IncidentDAO.getIncidentDisplayId(badId)
      .catch(function (err) {
        expect(err).not.to.be(null);
        done();
      });
  });

  test('Get incident priority', function (done) {
    IncidentResponderDAO.getIncidentInfoForStep5(incidentId)
      .then(function (incident) {
        expect(incident.priority).to.equal(priority);
        done();
      });
  });

  test('Get incident priority with bad incident Id', function (done) {
    IncidentResponderDAO.getIncidentInfoForStep5(badId)
      .catch(function (err) {
        expect(err).not.to.be(null);
        done();
      });
  });

  test('Create incident as First Responder', function (done) {
    IncidentResponderDAO.createNewIncidentFirstResponder(dispatcherId)
      .then(function (incident) {
        expect(incident.creatorId).to.equal(dispatcherId);
        expect(incident.commanderId).to.equal(dispatcherId);
        expect(incident.openingDateTime).to.not.be(null);
        expect(incident.displayId).to.equal('I_dispatch123_1');
        expect(incident.state).to.be(Incident.incidentState.ASSIGNED);
        incidentId = incident._id;
        done();
      });
  });

  test('Create incident as First Responder with bad dispatcherId', function (done) {
    IncidentResponderDAO.createNewIncidentFirstResponder(badId)
      .catch(function (err) {
        expect(err).not.to.be(null);
        done();
      });
  });

  test('Get all open incidents', function (done) {
    IncidentDAO.getAllOpenIncidents()
    .then(function (incidents) {
      expect(incidents.length).to.be(2);
      expect(incidents[0].displayId).to.equal('I_test123_1');
      expect(incidents[1].displayId).to.equal('I_dispatch123_1');
      done();
    });
  });

  test('Get incident as Dispatcher with wrong dispatcherId', function (done) {
    IncidentResponderDAO.getIncidentsForDispatcher(badId)
      .catch(function (err) {
        expect(err).not.to.be(null);
        done();
      });
  });

  test('Update incident commander name', function (done) {
    let user = {
      username: 'test212',
      password: '1234',
      register: 'true',
      status: 'OK',
      role: 'Firefighter',
      isActive: true,
      isOnline: false
    };
    UserDAO.addUser(user)
    .then(function (user) {
      commanderId = user._id;
      userName = user.username;
      return IncidentResponderDAO.updateIncidentCommander(incidentId, commanderId)
    })
    .then(function (incident) {
      return UserDAO.findUserById(incident.commanderId)})
    .then(function (user) {
      expect(userName).to.equal(user.username);
      done();
    });
  });

  test('Update incident commander name for bad incident Id', function (done) {
    let user = {
      username: 'test212',
      password: '1234',
      register: 'true',
      status: 'OK',
      role: 'Firefighter',
      isActive: true,
      isOnline: false
    };
    UserDAO.addUser(user)
      .then(function (user) {
        commanderId = user._id;
        userName = user.username;
        IncidentResponderDAO.updateIncidentCommander(badId, commanderId)
          .catch(function (err) {
            expect(err).not.to.be(null);
            done();
          });
      });
  });

  test('Update incident commander', function (done) {
    let commander = {
      username: 'commanderForIncident',
      password: '1234',
      register: 'true',
      status: 'OK',
      role: 'Firefighter',
      isActive: false,
      isOnline: false
    };
    UserDAO.addUser(commander)
      .then(function (commander) {
        IncidentDAO.createNewIncident(commander._id)
          .then(function (incident) {
            IncidentResponderDAO.updateIncidentCommander(incident._id, commander._id)
              .then(function (incident) {
                incidentId = incident._id;
                IncidentResponderDAO.getIncidentCommander(incident._id)
                  .then(function (commanderId) {
                    expect(commanderId.toString()).to.equal(commander._id.toString());
                    done();
                  });
              });
          });
      });
  });

  test('Set Commander for Incident with bad commander Id', function (done) {
    IncidentResponderDAO.updateIncidentCommander(incidentId, badId)
      .catch(function (err) {
        expect(err).not.to.be(null);
        done();
      });
  });

  test('Get commander for incident with bad incident id', function (done) {
    IncidentResponderDAO.getIncidentCommander(badId)
      .catch(function (err) {
        expect(err).not.to.be(null);
        done();
      });
  });

  test('Set incident in Triage state to Closed state by dispatcher', function (done) {
    let user = {
      username: 'closedIncidentDisp',
      password: '1234',
      register: 'true',
      status: 'OK',
      role: 'Citizen',
      isActive: false,
      isOnline: false
    };
    UserDAO.addUser(user)
    .then(function (user) {
      IncidentDAO.createNewIncident(user._id)
      .then(function (incident) {
        IncidentDAO.setIncidentState(incident._id, Incident.incidentState.TRIAGE)
        .then(function (updatedIncident) {
          IncidentResponderDAO.responderClosedIncident(updatedIncident._id)
          .then(function (closedIncident) {
            expect(closedIncident._id).to.eql(updatedIncident._id);
            expect(closedIncident.creatorId).to.eql(closedIncident.commanderId);
            expect(closedIncident.state).to.equal(Incident.incidentState.CLOSED);
            done();
          });
        });
      });
    });
  });

  test('Set incident in Waiting state to not be Closed by dispatcher', function (done) {
    let user = {
     username: 'closedIncidentDisp',
     password: '1234',
     register: 'true',
     status: 'OK',
     role: 'Citizen',
     isActive: false,
     isOnline: false
    };

    UserDAO.addUser(user)
    .then(function (user) {
      IncidentDAO.createNewIncident(user._id)
      .then(function (incident) {
        IncidentDAO.setIncidentState(incident._id, Incident.incidentState.WAITING)
        .then(function (updatedIncident) {
          IncidentResponderDAO.responderClosedIncident(updatedIncident._id)
          .then(function (closedIncident) {
            expect(closedIncident._id).to.eql(updatedIncident._id);
            expect(closedIncident.creatorId).to.eql(closedIncident.commanderId);
            expect(closedIncident.state).not.to.eql(Incident.incidentState.CLOSED);
            done();
          });
        });
      });
    });
  });

  suiteTeardown(db.teardown);
});
