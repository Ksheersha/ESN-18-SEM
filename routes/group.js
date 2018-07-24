'use strict';

var express = require('express');
var router = express.Router();
var GroupController = require('../controllers/groupController');
var groupController = new GroupController();

/* POST method to create new group */
router.post('/create/:userId', groupController.createGroup);
router.get('/list/:userId', groupController.getAllGroups);
router.get('/info/:groupId', groupController.getOneGroupInfo);
router.post('/exists', groupController.checkExistingGroupName);
router.delete('/delete/:groupId', groupController.deleteGroup);
router.post('/quit/:userId/:groupId', groupController.quitGroup);
router.post('/update/:groupId', groupController.updateGroup);
router.post('/naming', groupController.checkGroupNaming);
router.get('/name/:groupId', groupController.getGroupName);

module.exports = router;
