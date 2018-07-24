let expect = require('expect.js');

process.env.NODE_ENV = 'test';

let db = require('../../util/mockDB');
let dbUtil = require('../../util/dbUtil');

let dashboardDAO = require('../../util/dao/dashboardDAO');

suite('Dashboard Unit Tests', function () {
  suiteSetup(function (done) {
    db.setup(function () {
      done();
    });
  });

  test('Get Incident Related Info', function (done) {
    dashboardDAO.getIncidentRelatedInfo()
      .then(function (res) {
        expect(res).not.to.be(null);
        expect(res[0].data.datasets[0].data.length).to.equal(4);
        expect(res[1].data.datasets[0].data.length).to.equal(20);
        done();
      });
  });

  test('Get Labels For IncidentsStateAndPriority Chart', function (done) {
    let labels = dashboardDAO.generateLabelsForIncidentStatesAndPrioritiesChart();
    expect(labels.length).to.equal(20);
    expect(labels[0]).to.equal('Waiting in Emergency');
    done();
  });

  test('Push Data For IncidentStatesAndPriorities Chart', function(done) {
    let data = dashboardDAO.pushDataForIncidentStatesAndPrioritiesChart();
    expect(data).not.to.be(undefined);
    done();
  });

  test('Get charts for dashboard', function (done) {
    dashboardDAO.getDataForCharts()
      .then(function (res) {
        expect(res).not.to.be(null);
        expect(res.length).not.to.be(0);
        expect(res[0].options.title.text).to.equal('Number of incidents in different states');
        expect(res[1].options.title.text).to.equal('Number of incidents in different priorities');
        done();
      });
  });

  suiteTeardown(db.teardown);
});
