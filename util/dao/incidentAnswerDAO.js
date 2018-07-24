const dbUtil = require('../dbUtil');
const Incident = dbUtil.getModel('Incident');
const IncidentAnswer = dbUtil.getModel('IncidentAnswer');

class incidentAnswerDAO {

  static saveAnswerInfo (incidentId, answerInfo) {
    return new Promise(function (resolve, reject) {
      Incident.findOne({_id: incidentId}) // gets incident
      .then(function (incident) {
        if (incident.answerInfo) {
          IncidentAnswer.findOneAndUpdate({_id: incident.answerInfo}, answerInfo, {new: true})
            .then(function (updatedAnswer) {
                resolve(updatedAnswer);
              })
        } else {
          IncidentAnswer.create(answerInfo)
          .then(function (answer) {
            incident.answerInfo = answer._id;
            incident.save()
            .then(function() {
              resolve(answer);
            })
          })
        }
      })
      .catch(function (err) {
        reject(err);
      });
    });
  }

  static getAnswerInfo (incidentId) {
    return new Promise(function (resolve, reject) {
      Incident.findOne({_id: incidentId})
      .then(function (incident) {
        IncidentAnswer.findOne({_id: incident.answerInfo})
        .then(function (incidentAnswerInfo) {
          resolve(incidentAnswerInfo);
        });
      })
      .catch(function (err) {
        reject(err);
      });
    });
  }
}

module.exports = incidentAnswerDAO;