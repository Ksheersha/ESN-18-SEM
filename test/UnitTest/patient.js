const expect = require('expect.js');

const db = require('../../util/mockDB');
const UserDAO = require('../../util/dao/userDAO').UserDAO;
const IncidentDAO = require('../../util/dao/incidentDAO');
const IncidentAnswerDAO = require('../../util/dao/incidentAnswerDAO');
const IncidentResponderDAO = require('../../util/dao/incidentResponderDAO');
const PatientDAO = require('../../util/dao/patientDAO');

const dbUtil = require('../../util/dbUtil');
const Patient = dbUtil.getModel('Patient');
const User = dbUtil.getModel('User');

const CITIZEN = {
  username: 'ACitizen',
  password: 'fFKpOah22Y7H504y',
  status: 'OK',
  role: User.roleType.CITIZEN
};
const CITIZEN1 = {
  username: 'ACitizen1',
  password: 'fFKpOah22Y7H504y',
  status: 'OK',
  role: User.roleType.CITIZEN
};
let citizenId = null;
let citizenId1 = null;

const DISPATCHER = {
  username: 'ADispatcher',
  password: 'q4v83R6rTQlwnt5Y',
  status: 'OK',
  role: User.roleType.DISPATCHER
};
const DISPATCHER1 = {
  username: 'ADispatcher1',
  password: 'q4v83R6rTQlwnt5Y',
  status: 'OK',
  role: User.roleType.DISPATCHER
};
let dispatcherId = null;
let dispatcherId1 = null;

const PARAMEDIC = {
  username: 'AParamedic',
  password: 'lalala',
  status: 'OK',
  role: User.roleType.PARAMEDIC
};
let paramedicId = null;

let incidentId = null;
let incidentId1 = null;

const INCIDENT_ANSWER = {
  citizenAge: '23',
  sex: '2', // Female.
  conscient: '2', // No.
  breathing: '1', // Yes.
  citizenChiefComplaint: 'Some complaint from a Citizen Chief.'
};

const PATIENT_DEFAULT = {
  displayId: 'I_ACitizen_1_P',
  priority: Patient.Priority.IMMEDIATE,
  location: Patient.Location.ROAD
};

const PATIENT_PULLED = {
  age: 23,
  sex: Patient.Sex.FEMALE,
  conscious: false,
  breathing: true,
  chiefComplaint: INCIDENT_ANSWER.citizenChiefComplaint
};

const PATIENT_DELTA = {
  location: Patient.Location.EMERGENCY_ROOM,
  name: 'Clumsy Lee',
  dob: Date.now(),
  age: 26,
  conscious: true,
  condition: Patient.Condition.BROKEN_BONE,
  allergies: 'Some allergies...'
};

let patientId = null;
let badId = "blablablablabla";

function expectPatient (actual, expected) {
  expect(actual.incident.toString()).to.eql(incidentId);

  for (let key in expected) {
    expect(actual[key]).to.eql(expected[key]);
  }
}

