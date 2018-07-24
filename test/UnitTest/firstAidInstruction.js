let expect = require('expect.js');
let _expect = require('chai').expect;

process.env.NODE_ENV = 'test';

let db = require('../../util/mockDB');
let dbUtil = require('../../util/dbUtil');
let FirstAid = dbUtil.getModel('FirstAidInstruction');

let FirstAidDAO = require('../../util/dao/firstAidInstructionDAO');

suite('FirstAidInstruction Unit Tests', function () {
  suiteSetup(function (done) {
    db.setup(function () {
      done();
    });
  });

  test('Create Instruction', function (done) {
    let category = "Allergy";
    let content = "Pain pain pain!";

    FirstAidDAO.insertNewInstruction(category,content)
      .then(function (data) {
        expect(data.category).to.be.equal(category);
        expect(data.content).to.be.equal(content);
        FirstAidDAO.clear()
          .then(function () {
            done();
          })
      })
  });


  test('Get All instruction in database', function (done) {
    let categoryOne = "Pain One";
    let contentOne = "Content One";
    let categoryTwo = "Pain Two";
    let contentTwo = "Content Two";


    FirstAidDAO.insertNewInstruction(categoryOne,contentOne)
      .then(function (dataOne) {
        FirstAidDAO.insertNewInstruction(categoryTwo,contentTwo)
          .then(function (dataTwo) {
            FirstAidDAO.getAllInstructions()
              .then(function (data) {
                expect(data.length).to.be.equal(2);
                let categoryList = new Array();
                let contentList = new Array();
                categoryList.push(data[0].category);
                categoryList.push(data[1].category);
                contentList.push(data[0].content);
                contentList.push(data[1].content);
                _expect(categoryList).to.deep.include(categoryOne);
                _expect(categoryList).to.deep.include(categoryTwo);
                _expect(contentList).to.deep.include(contentOne);
                _expect(contentList).to.deep.include(contentTwo);
                FirstAidDAO.clear()
                  .then(function () {
                    done();
                  })
              })
          })
      })
  });

  test('Get a instruction in database by name', function (done) {
    let categoryOne = "Pain One";
    let contentOne = "Content One";

    FirstAidDAO.insertNewInstruction(categoryOne,contentOne)
      .then(function (dataOne) {
        FirstAidDAO.getInstructionByName(dataOne.category)
          .then(function (returnData) {
            expect(returnData.category).to.be.equal(categoryOne);
            expect(returnData.content).to.be.equal(contentOne);
            FirstAidDAO.clear()
              .then(function () {
                done();
              })
          })
      })
  });


  test('Get a instruction in database by id', function (done) {
    let categoryOne = "Pain One";
    let contentOne = "Content One";

    FirstAidDAO.insertNewInstruction(categoryOne,contentOne)
      .then(function (dataOne) {
        let instructionId = dataOne._id;
        FirstAidDAO.getInstructionById(instructionId)
          .then(function (returnData) {
            expect(returnData.category).to.be.equal(categoryOne);
            expect(returnData.content).to.be.equal(contentOne);
            FirstAidDAO.clear()
              .then(function () {
                done();
              })
          })
      })
  });

  test('Remove instructions from database', function (done) {
    let categoryOne = "Pain One";
    let contentOne = "Content One";

    FirstAidDAO.insertNewInstruction(categoryOne,contentOne)
      .then(function (dataOne) {
        let instructionId = dataOne._id;
        FirstAidDAO.clear()
          .then(function (dataTwo) {
            FirstAidDAO.getInstructionById(instructionId)
              .then(function (returnData) {
                expect(returnData).to.be.equal(null);
                done();
              })
          })
      })
  });

  suiteTeardown(db.teardown);
});
