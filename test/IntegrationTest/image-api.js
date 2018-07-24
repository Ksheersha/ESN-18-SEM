var expect = require('expect.js');
var agent = require('superagent');

var PORT = 3000;
var HOST = 'http://localhost:' + PORT;
var imageDAO = require('../../util/dao/imageDAO');


process.env.NODE_ENV = "test";
// Initiate Server
var www = require('../../bin/www');
var db = require('../../util/mockDB');

var testImage = "Dummy image content";
var testId = "";
var wrongTestId = "dummy";

suite('Image API', function() {
  suiteSetup(function (done) {
    db.setup(function() {
      // setting up mock database with test user
      imageDAO.saveImage(testImage,function (err, image) {
        testId = image._id;
        done();
      })
    });
  });


  test('Send Picture Message to other people', function(done) {
    clients_list.push({'id':"321", "Socket":io});
    clients_list.push({'id':"123", "Socket":io});
    let receiverId = "321"
    let senderId = "123"
    let data = {
      uid: receiverId, // receiver
      sendUid: senderId,
      username: "rkzai",
      content: "dummy image content",
      status: "OK",
    }


    agent.post(HOST + '/messages/private/image')
      .send(data)
      .end(function(err, res) {
        expect(err).to.be.equal(null);
        expect(res.statusCode).not.to.be.equal(404);
        expect(res.statusCode).to.be.equal(201);
        // test the get method
        done();
      });
  });

  test('Fail to send private picture by missing content', function(done) {
    let receiverId = "321"
    let senderId = "123"
    // Dummy Message
    let wrongData = {
      uid: receiverId, // receiver
      sendUid: senderId,
      username: "rkzai",
      status: "OK",
    }
    // test the post method
    agent.post(HOST + '/messages/private/image')
      .send(wrongData)
      .end(function(err, res) {
        expect(err).not.to.be.equal(null);
        expect(res.statusCode).to.be.equal(404);
        done();
      });
  });

  test('Get the image by imageId successfully',function (done) {
    agent.get(HOST + '/image/' + testId)
      .send()
      .end(function (err,res) {
        expect(err).to.be.equal(null);
        expect(res.statusCode).to.be.equal(200);
        expect(res.body.content).to.be.equal(testImage);
        done();
      })
  });


  test('Failed to get the image by imageId',function (done) {
    agent.get(HOST + '/image/' + wrongTestId)
      .send()
      .end(function (err,res) {
        expect(res.statusCode).to.be.equal(404);
        done();
      })
  });

  suiteTeardown(db.teardown);
});