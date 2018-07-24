'use strict'

let express = require('express');
let router = express.Router();
let InventoryController = require('../controllers/inventoryController');
let inventoryController = new InventoryController();


router.get('/:id', inventoryController.getInventory);

router.post('/', inventoryController.saveUpdateInventoryInfo);



module.exports = router;