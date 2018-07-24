var mongoose = require('mongoose');
var Schema = mongoose.Schema;
let RoleType = require('./user.js').statics.roleType;

// default groups are guaranteed to exist in Group table when app loads.
const DEFAULT_GROUPS = {
  PUBLIC: 'Public',
  INFO: 'Info',
  RESPONDERS: 'Responders',
  DISPATCH: 'Dispatch',
  POLICE: 'Police',
  FIRE: 'Fire',
  MEDIC: 'Medic',
  NURSES: 'Nurses'
};

const DEFAULT_GROUP_NAME_TO_ROLES = {
  'Public': [RoleType.CITIZEN],
  // special case: Info group should include Coordinators as well
  'Info': [RoleType.CITIZEN, RoleType.ADMINISTRATOR],
  'Responders': [
    RoleType.DISPATCHER,
    RoleType.POLICE_CHIEF,
    RoleType.PATROL_OFFICER,
    RoleType.FIRE_CHIEF,
    RoleType.FIREFIGHTER,
    RoleType.PARAMEDIC
  ],
  'Dispatch': [RoleType.DISPATCHER],
  'Police': [RoleType.POLICE_CHIEF, RoleType.PATROL_OFFICER],
  'Fire': [RoleType.FIRE_CHIEF, RoleType.FIREFIGHTER, RoleType.PARAMEDIC],
  'Medic': [
    RoleType.NURSE,
    RoleType.DISPATCHER,
    RoleType.POLICE_CHIEF,
    RoleType.PATROL_OFFICER,
    RoleType.FIRE_CHIEF,
    RoleType.FIREFIGHTER,
    RoleType.PARAMEDIC
  ],
  'Nurses': [RoleType.NURSE],
};

const ROLE_TO_DEFAULT_GROUP_NAMES = getRoleTypeToDefaultGroupNamesMapping(
  Object.values(RoleType), Object.values(DEFAULT_GROUPS), DEFAULT_GROUP_NAME_TO_ROLES);

var GroupSchema = Schema(
  {  // according to Models on https://app.swaggerhub.com/apis/TheRkZai/ESN/1.0
    name: {type: String, required: true, unique: true},
    description: {type: String},
    owner: {type: Schema.Types.ObjectId, ref: 'User'},
    participants: [{type: Schema.Types.ObjectId, ref: 'User'}],
  },
  {usePushEach: true}
);

GroupSchema.statics.DEFAULT_GROUPS = DEFAULT_GROUPS;
GroupSchema.statics.DEFAULT_GROUP_NAME_TO_ROLES = DEFAULT_GROUP_NAME_TO_ROLES;
GroupSchema.statics.ROLE_TO_DEFAULT_GROUP_NAMES = ROLE_TO_DEFAULT_GROUP_NAMES;

function getRoleTypeToDefaultGroupNamesMapping (roleTypes, defaultGroupNames, defaultGroupNamesToRoles) {
  let roleToGroupNames = {};
  roleTypes.forEach(function (roleName) {
    let defaultGroupNamesForThisRole = [];
    defaultGroupNames.forEach(function (groupName) {
      if (defaultGroupNamesToRoles[groupName].indexOf(roleName) > -1) {
        defaultGroupNamesForThisRole.push(groupName);
      }
    });
    roleToGroupNames[roleName] = defaultGroupNamesForThisRole;
  });
  return roleToGroupNames;
}

module.exports = GroupSchema;
