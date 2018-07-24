let expect = require('expect.js');

process.env.NODE_ENV = 'test';

let db = require('../../util/mockDB');
let dbUtil = require('../../util/dbUtil');
let Incident = dbUtil.getModel('Incident');

let IncidentHelper = require('../../helpers/incidentHelper');
let UserDAO = require('../../util/dao/userDAO').UserDAO;
let IncidentDAO = require('../../util/dao/incidentDAO');
let IncidentAnswerDAO = require('../../util/dao/incidentAnswerDAO');

let callerId;
let dispatcherId;
let incidentId;
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
let checkAnswer;

suite('Incident Answer Unit Tests', function () {
  suiteSetup(function (done) {
    db.setup(function () {
      done();
    });
  });

  test('Create dispatcher', function (done) {
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

  test('Create new incident', function (done) {
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
      IncidentDAO.createNewIncident(callerId)
      .then(function (incident) {
        expect(incident.callerId).to.equal(callerId);
        expect(incident.openingDateTime).to.not.be(null);
        expect(incident.displayId).to.equal(displayId);
        expect(incident.state).to.be(Incident.incidentState.WAITING);
        expect(incident.creatorId).to.be(incident.commanderId);
        incidentId = incident._id;
        done();
      });
    });
  });

  test('Save new incident answer', function (done) {
    let answers = {
      patient: '1',
      sex: '',
      citizenAge: '1',
      conscient: '2',
      smoke: '1',
      breathing: '',
      citizenChiefComplaint: '1',
      citizenPatientsProfile: '',
      flame: '1',
      fireInjury: '1',
      hazardous: '1',
      citizenPeople: '1',
      getOut: '1',
      weapon: '1',
      weaponInjury: '1',
      citizenSuspectDescription: '1',
      suspectLeft: '1',
      safe: '1',
      citizenCrimeDetail: '1'
    };

    checkAnswers = answers;
    IncidentAnswerDAO.saveAnswerInfo(incidentId, answers)
    .then(function (receivedAnswer) {
      expect(receivedAnswer.patient).to.be.eql(answers.patient);
      expect(receivedAnswer.sex).to.be.eql(answers.sex);
      expect(receivedAnswer.citizenAge).to.be.eql(answers.citizenAge);
      expect(receivedAnswer.conscient).to.be.eql(answers.conscient);
      expect(receivedAnswer.smoke).to.be.eql(answers.smoke);
      expect(receivedAnswer.breathing).to.be.eql(answers.breathing);
      expect(receivedAnswer.citizenChiefComplaint).to.be.eql(answers.citizenChiefComplaint);
      expect(receivedAnswer.citizenPatientsProfile).to.be.eql(answers.citizenPatientsProfile);
      expect(receivedAnswer.flame).to.be.eql(answers.flame);
      expect(receivedAnswer.fireInjury).to.be.eql(answers.fireInjury);
      expect(receivedAnswer.hazardous).to.be.eql(answers.hazardous);
      expect(receivedAnswer.citizenPeople).to.be.eql(answers.citizenPeople);
      expect(receivedAnswer.getOut).to.be.eql(answers.getOut);
      expect(receivedAnswer.weapon).to.be.eql(answers.weapon);
      expect(receivedAnswer.weaoponInjury).to.be.eql(answers.weaoponInjury);
      expect(receivedAnswer.citizenSuspectDescription).to.be.eql(answers.citizenSuspectDescription);
      expect(receivedAnswer.suspectLeft).to.be.eql(answers.suspectLeft);
      expect(receivedAnswer.safe).to.be.eql(answers.safe);
      expect(receivedAnswer.citizenCrimeDetail).to.be.eql(answers.citizenCrimeDetail);
      done();
    });
  });

  test('Get incident answers', function (done) {
    IncidentAnswerDAO.getAnswerInfo(incidentId)
      .then(function (resultAnswer) {
        expect(resultAnswer.patient).to.be.equal(checkAnswers.patient);
        expect(resultAnswer.sex).to.be.equal(checkAnswers.sex);
        expect(resultAnswer.citizenAge).to.be.equal(checkAnswers.citizenAge);
        expect(resultAnswer.conscient).to.be.equal(checkAnswers.conscient);
        expect(resultAnswer.smoke).to.be.equal(checkAnswers.smoke);
        expect(resultAnswer.citizenChiefComplaint).to.be.equal(checkAnswers.citizenChiefComplaint);
        expect(resultAnswer.flame).to.be.equal(checkAnswers.flame);
        done();
      });
  });

  test('Update incident answer', function (done) {
    let answers = {
      patient: '2',
      sex: '',
      citizenAge: '1',
      conscient: '2',
      smoke: '2',
      breathing: '',
      citizenChiefComplaint: '2',
      citizenPatientsProfile: '1',
      flame: '1',
      fireInjury: '1',
      hazardous: '1',
      citizenPeople: '2',
      getOut: '1',
      weapon: '2',
      weaponInjury: '1',
      citizenSuspectDescription: '1',
      suspectLeft: '2',
      safe: '1',
      citizenCrimeDetail: '1'
    };
    checkAnswers = answers;

    IncidentAnswerDAO.saveAnswerInfo(incidentId, answers)
    .then(function (resultAnswer) {
      expect(resultAnswer.patient).to.not.be('1');
      expect(resultAnswer.patient).to.be.eql(answers.patient);
      expect(resultAnswer.sex).to.be.eql(answers.sex);
      expect(resultAnswer.citizenAge).to.be.eql(answers.citizenAge);
      expect(resultAnswer.conscient).to.not.be('1');
      expect(resultAnswer.conscient).to.be.eql(answers.conscient);
      expect(resultAnswer.smoke).to.not.be('1');
      expect(resultAnswer.smoke).to.be.eql(answers.smoke);
      expect(resultAnswer.breathing).to.be.eql(answers.breathing);
      expect(resultAnswer.citizenChiefComplaint).to.not.be('1');
      expect(resultAnswer.citizenChiefComplaint).to.be.eql(answers.citizenChiefComplaint);
      expect(resultAnswer.citizenPatientsProfile).to.be.eql(answers.citizenPatientsProfile);
      expect(resultAnswer.flame).to.be.eql(answers.flame);
      expect(resultAnswer.fireInjury).to.be.eql(answers.fireInjury);
      expect(resultAnswer.hazardous).to.be.eql(answers.hazardous);
      expect(resultAnswer.citizenPeople).to.not.be('1');
      expect(resultAnswer.citizenPeople).to.be.eql(answers.citizenPeople);
      expect(resultAnswer.getOut).to.be.eql(answers.getOut);
      expect(resultAnswer.weapon).to.be.eql(answers.weapon);
      expect(resultAnswer.weaoponInjury).to.be.eql(answers.weaoponInjury);
      expect(resultAnswer.citizenSuspectDescription).to.be.eql(answers.citizenSuspectDescription);
      expect(resultAnswer.suspectLeft).to.not.be('1');
      expect(resultAnswer.suspectLeft).to.be.eql(answers.suspectLeft);
      expect(resultAnswer.safe).to.be.eql(answers.safe);
      expect(resultAnswer.citizenCrimeDetail).to.be.eql(answers.citizenCrimeDetail);
      done();
    });
  });

  test('Get updated incident answers', function (done) {
    IncidentAnswerDAO.getAnswerInfo(incidentId)
      .then(function (resultAnswer) {
        expect(resultAnswer.patient).to.be.equal(checkAnswers.patient);
        expect(resultAnswer.sex).to.be.equal(checkAnswers.sex);
        expect(resultAnswer.citizenAge).to.be.equal(checkAnswers.citizenAge);
        expect(resultAnswer.conscient).to.be.equal(checkAnswers.conscient);
        expect(resultAnswer.smoke).to.be.equal(checkAnswers.smoke);
        expect(resultAnswer.citizenChiefComplaint).to.be.equal(checkAnswers.citizenChiefComplaint);
        expect(resultAnswer.flame).to.be.equal(checkAnswers.flame);
        done();
      });
  });

  suiteTeardown(db.teardown);
});