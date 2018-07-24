const dbUtil = require('../util/dbUtil');
const InventoryRequest = dbUtil.getModel('InventoryRequest');

const InventoryRequestDAO = require('../util/dao/inventoryRequestDAO');

const {isFirstResponder, isNurse} = require('../util/privilegeUtil');

class InventoryRequestController {
  createRequest (req, res) {
    // Only first responders can create requests.
    let role = req.session.user.role;
    if (!isFirstResponder(role)) {
      res.status(403).json({message: 'Only First Responders Can Create Inventory Requests'});
      return;
    }
    if (!('truckId' in req.body) ||
        !('hospitalId' in req.body) ||
        !('itemCounts' in req.body)) {
      res.status(422).json({message: 'Not enough parameters'});
      return;
    }
    let {truckId, hospitalId, itemCounts} = req.body;

    InventoryRequestDAO.create(truckId, hospitalId, itemCounts)
      .then(request => {
        // Notify all clients.
        global.io.emit('InventoryRequestCreated', request.id);

        // Notify all the nurses in this hospital.
        let nurseIds = new Set(request.hospital.nurse.map(String));

        for (let client of global.clients_list) {
          if (nurseIds.has(client.id)) {
            client.Socket.emit('InventoryRequestCreatedAlert', request.displayId);
          }
        }

        res.status(201).json(request);
      })
      .catch(err => {
        let status = err instanceof InventoryRequest.Error.RequestExisted ? 409 : 404;
        res.status(status).json({message: err.message});
      });
  }

  getRequest (req, res, next) {
    let requestId = req.params.requestId;

    InventoryRequestDAO.getById(requestId)
      .then(request => {
        res.json(request);
      })
      .catch(err => res.status(404).json({message: err.message}));
  }

  getRequests (req, res, next) {
    let requestId = req.params.requestId;
    if (req.query.truckId) {
      let truckId = req.query.truckId;

      InventoryRequestDAO.getAllByTruckId(truckId)
        .then(requests => res.status(200).json(requests))
        .catch(err => next(err));
    } else if (req.query.hospitalId) {
      let hospitalId = req.query.hospitalId;

      InventoryRequestDAO.getAllByHospitalId(hospitalId)
        .then(requests => res.status(200).json(requests))
        .catch(err => next(err));
    } else {
      InventoryRequestDAO.getAll()
        .then(requests => res.json(requests))
        .catch(err => next(err));
    }
  }

  updateRequest (req, res, next) {
    // Only first responders and nurses can update requests.
    let role = req.session.user.role;
    if (!isFirstResponder(role) && !isNurse(role)) {
      res.status(403).json({message: 'Only First Responders Or Nurses Can Update Inventory Requests'});
      return;
    }

    let requestId = req.params.requestId;
    let status = req.body.status;

    InventoryRequestDAO.updateStatusById(requestId, status)
      .then(request => {
        //Updating truck if put on-truck
        if(request.status === 'on-truck') {
          InventoryRequestDAO.updateInventoryObject(request._id, (inventory) => {
            res.json(inventory);
          });
        } else if (request.status ===  'ready') {
          global.io.emit('Resource Request Ready for Pickup', request);
        }
        global.io.emit('Resource Request Status Change');
        res.status(200).json(request);
      })
      .catch(err => {
        let status = err.name === 'ValidationError' ? 422 : 404;
        res.status(status).json({message: err.message});
      });
  }
}

module.exports = InventoryRequestController;
