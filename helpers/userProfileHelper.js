const dbUtil = require('../util/dbUtil');
const User = dbUtil.getModel('User');

function findInformation (userId, UserInfoType, field) {
  return new Promise (function (resolve, reject) {
    User.findOne({_id:userId})
    .then(function (user) {
      UserInfoType.findOne({_id: user[field]})
      .then(function (userMedicalInfo) {
        resolve(userMedicalInfo);
      });
    })
    .catch(function (err) {
      reject(err);
    });
  });
}

function saveInformation (userInfo, model,  infoType, createMethod, updateMethod) {
  return new Promise (function (resolve, reject) {
    User.findOne({_id:userInfo.userId})
    .then(function (user) {
      if (user[infoType]) { // user already has a medical or personal record
        model.findOne({_id: user[infoType]}).then(function (user) {
          updateMethod(user, userInfo).save().then(function (user) {
            resolve(user);
          });
        })
      } else { // user doesn't have a personal or medical record
        let newInfo = createMethod(userInfo);
        newInfo.save().then(function () {
          user[infoType] = newInfo._id;
          user.save()
        }).then(function () {
          resolve(newInfo);
        });
      }
    }).catch(function (err) {
      reject(err);
    });
  });
}

module.exports = {
  findInformation: findInformation,
  saveInformation: saveInformation
};