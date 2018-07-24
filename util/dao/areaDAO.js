let dbUtil = require('../dbUtil');
let Area = dbUtil.getModel('Area');
let User = dbUtil.getModel('User');
let async = require('async');
let _ = require('lodash');


class AreaDAO {
  static getAllAreas() {
    return Area.find({}).exec();
  }
}

module.exports = AreaDAO;
