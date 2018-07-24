let expect = require('expect.js');

process.env.NODE_ENV = 'test';

let db = require('../../util/mockDB');
let dbUtil = require('../../util/dbUtil');
let Incident = dbUtil.getModel('Incident');

let IncidentHelper = require('../../helpers/incidentHelper');
let IncidentDAO = require('../../util/dao/incidentDAO');
let UserDAO = require('../../util/dao/userDAO').UserDAO;
let IncidentResponderDAO = require('../../util/dao/incidentResponderDAO');

let policeChief = {
  username: "policeChief",
  password: "test",
  register: 'true',  
  status: 'OK',
  role: 'PoliceChief',
  isOnline: true  
};
let fireChief = {
  username: "fireChief",
  password: "test",
  register: 'true',  
  status: 'OK',
  role: 'FireChief',
  isOnline: true  
};

let patrolOfficer = {
  username: "patrolOfficer",
  password: "test",
  register: 'true',  
  status: 'OK',
  role: 'PatrolOfficer',
  isOnline: true  
};

let firefighter = {
  username: "firefighter",
  password: "test",
  register: 'true',  
  status: 'OK',
  role: 'Firefighter',
  isOnline: true  
};

let dispatcher = {
  username: "dispatcher",
  password: "test",
  register: 'true',  
  status: 'OK',
  role: 'Dispatcher',
  isOnline: true  
};

let citizen = {
  username: 'citizen',
  password: 'test',
  register: 'true',
  status: 'OK',
  role: 'Citizen',
  isActive: true,
  isOnline: true
};

let paramedic1 = {
  username: 'paramedic1',
  password: 'test',
  register: 'true',
  status: 'OK',
  role: 'Paramedic',
  isActive: true,
  isOnline: true  
}


let paramedic2 = {
  username: 'paramedic2',
  password: 'test',
  register: 'true',
  status: 'OK',
  role: 'Paramedic',
  isActive: true,
  isOnline: true  
}

suite('Logout unit test', function() {
  suiteSetup(function(done) {
    db.setup(function() {
      UserDAO.addUser(policeChief)
      .then(user => {
        policeChiefId = user._id;
        return UserDAO.addUser(fireChief);
      })
      .then(user => {
        fireChiefId = user._id;
        return UserDAO.addUser(patrolOfficer);
      })
      .then(user => {
        patrolOfficerId = user._id;
        return UserDAO.addUser(firefighter);
      })
      .then(user => {
        firefighterId = user._id;
        return UserDAO.addUser(dispatcher);
      })
      .then(user => {
        dispatcherId = user._id;
        return UserDAO.addUser(paramedic1);
      })      
      .then(user => {
        paramedicId1 = user._id;
        return UserDAO.addUser(paramedic2);
      })      
      .then(user => {
        paramedicId2 = user._id;
        return UserDAO.addUser(citizen);
      })
      .then(user => {
        callerId = user._id;
        return IncidentDAO.createNewIncident(callerId);
      })
      .then(incident => {
        incidentId = incident._id;
      })
      .then(() => done())
      .catch(err => done(err));
    });
  });

  test('Transfer dispatcher commander when no available', function(done) {
    IncidentDAO.transferDispatcherCommand(dispatcherId)
    .then(() => {
      return IncidentResponderDAO.getIncidentInfoForStep5(incidentId);
    })
    .then(incident => {
      expect(incident.creatorId).to.eql(dispatcherId);
      done();
    })
    .catch(err => done(err));
  });

  test('Transfer dispatcher commander when log out', function(done) {
    let dispatcher2 = {
      username: "dispatcher2",
      password: "test",
      register: 'true',  
      status: 'OK',
      role: 'Dispatcher',
      isOnline: true  
    };
    UserDAO.addUser(dispatcher2)
    .then(user => {
      dispatcherId2 = user._id;    
      return IncidentDAO.transferDispatcherCommand(dispatcherId);
    })
    .then(() => {
      return IncidentResponderDAO.getIncidentInfoForStep5(incidentId);
    })
    .then(incident => {
      expect(incident.creatorId).to.eql(dispatcherId2);
      done();
    })
    .catch(err => done(err));
  });

  test('Transfer first responder commander for police when log out', function(done) {
    let incidentType = Incident.emergencyType.POLICE;
    IncidentDAO.updateIncidentType(incidentId, incidentType)
    .then(incident => {
      return IncidentResponderDAO.updateIncidentCommander(incidentId, policeChiefId);
    })
    .then(incident => {
      return IncidentDAO.transferFirstResponderCommand(policeChiefId);
    })
    .then(() => {
      return IncidentResponderDAO.getIncidentInfoForStep5(incidentId);
    })
    .then(incident => {
      expect(incident.commanderId).to.eql(patrolOfficerId);
      done();
    })
    .catch(err => done(err));
  });

  test('Transfer first responder commander for fire when log out', function(done) {
    let incidentType = Incident.emergencyType.FIRE;

    IncidentDAO.updateIncidentType(incidentId, incidentType)
    .then(incident => {
      return IncidentResponderDAO.updateIncidentCommander(incidentId, fireChiefId);
    })
    .then(incident => {
      return IncidentDAO.transferFirstResponderCommand(fireChiefId);
    })
    .then(() => {
      return IncidentResponderDAO.getIncidentInfoForStep5(incidentId);
    })
    .then(incident => {
      expect(incident.commanderId).to.eql(firefighterId);
      done();
    })
    .catch(err => done(err));
  });  

  test('Transfer first responder commander for medic when log out', function(done) {
    let incidentType = Incident.emergencyType.MEDICAL;

    IncidentDAO.updateIncidentType(incidentId, incidentType)
    .then(incident => {
      return IncidentResponderDAO.updateIncidentCommander(incidentId, paramedicId1);
    })
    .then(incident => {
      return IncidentDAO.transferFirstResponderCommand(paramedicId1);
    })
    .then(() => {
      return IncidentResponderDAO.getIncidentInfoForStep5(incidentId);
    })
    .then(incident => {
      expect(incident.commanderId).to.eql(paramedicId2);
      done();
    })
    .catch(err => done(err));
  });  

  test('Transfer first responder commander when no available', function(done) {
    let incidentType = Incident.emergencyType.MEDICAL;
    UserDAO.updateUser({_id: paramedicId2}, {isOnline: false})
    .then(user => {
      return IncidentDAO.updateIncidentType(incidentId, incidentType);
    })    
    .then(incident => {
      return IncidentResponderDAO.updateIncidentCommander(incidentId, paramedicId1);
    })
    .then(incident => {
      return IncidentDAO.transferFirstResponderCommand(paramedicId1);
    })
    .then(() => {
      return IncidentResponderDAO.getIncidentInfoForStep5(incidentId);
    })
    .then(incident => {
      expect(incident.commanderId).to.eql(paramedicId1);
      done();
    })
    .catch(err => done(err));
  });

  suiteTeardown(db.teardown);
});

