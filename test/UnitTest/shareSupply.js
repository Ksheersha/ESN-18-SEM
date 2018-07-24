let expect = require('expect.js');

process.env.NODE_ENV = "test";
let db = require('../../util/mockDB');

let DAO = require('../../util/dao/supplyDAO').SupplyDAO;

suite('Share Supply Unit Test', function() {
  suiteSetup(function (done) {
    db.setup(function () {
      done();
    })
  })
  
  test('Add a new supply', function(done) {
    let supply = {
      name: "supplyTest",
      quantity: "1",
      location: "CMU SV",
      description: "haha",
      ownerId: "1234"
    };
    DAO.addSupply(supply).then(function(supplyEcho) {
      expect(supplyEcho.name).to.equal('supplyTest');
      expect(supplyEcho.quantity).to.equal('1');
      expect(supplyEcho.location).to.equal('CMU SV');
      expect(supplyEcho.description).to.equal('haha');
      expect(supplyEcho.ownerId).to.equal('1234');
      done();
    }, function(err) {
      fail(err);
    });
  });

  test('Add a new supply without description', function(done) {
    let supply = {
      name: "supplyTest",
      quantity: "1",
      location: "CMU SV",
      ownerId: "1234"
    };
    DAO.addSupply(supply).then(function(supplyEcho) {
      expect(supplyEcho.name).to.equal('supplyTest');
      expect(supplyEcho.quantity).to.equal('1');
      expect(supplyEcho.location).to.equal('CMU SV');
      expect(supplyEcho.ownerId).to.equal('1234');
      done();
    }, function(err) {
      fail(err);
    });
  });

  test('Fail to add supply by missing ownerId', function(done) {
    let supply = {
      name: "supplyTest",
      quantity: "1",
      location: "CMU SV",
      description: "haha"
    };
    DAO.addSupply(supply)
      .then(function(supplyEcho) {
        fail();
      }, function(err) {
        expect(err).not.to.be.equal(null);
        done();
      });
  });

  test('Fail to add supply by missing location', function(done) {
    let supply = {
      name: "supplyTest",
      quantity: "1",
      description: "haha",
      ownerId: "1234"
    };
    DAO.addSupply(supply)
      .then(function(supplyEcho) {
        fail();
      }, function(err) {
        expect(err).not.to.be.equal(null);
        done();
      });
  });

  test('Fail to add supply by missing quantity', function(done) {
    let supply = {
      name: "supplyTest",
      location: "CMU SV",
      description: "haha",
      ownerId: "1234"
    };
    DAO.addSupply(supply)
      .then(function(supplyEcho) {
        fail();
      }, function(err) {
        expect(err).not.to.be.equal(null);
        done();
      });
  });

  test('Fail to add supply by missing supply name', function(done) {
    let supply = {
      quantity: "1",
      location: "CMU SV",
      description: "haha",
      ownerId: "1234"
    };
    DAO.addSupply(supply)
      .then(function(supplyEcho) {
        fail();
      }, function(err) {
        expect(err).not.to.be.equal(null);
        done();
      });
  });

  test('Get all supplies', function(done) {
    let supply2 = {
      name: "supplyTest2",
      quantity: "2",
      location: "CMU SV",
      description: "lalalala",
      ownerId: "5678"
    };

    DAO.addSupply(supply2).then(function(supplyEcho) {
      DAO.getSupply({}, {
        timestamp: 1
      }, function(err, supplies) {
        expect(err).to.be.equal(null);
        expect(supplies[supplies.length-1].name).to.equal("supplyTest2");
        expect(supplies[supplies.length-1].quantity).to.equal("2");
        expect(supplies[supplies.length-1].location).to.equal("CMU SV");
        expect(supplies[supplies.length-1].description).to.equal("lalalala");
        expect(supplies[supplies.length-1].ownerId).to.equal("5678");
        done();
      });
    });
  });

  test("Request supply from user", function(done) {
    let supply3 = {
      name: "supplyTest3",
      quantity: "3",
      location: "CMU SV",
      description: "intern!",
      ownerId: "9999"
    };
    DAO.addSupply(supply3).then(function(supplyEcho) {
      let supplyId = supplyEcho._id;
      let requesterId = "0000";
      DAO.updateSupply({
        _id: supplyId
      }, {
        requesterId: requesterId
      }).then(function(result) {
        expect(result.ok).to.equal(1);
        return DAO.findSupplyById({
          _id: supplyId
        });
      }).then(function(updatedSupply) {
        expect(updatedSupply.requesterId).to.equal(requesterId);
        done();
      });
    });
  });

  test("Fail to request supply that is already been requested by others", function(done) {
    let supply4 = {
      name: "supplyTest4",
      quantity: "4",
      location: "CMU SV",
      description: "intern!",
      ownerId: "4444"
    };
    DAO.addSupply(supply4).then(function(supplyEcho) {
      DAO.updateSupply({
        _id: supplyEcho._id
      }, {
        requesterId: "8888"
      }).then(function(result) {
        let supplyId = supplyEcho._id;
        let requesterId = "0000";
        DAO.updateSupply({
          _id: supplyId
        }, {
          requesterId: requesterId
        }).then(function(result) {
          expect(result.nModified).to.equal(0);
          return DAO.findSupplyById({
            _id: supplyId
          });
        }).then(function(updatedSupply) {
          expect(updatedSupply.requesterId).not.to.equal(requesterId);
          done();
        });
      });
    });
  });

  test("Fail to request supply that is his own", function(done) {
    let supply5 = {
      name: "supplyTest4",
      quantity: "4",
      location: "CMU SV",
      description: "intern!",
      ownerId: "4444"
    };
    DAO.addSupply(supply5).then(function(supplyEcho) {
      let supplyId = supplyEcho._id;
      let requesterId = "4444";   // the same as ownerId
      DAO.updateSupply({
        _id: supplyId
      }, {
        requesterId: requesterId
      }).then(function(result) {
        expect(result.ok).to.equal(1);
        return DAO.findSupplyById({
          _id: supplyId
        });
      }).then(function(updatedSupply) {
        expect(updatedSupply.requesterId).to.equal(undefined);
        done();
      });
    });
  });

  test("Delete supply", function(done) {
    let supply6 = {
      name: "supplyTest6",
      quantity: "6",
      location: "CMU SV",
      description: "intern!",
      ownerId: "1111"
    };
    DAO.addSupply(supply6).then(function(supplyEcho) {
      let supplyId = supplyEcho._id;
      DAO.deleteSupplyById({
        _id: supplyId
      }).then(function(result) {
        expect(result.result.ok).to.equal(1);
        done();
      });
    });
  });

  suiteTeardown(db.teardown);
});
