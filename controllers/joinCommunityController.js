let HTTPStatus = require('http-status');
let UserDAO = require('../util/dao/userDAO').UserDAO;
let searcher = require('../util/searcher');
let dbUtil = require('../util/dbUtil');
let UserSchema = dbUtil.getModel('User');
let GroupDAO = require('../util/dao/groupDAO');
let globalCounter = 0;

//
let defaultAdmin = {
  username: 'esnadmin',
  password: 'd033e22ae348aeb5660fc2140aec35850c4da997',
  role: 'Administrator',
  isCoordinator: true,
  isOnline: false,
  status: 'OK'
};

class JoinCommunityController {
  constructor () {
    this.postRegisterUser = this.postRegisterUser.bind(this);
  }

  /* GET users listing. */
  getUserList (req, res) {
    let condition = parseCondition(req);

    if (condition.username === null && condition['status.status'] === null) {
      res.status(HTTPStatus.OK).send();
      return;
    }

    UserDAO.getAllUsers(condition, {isOnline: -1, username: 1}).
      then(userList => {
        res.status(HTTPStatus.OK).json(userList);
      }).
      catch(err => {
        res.sendStatus(HTTPStatus.NOT_FOUND);
      });
  };

  /* POST method to access register page */
  postRegisterUser (req, res) {
    adminMangement();
    let username = req.body.userName;
    let password = req.body.passWord;
    let register = req.body.register;

    UserDAO.findUser({username: username}).then(function (user) {
      if (user != null) {
        // Username already exists
        if (user.password === password) {
          if (user.isActive === true) {
            UserDAO.updateUser({username: username}, {isOnline: true}).
              then(function () {
                saveUserToSession(user, req);
                global.io.emit('reload user directory');
                res.status(200).send(user);
              });
          } else
            res.sendStatus(402);
        } else {
          res.sendStatus(400);
        }
      } else {
        if (register === 'true') {
          var data = {
            username: username,
            password: password,
            role: 'Citizen',
            isCoordinator: false,
            status: 'undefined',
            isOnline: true,
            isActive: true
          }
          UserDAO.addUser(data).then(function (user) {
            saveUserToSession(user, req);
            global.io.emit('reload user directory');
            GroupDAO.updateUserGroupInfoWhenRoleChanges(user, user.role,
              user.role, user.isCoordinator).then(() => {
              res.status(201).send(user);
            }).catch(err => {
              console.error(err);
              res.status(HTTPStatus.INTERNAL_SERVER_ERROR).send(err);
            });

          }, function (err) {
            res.sendStatus(403);
          });
        } else {
          res.sendStatus(401);
        }
      }
    });
  };

  /* GET a specific user's record */
  getUserRecord (req, res) {
    let userName = req.params.userName;
    UserDAO.findUser({username: userName}).then(function (user) {
      if (user) {
        let data = structData(user);
        res.status(200).json(data);
      } else {
        res.sendStatus(404);
      }
    });
  };

  /* SET a specific user's record */

  // FIXME: ugly promise usage
  setUserById (req, res) {
    let condition = {_id: req.params.userId};
    let update = {};
    update.username = req.body.username;
    update.role = req.body.role;
    if (update.role === UserSchema.roleType.ADMINISTRATOR ||
      update.role === UserSchema.roleType.FIRE_CHIEF ||
      update.role === UserSchema.roleType.POLICE_CHIEF) {
      update.isCoordinator = true;
    }
    else {
      update.isCoordinator = req.body.isCoordinator;
    }
    update.isActive = req.body.isActive;
    if (req.body.password !== null &&
      req.body.password !== 'da39a3ee5e6b4b0d3255bfef95601890afd80709') {
      update.password = req.body.password;
    }
    // FIXME: ugly promise usage
    UserDAO.findUserById(condition._id).then(user => {
      return UserDAO.updateUser(condition, update).then(function (status) {
        if (status.ok === 1) {
          global.io.emit('reload user directory');
          // FIXME: countAdmin should return Promise
          countAdmin();
          forceLogout(req.params.userId);
          // update group info if role changes
          if (user.role !== update.role ||
            user.isCoordinator !== update.isCoordinator) {
            GroupDAO.updateUserGroupInfoWhenRoleChanges(user, user.role,
              update.role, update.isCoordinator).then(() => {
              res.sendStatus(200);
            }).catch(err => {
              console.error(err);
              res.status(HTTPStatus.INTERNAL_SERVER_ERROR).send(err);
            });
          } else {
            res.sendStatus(200);
          }
        } else {
          res.status(HTTPStatus.INTERNAL_SERVER_ERROR).send(status);
        }
      });
    }).catch(function (err) {
      console.error(err);
      res.status(HTTPStatus.INTERNAL_SERVER_ERROR).send(err);
    })
  };

