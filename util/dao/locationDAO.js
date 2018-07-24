var dbUtil = require('../dbUtil');
var Location = dbUtil.getModel('Location');
let User = dbUtil.getModel('User');

class LocationDAO {
    static createNewLocation(locationData) {
      return {
          type: 'Point',
          coordinates: [parseFloat(locationData.longitude), parseFloat(locationData.latitude)]
      };
    }

    static removeLocationById(id) {
    	return User.findOneAndUpdate ({ _id: id}, {$unset: {location: ""}})
    	.catch(err => {
          console.error('Error when removing location of a user.');
          throw err;
        });
    }
}

exports.LocationDAO = LocationDAO;
