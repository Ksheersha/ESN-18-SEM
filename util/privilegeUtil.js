var dbUtil = require('./dbUtil');
var User = dbUtil.getModel('User');

class PrivilegeUtil { // Privilege Role Use-case Diagram can be checked at : http://jira.sv.cmu.edu:8090/display/ESN/Responder+Use-Case+Diagram
    static isResponder (role) {
        let responder = [User.roleType.DISPATCHER,
              User.roleType.POLICE_CHIEF,
              User.roleType.PATROL_OFFICER,
              User.roleType.FIRE_CHIEF,
              User.roleType.FIREFIGHTER,
              User.roleType.PARAMEDIC];
        return responder.indexOf(role) > -1;
    }

    static isDispatcher (role) {
        return role === User.roleType.DISPATCHER;
    }

    static isFirstResponder (role) {
        let firstResponder = [
          User.roleType.POLICE_CHIEF,
          User.roleType.PATROL_OFFICER,
          User.roleType.FIRE_CHIEF,
          User.roleType.FIREFIGHTER,
          User.roleType.PARAMEDIC];
        return firstResponder.indexOf(role) > -1;
    }

    static isNurse (role) {
        return role === User.roleType.NURSE;
    }

    static isAdministrator (role) {
        return role === User.roleType.ADMINISTRATOR;
    }

}

module.exports = PrivilegeUtil;
