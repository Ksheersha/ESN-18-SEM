let alertDAO = require('../util/dao/alertDAO');
let mongoose = require('mongoose');

function objectArrayToStringArray(group){
  let result = Array();
  for(let i = 0;i < group.length; i++) {
    result.push(group[i].toString());
  }
  return result;
}

function sendAlertHelper(sendId,alertMessage) {
  let recipients = objectArrayToStringArray(alertMessage.recipients);
  for (let n in clients_list) {
    if (recipients.includes(clients_list[n].id) && sendId !== clients_list[n].id) {
      let socket = clients_list[n].Socket;
      socket.emit("Alert Message Receive",alertMessage);
    }
  }
}

class alertController{
  
  createAlertMessage(req,res){
    let sendId = req.body.sendId;
    let groupId = req.body.groupId;
    let content = req.body.content;
    alertDAO.createAlert(sendId,groupId,content)
      .then(function (alertMessage) {
        sendAlertHelper(sendId,alertMessage);
        res.status(200).send(alertMessage);
      })
      .catch(function (err) {
        res.status(500).send(err);
      })
  }

  getAlertMessage(req,res){
    let alertId = req.params.alertId;
    alertDAO.getAlertMessage(alertId)
      .then(function (alertMessage) {
        res.status(200).send(alertMessage);
      })
      .catch(function (err) {
        res.status(500).send(err);
      })
  }

  updateAlertMessage(req,res){
    let userId = mongoose.Types.ObjectId(req.body.userId);
    let alertId = mongoose.Types.ObjectId(req.body.alertId);
    alertDAO.updateAlertMessageList(userId,alertId)
      .then(function (alertMessage) {
        res.status(200).send(alertMessage);
      })
      .catch(function (err) {
        res.status(500).send(err);
      })
  }

}

module.exports = alertController;