  getUserById (req, res) {
    let id = req.params.uid;
    UserDAO.findUserById(id).then(function (user) {
      if (user) {
        let data = structData(user);
        res.status(200).json(data);
      } else {
        res.sendStatus(404);
      }
    });
  }

  getUsersInNetworkGivenRole (req, res) {
    let condition = parseCondition(req);
    if (condition.username === null && condition['status.status'] === null) {
      res.status(HTTPStatus.OK).send();
      return;
    }

    // TODO: central authorization scheme for RESTful API

    let role = req.params.role;
    let responder = [
      UserSchema.roleType.DISPATCHER,
      UserSchema.roleType.POLICE_CHIEF,
      UserSchema.roleType.PATROL_OFFICER,
      UserSchema.roleType.FIRE_CHIEF,
      UserSchema.roleType.FIREFIGHTER,
      UserSchema.roleType.PARAMEDIC
    ];

    if (responder.includes(role)) {
      condition.role = {$in: responder}
    } else if (role === UserSchema.roleType.CITIZEN ||
      role === UserSchema.roleType.NURSE) {
      condition.role = role;
    } else if (role !== UserSchema.roleType.ADMINISTRATOR) {
      condition.role = UserSchema.roleType.CITIZEN;
    }

    UserDAO.getAllUsers(condition, {isOnline: -1, username: 1}).
      then(userList => {
        res.status(HTTPStatus.OK).json(userList);
      }).
      catch(err => {
        res.status(HTTPStatus.INTERNAL_SERVER_ERROR).send(err);
      });
  }

  getUsersByRole (req, res) {
    let role = req.params.role;
    UserDAO.getAllUsers({'role': role}, {}).then((userList) => {
      res.status(HTTPStatus.OK).json(userList);
    }).catch(err => {
      res.status(HTTPStatus.INTERNAL_SERVER_ERROR).send(err)
    })
  }
}

module.exports = JoinCommunityController;

function structData (user) {
  return {
    id: user._id,
    username: user.username,
    isOnline: user.isOnline,
    role: user.role,
    isCoordinator: user.isCoordinator,
    isActive: user.isActive,
    location: user.location,
    status: user.status,
    phoneNumber: user.phoneNumber
  };
}

function saveUserToSession (user, req) {
  let sessionData = {
    username: user.username,
    role: user.role,
    isCoordinator: user.isCoordinator,
    id: user._id,
    status: user.status,
    phoneNumber: user.phoneNumber
  };
  req.session.user = sessionData;
}

/**
 * Parse userList request condition from a request object
 * @param req
 */
function parseCondition (req) {
  let condition = {};
  if (req.query.keywords) {
    let keywords = req.query.keywords;
    if (/ok|help|emergency|undefined/i.test(keywords)) {
      // filter out partial status words
      keywords = decodeURIComponent(keywords).
        split(' ').
        filter((s) => s.match(/ok|help|emergency|undefined/i)).
        join(' ');
      condition['status.status'] = searcher.getRegexForSearch(keywords);
    } else condition.username = searcher.getRegexForSearch(keywords);
  }

  //// filter all the inactive user
  if (req.query.includeInactives &&
    req.query.includeInactives.toString() === 'false') {
    condition.isActive = true;
  }
  return condition;
}

function countAdmin () {
  UserDAO.getAllUsers(null, null, function (err, userList) {
    let count = 0;
    for (n in userList) {
      if (userList[n].role === 'Administrator') {
        count++;
      }
    }
    if (count === 0) {
      let admin = defaultAdmin;
      admin.username = 'esnadmin' + globalCounter;
      globalCounter++;
      UserDAO.addUser(admin).then(user => {
        GroupDAO.updateUserGroupInfoWhenRoleChanges(user, user.role,
          user.role, true);
      });
    }
  })
}

//////// Belows are code used to check whether the admin exists
//////// If exists, then do nothing, if not exists, create one
///////  password of admin is "d033e22ae348aeb5660fc2140aec35850c4da997"
function adminMangement () {
  return new Promise(function (resolve, reject) {
    UserDAO.findUser({username: 'esnadmin'}).then(function (user) {
      if (user === null) {
        UserDAO.addUser(defaultAdmin).then(function (user) {
          GroupDAO.updateUserGroupInfoWhenRoleChanges(user, user.role,
            user.role, true);
          resolve(user);
        });
      }
    }).catch(function (err) {
      reject(err);
    })
  });
}

function forceLogout (userID) {
  let sourceSocket = '';
  for (let n in clients_list) {
    if (clients_list[n].id === userID) sourceSocket = clients_list[n].Socket;
  }
  if (sourceSocket !== '') {
    sourceSocket.emit('force logout');
  }
}
