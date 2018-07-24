let dbUtil = require('../dbUtil');
let HTTPStatus = require('http-status');
let Vehicle = dbUtil.getModel('Vehicle');
let User = dbUtil.getModel('User');

class VehicleDAO {
  static putPersonnelIntoVehicle(vehicleId, userId) {
    return User.findById(userId).then(user => {
      if (user) {
        return this.updateVehicleById(vehicleId,
          {
            $addToSet: {
              persons: userId
            }
          })
          .catch(err => {
            console.error('Error when adding user to a vehicle.');
            throw err;
          });
      } else {
        return Promise.reject(new Error('User not found.'));
      }
    })
  }

  static updateVehicleLocation (vehicleId, location) {
    return this.updateVehicleById(vehicleId, {location: location})
    .catch(err => {
      console.error('Error when updating vehicle location.');
      throw err;
    });
  }

  static getPersonnelOutOfVehicle (userId) {
    return User.findById(userId).then(user => {
      if (user) {
        return Vehicle.findOneAndUpdate(
          { persons: userId },
          { $pull: { persons: userId }},
          { new: true}
          )
        .catch(err => {
          console.error('Error when removing user from a vehicle.');
          throw err;
        });
      } else {
        return Promise.reject(new Error('User not found.'));
      }
    })
  }

  static updateVehicleById (vehicleId, update) {
    let options = {
      new: true
    };
    return Vehicle.findByIdAndUpdate(vehicleId, update, options);
  }

  static getTruckById(id) {
    return Vehicle.findById(id).exec();
  }

  static getVehicleByUserId(userId) {
    return Vehicle.find({persons: userId}).exec();
  }

  static getVehicleById (vehicleId) {
    return Vehicle.find({_id: vehicleId}).populate("persons").populate("allocated.to")
            .exec();
  }

}

module.exports = VehicleDAO;
