'use strict';

var express = require('express');
var router = express.Router();
var ChatPubliclyController = require('../controllers/chatPubliclyController');
var publicController = new ChatPubliclyController();
var ChatPrivatelyController = require('../controllers/chatPrivatelyController');
var privateController = new ChatPrivatelyController();
var ChatGroupController = require('../controllers/chatGroupController');
var groupController = new ChatGroupController();


/* Retrieve all messages posted on public wall */
router.get('/public',publicController.getPublicWall);

/* Post a message on public wall from a user */
router.post('/public', publicController.postNewMessage);

/* Retrieve all messages posted on public wall by a user */
router.get('/public/:userName', publicController.getUserMessage);

/* Retrieve all priagte messages posted between two users */
router.get('/private/:fromID/:toID',privateController.getPrivateMessage);

/* Post a private messages to other user */
router.post('/private',privateController.sendPrivateMessage);

/* Post a private image messages to other user*/
router.post('/private/image',privateController.sendPrivateImageMessage);

/* Retrieve all messages posted within group */
router.get('/group/:groupID',groupController.getGroupMessage);

/* Post a messages to a group */
router.post('/group',groupController.sendGroupMessage);

/* Post a image to a group */
router.post('/group/image',groupController.sendGroupImageMessage);


module.exports = router;
