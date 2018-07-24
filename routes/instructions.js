'use strict';

let express = require('express');
let router = express.Router();
let FirstAidInstructionsController = require('../controllers/firstAidInstructionsController');
let firstAidInstructionsController = new FirstAidInstructionsController();

// create new first aid instructions
router.post('/', firstAidInstructionsController.createInstruction);
// get all first aid instructions
router.get('/',firstAidInstructionsController.getAllInstructions);
// get one instruction
// router.get('/:category',firstAidInstructionsController.getOneInstruction);

router.get('/:id_', firstAidInstructionsController.getInstructionById);
router.delete('/', firstAidInstructionsController.clear);

module.exports = router;