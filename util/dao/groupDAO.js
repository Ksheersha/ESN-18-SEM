var dbUtil = require('../dbUtil');
var Group = dbUtil.getModel('Group');
var async = require('async');
var _ = require('lodash');
let DefaultDataLoader = require('../DefaultDataLoader');

class GroupDAO {
  static newGroup(groupData) {
    return new Group({
      name: groupData.name,
      description: groupData.description,
      participants: groupData.participants,
      owner: groupData.owner
    });
  }

  static updateGroup(groupId, update) {
    return new Promise(function(resolve, reject) {
      Group.findByIdAndUpdate(groupId, update, function(err, group) {
        if (err) {
          reject(err);
        }
        resolve(groupId);
      });
    });
  }

  static addGroup(groupData) { 
    let group = GroupDAO.newGroup(groupData);
    return new Promise(function(resolve, reject) {
      group.save()
        .then(function(group) {
          resolve(group);
        })
        .catch(function(err) {
          reject(err);
        });
    });
  }

  static getGroup(groupid) {
    return new Promise(function(resolve, reject) {
      Group.findOne({'_id': groupid})
      .then(function(group) {
        resolve(group);
      })
      .catch(function(err) {
        reject(err);
      });
    });
  }

  static getGroupByName(groupName) {
    return Group.findOne({name: groupName}).exec();
  }

  static checkExistingGroupName(groupName){
    return new Promise(function(resolve, reject){
      Group.find({name: groupName}, function(err, groups){
        if(groups.length){
          resolve(true);
        }
        else{
          resolve(false);
        }
      });
    });
  }

  static deleteGroup(groupId){
    return new Promise(function(resolve, reject) {
      Group.findByIdAndRemove(groupId, function(err, data) {
        if (err) {
          reject(err);
        }
        resolve("Delete group success");
      });
    });
  }

  static quitGroup(userId, groupId){
    return new Promise(function(resolve, reject) {
      let update = { $pull: { participants: userId } };
      Group.findByIdAndUpdate(groupId, update, function(err, data) {
        if (err) {
          reject(err);
        }
        resolve("Quit group success.");
      });
    });
  }

  static getAllGroupsByUserId(userId) {
    return new Promise(function(resolve, reject) {
      let querys = [];
      querys.push(Group.find({'owner': userId}));
      querys.push(Group.find({'participants': userId}));
      Promise.all(querys)
        .then(function(values) {
          resolve({'ownedGroups': values[0], 'participantGroups': values[1]});
        })
        .catch(function(err) {
          reject(err);
        });
    });
  }

  static checkGroupNaming(groupId, groupName){
    return new Promise(function(resolve, reject){
      Group.findOne({'name': groupName}, function(err, group){
        if (err) {
          reject(err);
        }
        if(group){
          resolve(group._id.toString() === groupId);
        }
        else{
          resolve(true);
        }
      });
    });
  }

  static getGroupName(groupId) {
    return new Promise(function (resolve, reject) {
      Group.findOne({_id: groupId})
        .then(function (group) {
          resolve(group.name);
        })
        .catch(function (err) {
          console.log('err is ' + err);
          reject(err);
        });
    });
  }

  // TODO: modularize ,flattening and parallelism
  static updateUserGroupInfoWhenRoleChanges (
    thisUser, oldRole, newRole, isCoordinator) {
    if (!newRole) {
      newRole = oldRole;
    }
    // remove old groups

    // find what to remove
    let groupsToBeRemoved = [];

    let findGroupsTaskQueue = [];
    let groupNamesToBeRemoved = DefaultDataLoader.rolesToGroup[oldRole];
    groupNamesToBeRemoved.forEach(function (eachGroupName) {
      let task = Group.findOne({name: eachGroupName}).exec();
      findGroupsTaskQueue.push(task);
    });
    if (!isCoordinator && groupNamesToBeRemoved.indexOf('Info') < 0) {
      groupNamesToBeRemoved.push('Info');
      findGroupsTaskQueue.push(Group.findOne({name: 'Info'}));
    }

    return Promise.all(findGroupsTaskQueue)
    .then(resultGroups => {
      groupsToBeRemoved = resultGroups;
      // 1. remove references in Group
      let removeRefInUserGroupQueue = [];
      groupsToBeRemoved.forEach(function (eachGroup) {
        if (eachGroup) {
          let idx = eachGroup.participants.indexOf(thisUser._id, 0);
          if (idx > -1) {
            eachGroup.participants.splice(idx, 1);
            removeRefInUserGroupQueue.push(eachGroup.save());
          }
        }
      });
      return Promise.all(removeRefInUserGroupQueue);
    })
    .then(() => {
      // 2. add new groups
      thisUser.role = newRole;
      thisUser.isCoordinator = isCoordinator;
      return DefaultDataLoader.DefaultDataLoader.loadDefaultGroupsForUser(thisUser);
    })
    .catch(err => {
      console.error('Error when updating ' + thisUser.username + 'group info.');
      throw err;
    });
  }
}

module.exports = GroupDAO;
