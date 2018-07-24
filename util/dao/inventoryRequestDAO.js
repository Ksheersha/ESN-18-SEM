const dbUtil = require('../dbUtil');
const Hospital = dbUtil.getModel('Hospital');
const InventoryRequest = dbUtil.getModel('InventoryRequest');
const Vehicle = dbUtil.getModel('Vehicle');
const InventoryItem = dbUtil.getModel('InventoryItem');
const InventoryDAO = require('../dao/inventoryDAO');

class InventoryRequestDAO {
  static create (truckId, hospitalId, itemCounts) {
    let truck = null;
    let hospital = null;

    // Get the truck and hospital objects first.
    return Vehicle.findById(truckId).exec()
      .then(truckObj => {
        if (!truckObj) throw new InventoryRequest.Error.InvalidArguments(`Invalid truck ID: ${truckId}`);

        truck = truckObj;
        return Hospital.findById(hospitalId).exec();
      })
      .then(hospitalObj => {
        if (!hospitalObj) throw new InventoryRequest.Error.InvalidArguments(`Invalid hospital ID: ${hospitalId}`);

        hospital = hospitalObj;

        // Make sure the truck does not have active requests.
        return InventoryRequest.count({
          truck: truckId,
          status: {$ne: InventoryRequest.Status.ON_TRUCK}
        }).exec();
      })
      .then(activeCount => {
        if (activeCount > 0) throw new InventoryRequest.Error.RequestExisted(`Truck ${truckId} already has an active inventory request`);

        // Count the existing requests for this truck.
        return InventoryRequest.count({truck: truckId}).exec();
      })
      .then(requestCount => {
        let truckName = truck.name.replace(' ', '_');
        let displayId = `RR_${truckName}_${requestCount + 1}`;

        let attrs = {
          displayId,
          truck: truck,
          hospital: hospital
        };

        if ('bandage' in itemCounts) attrs.bandageCount = itemCounts['bandage'];
        if ('antibiotics' in itemCounts) attrs.antibioticsCount = itemCounts['antibiotics'];
        if ('pain-killer' in itemCounts) attrs.painKillerCount = itemCounts['pain-killer'];
        if ('ointment' in itemCounts) attrs.ointmentCount = itemCounts['ointment'];
        if ('aspirin' in itemCounts) attrs.aspirinCount = itemCounts['aspirin'];
        if ('cold-compress' in itemCounts) attrs.coldCompressCount = itemCounts['cold-compress'];
        if ('sanitizer' in itemCounts) attrs.sanitizerCount = itemCounts['sanitizer'];

        return InventoryRequest.create(attrs);
      });
  }

  static getById (id) {
    return InventoryRequest.findById(id).populate('truck hospital').exec()
      .then(request => {
        if (!request) throw new InventoryRequest.Error.InvalidArguments(`Invalid request ID: ${id}`);

        return request;
      })
      .catch(err => {
        throw err;
      });
  }

  static getAllByTruckId (truckId) {
    return InventoryRequest.find({truck: truckId}).populate('truck hospital').exec();
  }

  static getAllByHospitalId (hospitalId) {
    return InventoryRequest.find({hospital: hospitalId}).populate('truck hospital').exec();
  }

  static getAll() {
    return InventoryRequest.find({}).sort('-createdAt').populate('truck hospital').exec();
  }

  static updateStatusById (id, status) {
    return InventoryRequestDAO.getById(id)
      .then(request => {
        request.status = status;
        request.updatedAt = Date.now();

        return request.save();
      });
  }

  static updateInventoryObject(id, callback) {
    InventoryRequestDAO.getById(id)
      .then(request => {
        let inventoryItemId = request.truck.inventory;
        //Have to give a callback, because inventory.save() doesn't work as promise
        InventoryDAO.updateInventoryByRequest(inventoryItemId, request, (inventory) => {
          callback(inventory);
        });
        // ;
      })
      .catch(err => {throw err;});
  }
}

module.exports = InventoryRequestDAO;
