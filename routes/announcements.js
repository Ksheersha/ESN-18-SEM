'use strict';

var express = require('express');
var router = express.Router();
var AnnouncementController = require('../controllers/announcementController');
var controller = new AnnouncementController();

/* Retrieve all messages posted on public wall */
router.get('/public',controller.getHistoryAnnouncement);

/* Post a message on public wall from a user*/
router.post('/public', controller.postNewAnnouncement);

/* Retrieve all messages posted on public wall by a user */
// router.get('/public/:userName', controller.getUserMessage);

module.exports = router;
