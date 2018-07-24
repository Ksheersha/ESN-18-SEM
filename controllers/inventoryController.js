'use strict';
let HTTPStatus = require('http-status');
let InventoryDAO = require('../util/dao/inventoryDAO');

class InventoryController {

    getInventory(req, res) {
        InventoryDAO.getInventory(req.params.id)
            .then((data) => {
                res.status(200).send(data);
            })
            .catch(function (err) {
                res.status(500).send(err);
            });
    }

    saveUpdateInventoryInfo(req, res){
        InventoryDAO.saveUpdateInventoryInfo(req.body)
            .then(function (data) {
                res.status(200).send(data);
            })
            .catch(function (err) {
                console.log(err);
                res.status(500).send(err);
            });
    }
}

module.exports = InventoryController;