suite('Patient Unit Tests', () => {
  setup(done => {
    db.setup(() => {
      // Create a citizen, a dispatcher, and a incident.
      UserDAO.addUser(CITIZEN)
        .then(user => {
          citizenId = user.id;
          return UserDAO.addUser(DISPATCHER);
        })
        .then(user => {
          dispatcherId = user.id;
          return IncidentDAO.createNewIncident(citizenId);
        })
        .then(incident => {
          incidentId = incident.id;
          return IncidentAnswerDAO.saveAnswerInfo(incidentId, INCIDENT_ANSWER);
        })
        .then(() => done())
        .catch(err => done(err));
    });
  });

  suite('#getByIncidentId()', () => {
    test('should create and return a default Patient object based on the incident', done => {
      PatientDAO.getByIncidentId(incidentId)
        .then(patient => {
          expectPatient(patient, PATIENT_DEFAULT);
          done();
        })
        .catch(err => done(err));
    });

    test('should update the patient field in the incident', done => {
      PatientDAO.getByIncidentId(incidentId)
        .then(patient => patient.populate('incident').execPopulate())
        .then(patient => {
          expect(patient.incident.patient).to.eql(patient._id);
          done();
        })
        .catch(err => done(err));
    });

    test('should pull data from the incident', done => {
      PatientDAO.getByIncidentId(incidentId)
        .then(patient => {
          expectPatient(patient, PATIENT_PULLED);
          done();
        })
        .catch(err => done(err));
    });

    test('should return the existed Patient object if already existed', done => {
      let patientId = null;

      PatientDAO.getByIncidentId(incidentId)
        .then(patient => {
          patientId = patient._id;
          return PatientDAO.getByIncidentId(incidentId);
        })
        .then(patient => {
          expect(patient._id).to.eql(patientId);
          done();
        })
        .catch(err => done(err));
    });

    test('should throw an error if incident id is invalid', done => {
      PatientDAO.getByIncidentId('5a09924f77b6f95986c4e132')
        .then(patient => done(new Error(`Got ${patient}`)))
        .catch(err => done());
    });
  });

  suite('#update()', () => {
    test('should return an updated Patient object on success', done => {
      PatientDAO.getByIncidentId(incidentId)
        .then(patient => PatientDAO.updateByIncidentId(incidentId, PATIENT_DELTA))
        .then(patient => {
          patientId = patient._id;
          expectPatient(patient, PATIENT_DELTA);
          done();
        })
        .catch(err => done(err));
    });

    test('should create and update a default Patient object if needed', done => {
      PatientDAO.updateByIncidentId(incidentId, PATIENT_DELTA)
        .then(patient => {
          expectPatient(patient, PATIENT_DELTA);
          done();
        })
        .catch(err => done(err));
    });

    test('should throw an error if the id is invalid', done => {
      PatientDAO.updateByIncidentId('5a09924f77b6f95986c4e132', {})
        .then(patient => done(new Error(`Got ${patient}`)))
        .catch(err => done());
    });

    test('should update the database', done => {
      PatientDAO.getByIncidentId(incidentId)
        .then(patient => PatientDAO.updateByIncidentId(incidentId, PATIENT_DELTA))
        .then(() => PatientDAO.getByIncidentId(incidentId))
        .then(patient => {
          expectPatient(patient, PATIENT_DELTA);
          done();
        })
        .catch(err => done(err));
    });
  });

  suite('#getPatientsByParamedicId()', () => {
    test('should return no patients', done => {
      UserDAO.addUser(PARAMEDIC)
      .then(user => {
        paramedicId = user._id;
        return PatientDAO.getPatientsByParamedicId(paramedicId);
      })
      .then(patients => {
        expect(patients.length).to.be(0);
        done();
      })
      .catch(err => done(err));
    });

    test('should return patients in those incidents that I involved in', done => {
      IncidentResponderDAO.updateIncidentCommander(incidentId, paramedicId)
      .then(() => {
        return PatientDAO.getByIncidentId(incidentId);
      })
      .then(() => {
        return PatientDAO.getPatientsByParamedicId(paramedicId);
      })
      .then(patients => {
        expect(patients.length).to.be(1);
        expectPatient(patients[0], PATIENT_PULLED);
        done();
      })
      .catch(err => done(err));
    });
  });

  suite('#getPatientsByParamedicIdForFindHospital()', () => {
    test('should return no patients', done => {
      UserDAO.addUser(PARAMEDIC)
      .then(user => {
        paramedicId = user._id;
        return PatientDAO.getPatientsByParamedicIdForFindHospital(paramedicId);
      })
      .then(patients => {
        expect(patients.length).to.be(0);
        done();
      })
      .catch(err => done(err));
    });

    test('should return patients in those incidents that I involved in', done => {
      IncidentResponderDAO.updateIncidentCommander(incidentId, paramedicId)
      .then(() => {
        return PatientDAO.getByIncidentId(incidentId);
      })
      .then(() => {
        return PatientDAO.getPatientsByParamedicId(paramedicId);
      })
      .then(patients => {
        expect(patients.length).to.be(1);
        expectPatient(patients[0], PATIENT_PULLED);
        done();
      })
      .catch(err => done(err));
    });

    test('should not return patients who are already in ER', done => {
      IncidentResponderDAO.updateIncidentCommander(incidentId, paramedicId)
      .then(() => {
        return PatientDAO.getByIncidentId(incidentId);
      })
      .then(() => {
        return PatientDAO.updateByIncidentId(incidentId, PATIENT_DELTA);
      })
      .then(() => {
        return PatientDAO.getPatientsByParamedicIdForFindHospital(paramedicId);
      })
      .then(patients => {
        patients.forEach(patient => {
          expect(patient.location).to.eql('road');
        })
        done();
      })
      .catch(err => done(err));
    });
  });

  suite('#beds', () => {
    test('should update the state of the bed request - READY', done => {
      let patient = new Patient();
      patient.save()
      .then(newPatient => {
        PatientDAO.updateBedStatus(newPatient._id, 'Beds Ready')
        .then(patient => {
          expect(patient._id.toString()).to.eql(newPatient._id.toString());
          expect(patient.bedStatus).to.eql(Patient.BedStatus.READY);
          done();
        });
      });
    });

    test('should update the state of the bed request - OCCUPIED', done => {
      let patient = new Patient();
      patient.save()
      .then(newPatient => {
        PatientDAO.updateBedStatus(newPatient._id, 'Beds Occupied')
        .then(patient => {
          expect(patient._id.toString()).to.eql(newPatient._id.toString());
          expect(patient.bedStatus).to.eql(Patient.BedStatus.OCCUPIED);
          done();
        });
      });
    });

    test('should update the state of the bed request - REQUESTED', done => {
      let patient = new Patient();
      patient.save()
      .then(newPatient => {
        PatientDAO.updateBedStatus(newPatient._id, 'Beds Requested')
        .then(patient => {
          expect(patient._id.toString()).to.eql(newPatient._id.toString());
          expect(patient.bedStatus).to.eql(Patient.BedStatus.REQUESTED);
          done();
        });
      });
    });

    test('should update the state of the bed request to OCCUPIED of other', done => {
      let patient = new Patient();
      patient.save()
      .then(newPatient => {
        PatientDAO.updateBedStatus(newPatient._id, 'other status')
        .then(patient => {
          expect(patient._id.toString()).to.eql(newPatient._id.toString());
          expect(patient.bedStatus).to.eql(Patient.BedStatus.OCCUPIED);
          done();
        });
      });
    });

  });



  teardown(done => {
    db.teardown(done);
  });
});
