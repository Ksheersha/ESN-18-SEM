let dbUtil = require('../dbUtil');
let InventoryDAO = require('../dao/inventoryDAO');
let Organization = dbUtil.getModel('Organization');
let Vehicle = dbUtil.getModel('Vehicle');
let InventoryItem = dbUtil.getModel('InventoryItem');
let Area = dbUtil.getModel('Area');
let User = dbUtil.getModel('User');
let async = require('async');
let _ = require('lodash');

function getVehicleType(chief) {
  if (chief.role === 'PoliceChief') {
    return 'car';
  } else if (chief.role === 'FireChief') {
    return 'truck';
  } else {
    throw new Error('unauthorized chief id');
  }
}

function addVehicle(vehicleType, vehicles, numVehicle) {
  let vehicleTask = [];

  function setDefaultInventory() {

    //let inventory = [];

    let inventoryItem = new InventoryItem({
      bandageCurrentCount: 25,
      bandageExpectedCount: 25,

      antibioticsCurrentCount: 10,
      antibioticsExpectedCount: 10,

      painKillerCurrentCount: 20,
      painKillerExpectedCount: 20,

      ointmentCurrentCount: 15,
      ointmentExpectedCount: 15,

      aspirinCurrentCount: 25,
      aspirinExpectedCount: 25,

      coldCompressCurrentCount: 5,
      coldCompressExpectedCount: 5,

      sanitizerCurrentCount: 4,
      sanitizerExpectedCount: 4


    });
    InventoryDAO.saveUpdateInventoryInfo(inventoryItem);
    //inventory.push(inventoryItem);

    return inventoryItem;
  }

  // add new vehicles
  while (numVehicle > vehicles.length) {
    let v = new Vehicle({
      type: vehicleType
    });

    if (vehicleType.toLowerCase() === 'truck') {
      let inventoryItems = setDefaultInventory();
      v['inventory'] = inventoryItems;
    }

    v['name'] = vehicleType + ' ' + v['_id'].toString().substring(20);
    vehicleTask.push(v.save());
    vehicles.push(v);
  }
  return vehicleTask;
}

function removeVehicle(vehicleType, vehicles, numVehicle) {
  let vehicleTask = [];
  let numDelete = vehicles.length - numVehicle;
  // loop backwards to remove ids
  for (let i = vehicles.length - 1; i >= 0; i -= 1) {
    let v = vehicles[i];
    // check if vehicle is available
    if (!v['allocated'].to && v['persons'].length === 0) {
      if (vehicleTask.length < numDelete) {
        vehicleTask.push(v.remove());
        vehicles.splice(i, 1);
      }
    }
  }
  return vehicleTask;
}

function changeVehicleNumber(vehicleType, vehicles, numVehicle) {
  let vehicleTask = [];
  // add more vehicles
  if (numVehicle > vehicles.length) {
    vehicleTask = addVehicle(vehicleType, vehicles, numVehicle);
  }
  // remove unused vehicles
  if (numVehicle < vehicles.length) {
    vehicleTask = removeVehicle(vehicleType, vehicles, numVehicle);
    if (vehicleTask.length < vehicles.length - numVehicle) {
      console.error('fail to delete vehicles.' + vehicleTask.length + '<' + numDelete);
      throw new Error('fail to delete vehicles.');
    }
  }
  return Promise.all(vehicleTask);
}

function changeAreaNumber(areas, numArea, chief) {
  let areaTask = [];
  if (chief['role'] === 'PoliceChief') {
    let numOld = areas.length;
    // add area
    for (let i = numOld + 1; i <= numArea; i += 1) {
      let a = new Area();
      a['name'] = 'Area_' + chief['username'] + '_' + i.toString();
      areaTask.push(a.save());
      areas.push(a);
    }
    // remove area
    for (let i = numOld - 1; i >= numArea; i -= 1) {
      let a = areas[i];
      areaTask.push(a.remove());
    }
    areas.splice(numArea, numOld - numArea);
  }
  return Promise.all(areaTask);
}

function getOneChief(chiefId) {
  let option = {
    upsert: true,
    new: true
  };
  return Organization.findOneAndUpdate({
    chief: chiefId
  }, {
    chief: chiefId
  }, option)
    .populate('vehicles').populate('chief').populate('persons').populate('areas').exec();
}

class OrganizationDAO {
  static updateOrganization(chiefId, org) {
    let vehicleType;
    let updateOrg;
    let chief;
    return getOneChief(chiefId)
      .then(function (newOrg) {
        // Check type of chief, update vehicleType
        chief = newOrg['chief'];
        vehicleType = getVehicleType(chief);

        // update vehicles.
        updateOrg = newOrg;
        let numVehicle = updateOrg.vehicles.length;
        if (org['vehicles']) {
          numVehicle = org['vehicles'];
        }
        return changeVehicleNumber(vehicleType, updateOrg.vehicles, numVehicle);
      })
      .then(function (vehicles) {
        // update persons
        let numPersons = updateOrg['persons'].length;
        if (org['persons']) {
          updateOrg['persons'] = org['persons'];
          numPersons = updateOrg['persons'].length;
        }
        // generate or delete system defined areas
        return changeAreaNumber(updateOrg['areas'], numPersons, chief);
      })
      .then(function (areas) {
        return updateOrg.save();
      })
      .then(function (updateOrg) {
        // populate persons before return
        return Organization.populate(updateOrg, {
          path: "persons"
        });
      });
  }

  static getOrganizationByChiefId(chiefId) {
    return getOneChief(chiefId);
  }

  static getChiefList() {
    return User.find({
      role: {
        $in: ['PoliceChief', 'FireChief']
      }
    })
      .then(function (chiefs) {
        let querys = [];
        for (let i = 0; i < chiefs.length; i += 1) {
          let chiefId = chiefs[i]._id;
          querys.push(getOneChief(chiefId));
        }
        return Promise.all(querys);
      });
  }

  static getOrganizationByPersonnelId(userId) {
    return Organization.findOne({
      persons: userId
    })
      .populate('chief')
      .populate('vehicles')
      .populate('persons')
      .exec();
  }

  static getOrganizationAreasByChiefId(chiefId) {
    return Organization.findOne({chief: chiefId})
    .populate('areas')
    .exec()
    .then(function (organization) {
      return organization.areas;
    })
  }
}

module.exports = OrganizationDAO;
