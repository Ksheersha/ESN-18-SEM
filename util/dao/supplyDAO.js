var dbUtil = require('../dbUtil');
var Supply = dbUtil.getModel('Supply');

class SupplyDAO {
  /* Retrieve all supply */
  static getSupply(condition, sortedItem, callback) {
    Supply.find(condition).sort(sortedItem).exec(callback);
  }

  static newSupply(supplyData) {
    let supply = new Supply({
      name: supplyData.name,
      quantity: supplyData.quantity,
      location: supplyData.location,
      description: supplyData.description? supplyData.description: "",
      timestamp: new Date(),
      ownerId: supplyData.ownerId
    });
    return supply;
  }

  static addSupply(supplyData) {
    let supply = SupplyDAO.newSupply(supplyData);
    return new Promise(function(resol, rej) {
      supply.save()
      .then(function (supply) {
        resol(supply)
      }) 
      .catch(function (err) {
        rej(err);
      });
    });
  }

  static findSupplyById(id, callback) {
    return Supply.findById(id);
  }

  static updateSupply(condition, update) {
    let strictCondition = {
      _id: condition._id,
      ownerId: {$ne: update.requesterId},
      requesterId: null
    };
    return Supply.update(strictCondition, update).exec();
  }

  static deleteSupplyById(condition, callback) {
    // console.log(condition._id);
    return new Promise(function(resolve, reject) {
      Supply.remove(condition, function(err, ret) {
        if (err) {
          reject(err);
        } else {
          resolve(ret);
          //console.log(ret);
        }
      });
    });
  }

}

exports.SupplyDAO = SupplyDAO;
