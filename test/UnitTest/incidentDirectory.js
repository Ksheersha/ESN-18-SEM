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

suite('Incident Directory Unit Tests', function () {
  suiteSetup(function (done) {
    db.setup(function () {
      done();
    });
  });

  test('Create dispatcher and user', function (done) {
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
      done();
    });
  });

  // Helper for 'Get incidents for Dispatcher'
  function createIncidentForUserAndSetStatus (userId, state) {
    return new Promise(function (resolve, reject) {
      IncidentDAO.createNewIncident(userId)
        .then(function (incident) {
          IncidentDAO.setIncidentState(incident._id, state)
            .then(function (incident) {
              resolve(incident);
            });
        });
    });
  }

  test('Get incidents for Dispatcher', function (done) {
    let user = {
      username: 'test123ForDispatcher',
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
        createIncidentForUserAndSetStatus(user._id, Incident.incidentState.WAITING)
          .then(function (incident) {
            incidentId = incident._id;
            createIncidentForUserAndSetStatus(user._id, Incident.incidentState.TRIAGE)
              .then(function () {
                createIncidentForUserAndSetStatus(user._id, Incident.incidentState.ASSIGNED)
                  .then(function () {
                    createIncidentForUserAndSetStatus(user._id, Incident.incidentState.CLOSED)
                      .then(function () {
                        IncidentResponderDAO.getIncidentsForDispatcher(dispatcherId, Incident.incidentState.TRIAGE)
                          .then(function (incidents) {
                            expect(incidents.length).to.be(1);
                            done();
                          });
                      });
                  });
              });
          });
      });
  });

  test('Get incidents for Dispatcher with wrong dispatcherId', function (done) {
    IncidentResponderDAO.getIncidentsForDispatcher(badId)
      .catch(function (err) {
        expect(err).not.to.be(null);
        done();
      });
  });

  test("Get open Incident For non Responder", function (done) {
    IncidentDAO.getOpenIncidentForNonResponder(callerId)
    .then(function (incidents) {
      expect(incidents.length).to.be(3);
      expect(incidents[0]._id).to.eql(incidentId);
      done();
    });
  });

  test("Get Open Incident For non Responder with bad first responder id", function (done) {
    IncidentDAO.getOpenIncidentForNonResponder(badId)
    .catch(function (err) {
      expect(err).not.to.be(null);
      done();
    });
  }); 

  function createOpenIncidentForFirstResponder (firstResponderId) {
    return new Promise(function (resolve, reject) {
      let newIncidentId;
      IncidentDAO.createNewIncident(callerId)
        .then(function (incident) {
          newIncidentId = incident._id;
          IncidentDAO.setIncidentState(incident._id, Incident.incidentState.ASSIGNED)
            .then(function () {
              IncidentResponderDAO.updateIncidentCommander(incident._id, firstResponderId)
                .then(function () {
                  resolve(newIncidentId);
                });
            });
        })
        .catch(function (err) {
          reject(err);
        });
    });
  }

  test('Get Incident(s) For First Responder', function (done) {
    let firstResponder = {
      username: 'fire123',
      password: '1234',
      register: 'true',
      status: 'OK',
      role: 'Firefighter',
      isActive: false,
      isOnline: false
    };

    UserDAO.addUser(firstResponder)
      .then(function (firstResponder) {
        firstResponderId = firstResponder._id;

        createOpenIncidentForFirstResponder(firstResponderId)
          .then(function (openIncidentId) {
            IncidentResponderDAO.getOpenIncidentForFirstResponder(firstResponder)
              .then(function (incidents) {
                expect(incidents.length).to.be(1);
                expect(incidents[0].commanderId.toString()).to.be(firstResponder._id.toString());
                done();
              });
          });
      });
  });

  test("Get Open Incident For First Responder with bad first responder id", function (done) {
    IncidentResponderDAO.getOpenIncidentForFirstResponder(badId)
    .catch(function (err) {
      expect(err).not.to.be(null);
      done();
    });
  }); 

  test('Get Open Incident For Dispatcher with bad first responder id', function (done) {
    IncidentResponderDAO.getIncidentsForDispatcher(badId)
      .catch(function (err) {
        expect(err).not.to.be(null);
        done();
      });
  });

  function createOtherOpenIncident () {
    return new Promise(function (resolve, reject) {
      let firstResponder = {
        username: 'FirstResponder123123123',
        password: '1234',
        register: 'true',
        status: 'OK',
        role: 'Firefighter',
        isActive: false,
        isOnline: false
      };
      let id;
      UserDAO.addUser(firstResponder)
        .then(function (firstResponder) {
          id = firstResponder._id;
          createOpenIncidentForFirstResponder(id)
            .then(function () {
              createOpenIncidentForFirstResponder(id)
                .then(function () {
                  createOpenIncidentForFirstResponder(id)
                    .then(function () {
                      createOpenIncidentForFirstResponder(id)
                        .then(function () {
                          resolve();
                        });
                    });
                });
            });
        });
    });
  }

  test('Get open Incidents where first responder is not commander', function (done) {
    createOtherOpenIncident()
      .then(function (otherOpenIncidents) {
        IncidentResponderDAO.getOtherOpenIncidents(firstResponderId)
          .then(function (otherIncidents) {
            // expect(otherIncidents.length).to.equal(6);
            for (let i = 0; i < otherIncidents.length; i++) {
              // expect(otherIncidents[i].commanderId.toString()).not.to.equal(firstResponderId.toString());
              expect(otherIncidents[i].state).to.equal(Incident.incidentState.ASSIGNED);
            }
            done();
          });
      });
  });

  test('Get Closed Incidents for First Responder', function (done) {
    IncidentResponderDAO.getClosedIncidents()
      .then(function (closedIncidents) {
        for (let i = 0; i < closedIncidents.length; i++) {
          expect(closedIncidents[i].state).to.be(Incident.incidentState.CLOSED);
        }
        done();
      });
  });

  suiteTeardown(db.teardown);
});
