let dbUtil = require('../dbUtil');
let Alert = dbUtil.getModel('Alert');
let Group = dbUtil.getModel('Group');
let RoleType = require('../../models/user').statics.roleType;

class AlertDAO{
  static isResponder(role){
    return role === RoleType.DISPATCHER ||
      role === RoleType.POLICE_CHIEF ||
      role === RoleType.PATROL_OFFICER ||
      role === RoleType.FIRE_CHIEF ||
      role === RoleType.FIREFIGHTER ||
      role === RoleType.PARAMEDIC;
  }
  static filterGroupData(groupData,sendId){
    let result = new Array();
    for ( let i = 0;i< groupData.length; i++ ) {
      let user = groupData[i];
      if(user._id.toString() === sendId.toString()) continue;
      if(!AlertDAO.isResponder(user.role)) continue;
      result.push(user._id);
    }
    return result;
  }

  static newAlertMessage(sendId,groupId,content,recipients){
    return new Alert({
      sendId: sendId,
      groupId: groupId,
      content: content,
      recipients: recipients
    })
  }

  static createAlert(sendId,groupId,content){
    return new Promise(function(resolve,reject){
      Group.findOne({'_id': groupId})
        .populate("participants")
        .populate("owner")
        .then(function (groupData) {
          let participants = groupData.participants;
          let owner = groupData.owner;
          participants.push(owner);
          let recipients = AlertDAO.filterGroupData(participants,sendId);
          AlertDAO.newAlertMessage(sendId,groupId,content,recipients)
            .save()
            .then(function (alertMessage) {
              resolve(alertMessage);
            });
        })
        .catch(function(err){
          reject(err);
        })
    })
  }

  static getAlertMessage(id){
    return new Promise(function (resolve,reject) {
      Alert.findOne({_id:id})
        .populate('recipients')
        .then(function (alertMessage) {
          resolve(alertMessage);
        })
        .catch(function(err){
          reject(err);
        })
    })
  }

  static updateAlertMessageList(userId,alertId){
    return new Promise(function(resolve, reject) {
      let update = { $pull: { recipients: userId } };
      Alert.findByIdAndUpdate(alertId, update)
        .then(function (data) {
          resolve(data);
        })
        .catch(function (err) {
          reject(err);
        });
    });
  }

}

module.exports = AlertDAO;