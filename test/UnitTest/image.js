var expect = require('expect.js');

process.env.NODE_ENV = "test";
var db = require('../../util/mockDB');
var imageDAO = require('../../util/dao/imageDAO');

var testImage = "Dummy image content";
var testId = "";
var wrongTestId = "";
suite('Image Unit Test', function() {

    suiteSetup(function(done) {
        db.setup(function() {
            // setting up mock database with test user
            imageDAO.saveImage(testImage,function (err, image) {
                testId = image._id;
                done();
            })
        });
    });

    test("Retrieve Image successfully",function (done) {
        imageDAO.getImageById(testId).then(function (getImage) {
            expect(getImage.content).to.equal(testImage);
            done();
        })
    });


    test("Retrieve Image failed",function (done) {
        imageDAO.getImageById(wrongTestId).then(function (getImage) {
            expect(getImage.content).to.equal(null);
            done();
        }).catch(function (err) {
            expect(err).not.to.equal(null);
            done();
        })
    });
    
    suiteTeardown(db.teardown);
});

