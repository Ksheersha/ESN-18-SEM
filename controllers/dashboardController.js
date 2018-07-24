'use strict';

const DashboardDAO = require('../util/dao/dashboardDAO');
const dbUtil = require('../util/dbUtil');

class DashboardController {

  getDataForCharts (req, res) {
    DashboardDAO.getDataForCharts(req.params.role)
      .then(function(chartsData) {
        res.status(200).send(chartsData);
      })
      .catch(function (err) {
        console.log('err', err);
        res.status(500).send(err);
      });
  }
}

module.exports = DashboardController;
