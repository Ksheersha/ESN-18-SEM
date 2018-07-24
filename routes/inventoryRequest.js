let express = require('express');
let router = express.Router();

let InventoryRequestController = require('../controllers/inventoryRequestController');
let controller = new InventoryRequestController();

router.get('/', controller.getRequests);
router.post('/', controller.createRequest);
router.get('/:requestId', controller.getRequest);
router.patch('/:requestId', controller.updateRequest);

module.exports = router;
