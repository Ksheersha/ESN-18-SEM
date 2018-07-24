let expect = require('expect.js');
let db = require('../../util/mockDB');

process.env.NODE_ENV = "test";

let searcher = require('../../util/searcher');

suite('Searcher Unit Test', function () {
  suiteSetup(function (done) {
    db.setup(function () {
      done();
    })
  })
  
  test('getRegexForSearch', function (done) {
    expect(searcher.getRegexForSearch("x").test("xy ")).to.be(true);
    expect(searcher.getRegexForSearch("x").test("  ~ !abcd ")).to.be(false);
    expect(searcher.getRegexForSearch("x y").test("")).to.be(false);
    expect(searcher.getRegexForSearch("x y").test("xz")).to.be(true);
    expect(searcher.getRegexForSearch("x y").test("xy")).to.be(true);
    expect(searcher.getRegexForSearch("x  y").test("yx")).to.be(true);
    expect(searcher.getRegexForSearch("x  y").test("def")).to.be(false);

    // empty keywords list or stop words should has no effect
    expect(searcher.getRegexForSearch("").test("whatever")).to.be(true);
    // all stop words
    expect(searcher.getRegexForSearch("a able about")).to.be(null);
    // mixed stop words and normal words
    expect(searcher.getRegexForSearch("thesis the").test("whatever")).to.be(false);
    done();
  });

  test('Pagination', function (done) {
    let ss = [];
    for (var i = 0; i < 100; i++) {
      ss.push("" + i);
    }
    // with empty `start` param, it should do nothing
    expect(searcher.pagination(ss).length).to.equal(100);
    expect(searcher.pagination(ss, null).length).to.equal(100);
    expect(searcher.pagination(ss, undefined).length).to.equal(100);
    expect(searcher.pagination(ss, "").length).to.equal(100);

    // with invalid param, it should default to 1
    let page = searcher.pagination(ss, -1);
    expect(page.length).to.equal(10);
    expect(page[0]).to.equal("0");

    page = searcher.pagination(ss, -3, -2);
    expect(page.length).to.equal(10);
    expect(page[0]).to.equal("0");

    // should not crash when goes out of limit
    page = searcher.pagination(ss, 99, 200);
    expect(page.length).to.equal(1);
    expect(page[0]).to.equal("99");

    page = searcher.pagination(ss, 100, 200);
    expect(page.length).to.equal(0);

    // happy paths
    page = searcher.pagination(ss, 1);
    expect(page.length).to.equal(10);
    expect(page[0]).to.equal("1");

    page = searcher.pagination(ss, 20, 30);
    expect(page.length).to.equal(30);
    expect(page[0]).to.equal("20");

    // continuous pagination with default limit
    page = searcher.pagination(ss, 20);
    expect(page.length).to.equal(10);
    expect(page[0]).to.equal("20");
    page = searcher.pagination(ss, 30);
    expect(page.length).to.equal(10);
    expect(page[0]).to.equal("30");
    page = searcher.pagination(ss, 40);
    expect(page.length).to.equal(10);
    expect(page[0]).to.equal("40");

    done();
  });

  suiteTeardown(db.teardown);
});
