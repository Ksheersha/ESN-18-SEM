let dbUtil = require('../dbUtil');
let User = dbUtil.getModel('User');
let Status = dbUtil.getModel('Status');

class UserDAO {
  static newUser(userData) {
    return new User({
      username: userData.username,
      password: userData.password,
      status: new Status({
          status: userData.status,
          timestamp: new Date(),
          location: ""
      }),
      isOnline: userData.isOnline,
      role:userData.role,
      isCoordinator: userData.isCoordinator,
      isActive:userData.isActive
    });
  }

  // Get all users fulfills condition and sort by sortedItem
  static getAllUsers(condition, sortedItem, callback) {
    return User.find(condition).sort(sortedItem).exec(callback);
  }

  static findUser(condition) {
    return User.findOne(condition).exec();
  }

  static findUserById(id) {
    return User.findById(id);
  }

  static updateUser(condition, update) {
    return User.update(condition, update);
  }

  static addUser(userData) {
    return UserDAO.newUser(userData).save()
  }

  static recordLogoutTime (userId) {
    return User.findOneAndUpdate({_id: userId}, {lastLogout: new Date()}, {new: true});
  }

  static getLastLogoutForUser (userId) {
    return User.findOne({_id: userId}, 'lastLogout');
  }

  static getLastLocationById (userId) {
    return User.findOne({_id: userId}, 'location');
  }
}

exports.UserDAO = UserDAO;
