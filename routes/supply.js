'use strict';

var express = require('express');
var router = express.Router();
var ShareSupplyController = require('../controllers/shareSupplyController');
var shareSupplyController = new ShareSupplyController();


/* Retrieve all supplies posted */
router.get('/', shareSupplyController.getSupply);

router.get('/:supplyId', shareSupplyController.getSupplyById)

/* Post a supply from a user*/
router.post('/', shareSupplyController.postNewSupply);


/* Request supply from another user */
router.post('/request', shareSupplyController.requestSupply);

/* Delete a supply */
router.post('/delete', shareSupplyController.deleteSupply);

module.exports = router;
