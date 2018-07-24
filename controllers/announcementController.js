'use strict';

let AnnouncementDAO = require('../util/dao/announcementDAO').AnnouncementDAO;
let UserDAO = require('../util/dao/userDAO').UserDAO;
let searcher = require('../util/searcher');

/* Class ChatPubliclyController */
module.exports=
class AnnouncementController {

  /* Post a new announcement */
  postNewAnnouncement(req, res) {
    UserDAO.findUser({username: req.body.userName}).then(function(user) {
      if(user != null && user.isCoordinator) {
        AnnouncementDAO.addAnnouncement(req.body, function(err, announcement) {
          if (err)
            res.status(500).send(err);
          else
            res.sendStatus(200);
            global.io.emit("new announcement", JSON.stringify(announcement));
        });
        // Send this new message to every clients
      }
      else {
        res.sendStatus(405);
      }
    });
  };

  /* Retrieve all announcement messages in MongoDB */
  getHistoryAnnouncement(req, res) {
      var condition = {};
      if (req.query.keywords) {
          condition.content = searcher.getRegexForSearch(req.query.keywords);
      }
      if (condition.content === null) {
          res.status(200).send();
          return;
      }

      AnnouncementDAO.getAllAnnouncements(condition, {timestamp:-1}, function(err, announcements){
      if (err)
        res.status(500).send(err);
      else
        res.status(200).json(searcher.pagination(announcements, req.query.start));
    });
  };

  /* Retrieve all chat messages of specific user in MongoDB */
  // getUserMessage(req, res) {
  //   Announcement.find({username: req.params.userName}).sort({timestamp:1}).exec(function(err, announcements){
  //     if (err)
  //       res.send(err);
  //     else
  //       res.status(200).json(announcements);
  //   });
  // };

};
