let expect = require('expect.js');

process.env.NODE_ENV = "test";
let db = require('../../util/mockDB');
let dbUtil = require('../../util/dbUtil');
let User = dbUtil.getModel('User');
let UserDAO = require('../../util/dao/userDAO').UserDAO;
let AnnouncementDAO = require('../../util/dao/announcementDAO').AnnouncementDAO;

let user = {
  username: "yangyue",
  password: "hehe",
  status: "OK",
  role:User.roleType.CITIZEN,
  isCoordinator: true,
  isActive: true,
  isOnline: false
};

suite('Post Announcement Unit Test', function () {
  suiteSetup(function (done) {
    db.setup(function () {
      done();
    })
  })

  test('Add a new announcement', function (done) {
    let announcement1 = {
      userName: "yangyue",
      content: "Arthur is AWESOME !!! SUPERMAN !!! OUR BIGBOSS !!!",
      status: "OK"
    };

    UserDAO.addUser(user).then(function(u) {
      AnnouncementDAO.addAnnouncement(announcement1, function(err, announcement){
        expect(err).to.be.equal(null);
        expect(announcement.username).to.equal('yangyue');
        expect(announcement.content).to.equal('Arthur is AWESOME !!! SUPERMAN !!! OUR BIGBOSS !!!');
        done();
      });
    }, function(err) {
      fail(err);
      done();
    });
  });

  test('Get all announcements', function(done){
    let announcement2 = {
      userName: "yangyue",
      content: "What yangyue says is absolutely correct !!!",
      status: "Help"
    };

    UserDAO.addUser(user).then(function(u) {
      AnnouncementDAO.addAnnouncement(announcement2, function(err, msg){
          AnnouncementDAO.getAllAnnouncements({}, {timestamp: 1}, function(err, announcements){
              let lastOne = announcements.length-1;
              expect(err).to.be.equal(null);
              expect(announcements[lastOne-1].username).to.equal('yangyue');
              expect(announcements[lastOne-1].content).to.equal('Arthur is AWESOME !!! SUPERMAN !!! OUR BIGBOSS !!!');
              expect(announcements[lastOne].username).to.equal('yangyue');
              expect(announcements[lastOne].content).to.equal('What yangyue says is absolutely correct !!!');
              done();
          });
      });
    }, function(err) {
      fail(err);
      done();
    });
  });

  suiteTeardown(db.teardown);
});
