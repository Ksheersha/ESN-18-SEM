let dbUtil = require('mongoose');
let User = dbUtil.model('User');
let Group = dbUtil.model('Group');

let DEFAULT_GROUPS = Object.values(Group.DEFAULT_GROUPS);
let ROLE_TO_DEFAULT_GROUP_NAMES = Group.ROLE_TO_DEFAULT_GROUP_NAMES;

class DefaultDataLoader {

  constructor () {}

  /**
   * Load default groups required by the specification.
   * These groups are system-owned.
   */
  // TODO: modularize
  static loadDefaultGroupsAndUpdateUsers () {
    // check if group exists
    // traverse users to update their group info
    let namesToGroups;
    createDefaultGroupsIfNotExist()
    .then(defaultGroups => {
      // build a map of groupName -> groupId
      namesToGroups = getNameToGroupMapping(defaultGroups);
      return User.find().exec();
    })
    .then(allUsers => {
      // update user's group info
      allUsers.forEach(thisUser => {
        // target group IDs
        let targetGroups = getTargetGroupsFromRole(namesToGroups, thisUser.role,
          thisUser.isCoordinator);
        return joinGroups(thisUser, targetGroups);
      });
    })
    .catch(err => {
      console.error('Unexpected error when loading default groups for all users.');
      console.error(err);
    });
  }

  static loadDefaultGroupsForUser (thisUser) {
    return createDefaultGroupsIfNotExist()
    .then(defaultGroups => {
      // build a map of groupName -> groupId
      return getNameToGroupMapping(defaultGroups);
    })
    .then(namesToGroups => {
      // target group IDs
      let targetGroups = getTargetGroupsFromRole(namesToGroups, thisUser.role,
        thisUser.isCoordinator);
      return joinGroups(thisUser, targetGroups);
    })
    .catch(err => {
      console.error('Unexpected error when loading default groups for ' + thisUser.username);
      throw err;
    });
  }
}

/* HELPERS - ASYNC */

function joinGroups (thisUser, targetGroups) {
  if (!targetGroups || targetGroups.length === 0) {
    return Promise.resolve();
  }

  let targetGroupsID = [];
  targetGroups.forEach(function (eachTargetGroup) {
    targetGroupsID.push(eachTargetGroup._id);
  });

  let joinGroupTaskQueue = [];

  targetGroups.forEach(function (eachTargetGroup) {
    if (eachTargetGroup.participants.indexOf(thisUser._id, 0) === -1) {
      eachTargetGroup.participants.push(thisUser._id);
      joinGroupTaskQueue.push(eachTargetGroup.save());  // save group
    }
  });

  return Promise.all(joinGroupTaskQueue)
    .catch(err => {
      console.error('Error when joining default groups: ' + targetGroups);
      throw err;
  });
}

function createDefaultGroupsIfNotExist () {
  let checkGroupsExistence = [];
  DEFAULT_GROUPS.forEach((groupName) => {
    let checkGroupProm =
      Group.findOneAndUpdate(
        {name: groupName},
        {
          name: groupName,
          description: groupName + ' Channel'
        },
        {
          'upsert': true,
          'new': true,
          'setDefaultsOnInsert': true
        }
      ).exec().then(thisGroup => {
        return thisGroup;
      }).catch(err => {
        console.error('Unknown error when loading default groups.');
        console.error(err.message);
        return Promise.reject(err);
      });
    checkGroupsExistence.push(checkGroupProm);
  });
  return Promise.all(checkGroupsExistence);
}

/* LOCAL HELPERS - SYNC */

function getNameToGroupMapping (defaultGroups) {
  let namesToGroups = {};
  DEFAULT_GROUPS.forEach((groupName) => {
    let thisGroup = defaultGroups.find(function (group) {
      return group.name === groupName;
    });
    if (!thisGroup) {
      let err = new Error('Default group ' + groupName +
        ' not found in group documents:\n' + defaultGroups);
      // console.error(err.message);
      throw err;
    }
    namesToGroups[groupName] = thisGroup;
  });
  return namesToGroups;
}

function getTargetGroupsFromRole (
  namesToGroups, role, isCoordinator = false) {
  let targetGroups = [];
  ROLE_TO_DEFAULT_GROUP_NAMES[role].forEach(targetGroupName => {
    targetGroups.push(namesToGroups[targetGroupName]);
  });
  // if this user is coordinator, and Info group is not yet in the list
  if (isCoordinator &&
    targetGroups.indexOf(namesToGroups['Info'], 0) === -1) {
    targetGroups.push(namesToGroups['Info']);
  }
  return targetGroups;
}

module.exports =
  {
    DefaultDataLoader: DefaultDataLoader,
    DEFAULT_GROUPS: DEFAULT_GROUPS,
    rolesToGroup: ROLE_TO_DEFAULT_GROUP_NAMES,
  };