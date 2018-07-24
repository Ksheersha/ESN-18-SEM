let expect = require('expect.js');

process.env.NODE_ENV = 'test';

let db = require('../../util/mockDB');
let dbUtil = require('../../util/dbUtil');
let Incident = dbUtil.getModel('Incident');
let Vehicle = dbUtil.getModel('Vehicle');
let ResourceDAO = require('../../util/dao/resourceDAO');
let UserDAO = require('../../util/dao/userDAO').UserDAO;
let IncidentHelper = require('../../helpers/incidentHelper');
let IncidentDAO = require('../../util/dao/incidentDAO');

let wrongId = '111111111111111111111111';
let paramedicObject;
let fireChiefObject;
let dispatcherObject;

let paramedic = {
  username: 'paramedic',
  password: '1234',
  register: 'true',
  status: 'OK',
  role: 'Paramedic',
  isActive: false,
  isOnline: false
};

let fireChief = {
  username: 'fireChief',
  password: '1234',
  register: 'true',
  status: 'OK',
  role: 'FireChief',
  isActive: false,
  isOnline: false
};

let dispatcher = {
  username: 'dispatcher',
  password: '1234',
  register: 'true',
  status: 'OK',
  role: 'Dispatcher',
  isActive: false,
  isOnline: false
};

let citizen = {
  username: 'citizen',
  password: '1234',
  register: 'true',
  status: 'OK',
  role: 'Citizen',
  isActive: false,
  isOnline: false
};

let sampleResources = [
  {
    "name": "Car1",
    "type": "car",
    "persons": [],
    "allocated": {
      "kind": "Incident",
      "to": null
    },
  },
  {
    "name": "Car2",
    "type": "car",
    "persons": [],
    "allocated": {
      "kind": "Incident",
      "to": null
    },
  },
  {
    "name": "Car3",
    "type": "car",
    "persons": [],
    "allocated": {
      "kind": "Incident",
      "to": null
    },
  },
];

suite('Resource Unit Tests', function () {
  suiteSetup(function (done) {
    db.setup(function () {
      done();
    });
  });

  test('Create dispatcher for db', function (done) {

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
      IncidentHelper.getWaitingTriageIncidentCountForDispatcher(dispatcher._id)
      .then(function (dispatcherCount) {
        expect(dispatcherCount.count).to.be(0);
        done();
      });
    });
  });

  let createFirstResponders = new Promise(function (resolve, reject) {
    UserDAO.addUser(paramedic)
      .then(function (paramedicUser) {
        paramedicObject = paramedicUser;
        sampleResources[0].persons.push(paramedicUser._id);
        sampleResources[1].persons.push(paramedicUser._id);
        UserDAO.addUser(fireChief)
          .then(function (fireChiefUser) {
            fireChiefObject = fireChiefUser;
            sampleResources[0].persons.push(fireChiefUser._id);
            sampleResources[2].persons.push(fireChiefUser._id);
            UserDAO.addUser(dispatcher)
              .then(function (dispatcherUser) {
                dispatcherObject = dispatcherUser;
                sampleResources[1].persons.push(dispatcherUser._id);
                sampleResources[2].persons.push(dispatcherUser._id);
                resolve();
              });
          });
      })
      .catch(function (err) {
        reject(err);
      });
  });

  let createUserAndIncident = new Promise(function (resolve, reject) {
    UserDAO.addUser(citizen)
      .then(function (citizenUser) {
        IncidentDAO.createNewIncident(citizenUser._id)
          .then(function (incident) {
            sampleResources[0].allocated.to = incident._id;
            resolve(citizenUser);
          });
      })
      .catch(function (err) {
        reject(err);
      });
  });

  test.skip('Update a resource with a different incidentId', function (done) {
    createFirstResponders
      .then(function () {
        createUserAndIncident
          .then(function (citizenUser) {
            ResourceDAO.createResources(sampleResources)
              .then(function (createdResources) {
                IncidentDAO.createNewIncident(citizenUser._id)
                  .then(function (newIncident) {
                    createdResources[0].allocated.to = newIncident._id;
                    ResourceDAO.updateResources(createdResources)
                      .then(function (updatedResources) {
                        expect(updatedResources[0].allocated.to).to.equal(newIncident._id);
                        done();
                      });
                  });
              });
          });
      });
  });


  test('Update a resource with a wrong incidentId', function (done) {
    createFirstResponders
      .then(function () {
        UserDAO.addUser(citizen)
          .then(function (citizenUser) {
            IncidentDAO.createNewIncident(citizenUser._id)
              .then(function (incident) {
                sampleResources[0].allocated.to = incident._id;
                ResourceDAO.createResources(sampleResources)
                  .then(function (createdResources) {
                    IncidentDAO.createNewIncident(citizenUser._id)
                      .then(function (newIncident) {
                        createdResources[0].allocated.to = 'junkId';
                        ResourceDAO.updateResources(createdResources)
                          .then(function (updatedResources) {
                            // should not set an invalid incidentId
                            expect(updatedResources[0].allocated.to).to.equal(incident._id);
                            done();
                          });
                      });
                  });
              });
          });
      });
  });

  test('Update a resource with a wrong resourceId', function (done) {
    createFirstResponders
      .then(function () {
        createUserAndIncident
          .then(function () {
            ResourceDAO.createResources(sampleResources)
              .then(function (createdResources) {
                createdResources[0]._id = wrongId;
                ResourceDAO.updateResources(createdResources)
                  .catch(function (err) {
                    expect(err).to.not.be(null);
                    done();
                  });
              });
          });
      });
  });


  test('Deallocate a resource', function (done) {
    createFirstResponders
      .then(function () {
        createUserAndIncident
          .then(function () {
            ResourceDAO.createResources(sampleResources)
              .then(function (createdResources) {
                createdResources[0].allocated = null;
                ResourceDAO.updateResources(createdResources)
                  .then(function (updatedResources) {
                    expect(updatedResources[0].allocated.to).to.equal(undefined);
                    done();
                  });
              });
          });
      });
  });


  test('Get the resources', function (done) {
    createFirstResponders
      .then(function () {
        createUserAndIncident
          .then(function () {
            ResourceDAO.createResources(sampleResources)
              .then(function (createdResources) {
                ResourceDAO.getResources()
                  .then(function (resources) {
                    expect(resources).not.to.be(null);
                    done();
                  });
              });
          });
      });
  });

  test('Get the personnel for an incident', function (done) {
    createFirstResponders
      .then(function () {
        UserDAO.addUser(citizen)
          .then(function (citizenUser) {
            IncidentDAO.createNewIncident(citizenUser._id)
              .then(function (incident) {
                sampleResources[0].allocated.to = incident._id;
                ResourceDAO.createResources(sampleResources)
                  .then(function (createdResources) {
                    ResourceDAO.findPersonnelForIncident(incident._id)
                      .then(function (personnelIds) {
                        expect(personnelIds).not.to.be(null);
                        done();
                      });
                  });
              });
          });
      });
  });

  test('Deallocate resources for an incident', function (done) {
    createFirstResponders
      .then(function () {
        UserDAO.addUser(citizen)
          .then(function (citizenUser) {
            IncidentDAO.createNewIncident(citizenUser._id)
              .then(function (incident) {
                sampleResources[0].allocated.to = incident._id;
                ResourceDAO.createResources(sampleResources)
                  .then(function (createdResources) {
                    ResourceDAO.deallocateResourcesForIncident(incident._id)
                      .then(function () {
                        expect(createdResources.allocated).to.be(undefined);
                        done();
                      });
                  });
              });
          });
      });
  });

  suiteTeardown(db.teardown);
});
