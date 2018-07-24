'use strict';

var StatusDAO = require('../util/dao/statusDAO').StatusDAO;
var UserDAO = require('../util/dao/userDAO').UserDAO;

/* Class ShareStatusController */
module.exports =
  class ShareStatusController {

    /* Post a status */
    postNewStatus(req, res) {
      var statusData = req.body;
      statusData['userID'] = req.params.userID;
      var status = StatusDAO.createNewStatus(statusData);
      if (status.status == undefined){
        console.log("postNewStatus error");
        res.sendStatus(500);
      }
      UserDAO.updateUser({_id: statusData.userID}, {status: status})
      .then(function () {
        global.io.emit("reload user directory");
        global.io.emit("reload map");
        res.sendStatus(200);
      })
      .catch(function (err) {
        res.sendStatus(500);
      });
    };
  };
