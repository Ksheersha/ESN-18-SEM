let expect = require('expect.js');
let agent = require('superagent');
let _expect = require('chai').expect;

let PORT = 3000;
let HOST = 'http://localhost:' + PORT;

process.env.NODE_ENV = "test";
// Initiate Server
let www = require('../../bin/www');
let db = require('../../util/mockDB');

let instructionOne = {
  category: "Allergy",
  content:"Pain Pain Pain Pain Pain"
};

let instructionTwo = {
  category: "Stomachache",
  content:"Pain Pain Pain Pain Pain"
};


suite('First Aid Instuction API', function() {

  // Setup a group
  suiteSetup(function(done) {
    db.setup(function() {
      done();
    });
  });


  test('Create first Aid Instruction', function(done) {
    agent.post(HOST + '/instructions')
      .send(instructionOne)
      .end(function(err, res) {
        expect(res.statusCode).to.be.equal(200);
        expect(res.body.category).to.be.equal(instructionOne.category);
        expect(res.body.content).to.be.equal(instructionOne.content);
        agent.delete(HOST + '/instructions')
          .send()
          .end(function () {
            done();
          });
      });
  });

  test('Get all the instructions', function(done) {
    agent.post(HOST + '/instructions')
      .send(instructionOne)
      .end(function(err, res) {
        expect(res.statusCode).to.be.equal(200);
        agent.post(HOST + '/instructions')
          .send(instructionTwo)
          .end(function (err,res) {
            expect(res.statusCode).to.be.equal(200);
            agent.get(HOST + '/instructions')
              .send()
              .end(function (err,res) {
                expect(res.statusCode).to.be.equal(200);
                let instructionsList = res.body;
                expect(instructionsList.length).to.be.equal(2);
                let categoryList = new Array();
                let contentList = new Array();
                categoryList.push(instructionsList[0].category);
                categoryList.push(instructionsList[1].category);
                contentList.push(instructionsList[0].content);
                contentList.push(instructionsList[1].content);
                _expect(categoryList).to.deep.include(instructionOne.category);
                _expect(categoryList).to.deep.include(instructionTwo.category);
                _expect(contentList).to.deep.include(instructionOne.content);
                _expect(contentList).to.deep.include(instructionTwo.content);
                agent.delete(HOST + '/instructions')
                  .send()
                  .end(function () {
                    done();
                  });
              })
          })
      });
  });

  test('Get One Instructions', function(done) {
    agent.post(HOST + '/instructions')
      .send(instructionOne)
      .end(function(err, res) {
        expect(res.statusCode).to.be.equal(200);
        agent.post(HOST + '/instructions')
          .send(instructionTwo)
          .end(function (err,res) {
            agent.get(HOST + '/instructions/' + res.body._id)
              .send()
              .end(function (err,res) {
                let instruction = res.body;
                expect(res.statusCode).to.be.equal(200);
                expect(instruction.content).to.be.equal(instructionTwo.content);
                expect(instruction.category).to.be.equal(instructionTwo.category);
                agent.delete(HOST + '/instructions')
                  .send()
                  .end(function () {
                    done();
                  });
              })
          })
      });
  });

  suiteTeardown(db.teardown);
});
