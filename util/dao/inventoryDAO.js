let dbUtil = require('../dbUtil');
let HTTPStatus = require('http-status');
let InventoryItem = dbUtil.getModel('InventoryItem');

class InventoryDAO {
  static getInventory (id) {
    return InventoryItem.findById(id).exec();
  }

  static saveUpdateInventoryInfo (inventoryInfo) {
    return InventoryDAO.getInventory(inventoryInfo.inventoryId)
      .then(inventory => {
        if (inventory) {
          return InventoryDAO.updateInventoryInfo(inventory, inventoryInfo);
        } else {
          return InventoryDAO.newInventory(inventoryInfo);
        }
      })
      .catch(() => {
        return InventoryDAO.newInventory(inventoryInfo);
      });
  }

  static updateInventoryInfo (inventory, inventoryInfo) {
    inventory.bandageCurrentCount = inventoryInfo.bandageCurrentCount;
    if (inventoryInfo.bandageExpectedCount) {
      inventory.bandageExpectedCount = inventoryInfo.bandageExpectedCount;
    }
    inventory.antibioticsCurrentCount = inventoryInfo.antibioticsCurrentCount;
    if (inventoryInfo.antibioticsExpectedCount) {
      inventory.antibioticsExpectedCount = inventoryInfo.antibioticsExpectedCount;
    }
    inventory.painKillerCurrentCount = inventoryInfo.painKillerCurrentCount;
    if (inventoryInfo.painKillerExpectedCount) {
      inventory.painKillerExpectedCount = inventoryInfo.painKillerExpectedCount;
    }
    inventory.ointmentCurrentCount = inventoryInfo.ointmentCurrentCount;
    if (inventoryInfo.ointmentExpectedCount) {
      inventory.ointmentExpectedCount = inventoryInfo.ointmentExpectedCount;
    }
    inventory.aspirinCurrentCount = inventoryInfo.aspirinCurrentCount;
    if (inventoryInfo.aspirinExpectedCount) {
      inventory.aspirinExpectedCount = inventoryInfo.aspirinExpectedCount;
    }
    inventory.coldCompressCurrentCount = inventoryInfo.coldCompressCurrentCount;
    if (inventoryInfo.coldCompressExpectedCount) {
      inventory.coldCompressExpectedCount = inventoryInfo.coldCompressExpectedCount;
    }
    inventory.sanitizerCurrentCount = inventoryInfo.sanitizerCurrentCount;
    if (inventoryInfo.sanitizerExpectedCount) {
      inventory.sanitizerExpectedCount = inventoryInfo.sanitizerExpectedCount;
    }
    return inventory.save();
  }

  static updateInventoryByRequest(id, request, callback) {
    InventoryDAO.getInventory(id)
      .then(inventory => {
        inventory.bandageCurrentCount += request.bandageCount;
        inventory.antibioticsCurrentCount += request.antibioticsCount;
        inventory.painKillerCurrentCount += request.painKillerCount;
        inventory.ointmentCurrentCount += request.ointmentCount;
        inventory.aspirinCurrentCount += request.aspirinCount;
        inventory.coldCompressCurrentCount += request.coldCompressCount;
        inventory.sanitizerCurrentCount += request.sanitizerCount;
        inventory.save()
          .then(inventory => callback(inventory));
      })
      .catch(err => {throw err;});
  }

  static newInventory (inventoryData) {
    /* let inventory = new InventoryItem({
            bandageCurrentCount: inventoryData.bandageCurrentCount,
            bandageExpectedCount: inventoryData.bandageExpectedCount,
            petroJellyCurrentCount: inventoryData.petroJellyCurrentCount,
            petroJellyExpectedCount: inventoryData.petroJellyExpectedCount,
            painKillerCurrentCount: inventoryData.painKillerCurrentCount,
            painKillerExpectedCount: inventoryData.painKillerExpectedCount
        });
         return inventory.save(); */
    return inventoryData.save();
  }
}

module.exports = InventoryDAO;
