'use strict';

var express = require('express');
var router = express.Router();
var image = require('../controllers/imageController');
var imageController = new image();


router.get('/:imageId', imageController.getImageById);

module.exports = router;