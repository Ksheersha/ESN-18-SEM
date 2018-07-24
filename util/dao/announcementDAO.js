var dbUtil = require('../dbUtil');
var Announcement = dbUtil.getModel('Announcement');

class AnnouncementDAO {
  // Add announcement
  static addAnnouncement(announce, callback) {
      var announcement = new Announcement({
          username: announce.userName,
          content: announce.content,
          timestamp: new Date(),
          status: announce.status
      });
      announcement.save(callback);
  }

  static getAllAnnouncements(condition, sortedItem, callback) {
      Announcement.find(condition).sort(sortedItem).exec(callback);
  }

}

exports.AnnouncementDAO = AnnouncementDAO;
