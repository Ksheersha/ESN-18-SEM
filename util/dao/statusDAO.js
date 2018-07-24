let dbUtil = require('../dbUtil');
let Status = dbUtil.getModel('Status');

class StatusDAO {
  static createNewStatus(statusData) {
    return new Status({
      status: statusData.status,
      location: statusData.location,
      timestamp: new Date(),
    });
  }
}

exports.StatusDAO = StatusDAO;
