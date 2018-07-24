'use strict';
let HTTPStatus = require('http-status');
let AreaDAO = require('../util/dao/areaDAO');

class AreaController {

  getAllAreas(req, res) {
    AreaDAO.getAllAreas().then(function (areas) {
      res.status(200).send(areas);
    }).catch(function (err) {
      res.status(500).send(err);
    });
  }
}

module.exports = AreaController;
