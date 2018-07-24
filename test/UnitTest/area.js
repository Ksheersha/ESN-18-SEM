let expect = require('expect.js');

process.env.NODE_ENV = "test";
let db = require('../../util/mockDB');

let AreaDAO = require('../../util/dao/areaDAO');
let dbUtil = require('../../util/dbUtil');
let Area = dbUtil.getModel('Area');

suite('Area Unit Test', function() {
  suiteSetup(function(done) {
    db.setup(function() {
     done();
   });
  });

  test('Create 3 Areas', function(done) {
   let a = new Area();
    a['name'] = 'Area_1';
    a.save()
    .then( function() {
      let b = new Area();
      b['name'] = 'Area_2';
      return b.save()
    })
    .then( function () {
      let c = new Area();
      c['name'] = 'Area_3';
      return c.save()
    })
    .then( function () {
      done();
    })
  });

  test('Get all areas', function(done) {
    AreaDAO.getAllAreas()
      .then(function (areas) {
        expect(areas.length).to.be(3);
        for (let i = 0; i < areas.length; i++) {
          expect(areas[i].name).to.be('Area_' + (i+1).toString());
        }
        done();
      });
  });

  suiteTeardown(db.teardown);
});
