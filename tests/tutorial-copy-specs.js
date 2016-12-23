wd = require('wd');
require('colors');
var _ = require("lodash");
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);
chai.should();
chaiAsPromised.transferPromiseness = wd.transferPromiseness;

// browser capabilities
var DESIREDS = require('../desireds');

// http configuration, not needed for simple runs
wd.configureHttp( {
  timeout: 60000,
  retryDelay: 15000,
  retries: 5
});

// building desired capability
var browserKey = process.env.BROWSER || 'chrome';
var desired = DESIREDS[browserKey];
desired.name = 'example with ' + browserKey;
desired.tags = ['tutorial'];

describe('   mocha spec examples (' + desired.browserName + ')', function() {
  this.timeout(60000);
  var browser;
  var allPassed = true;

  beforeEach(function(done) {
    var username = process.env.SAUCE_USERNAME;
    var accessKey = process.env.SAUCE_ACCESS_KEY;
    browser = wd.promiseChainRemote("ondemand.saucelabs.com", 80, username, accessKey);
    if(process.env.VERBOSE){
      // optional logging
      browser.on('status', function(info) {
        console.log(info.cyan);
      });
      browser.on('command', function(meth, path, data) {
        console.log(' > ' + meth.yellow, path.grey, data || '');
      });
    }
    browser
      .init(desired)
      .nodeify(done);
  });

  afterEach(function(done) {
    allPassed = allPassed && (this.currentTest.state === 'passed');
    browser
      .quit()
      .sauceJobStatus(allPassed)
      .nodeify(done);
  });

  after(function(done) {
    done();
  });

  it("should get home page", function(done) {
    browser
      .get("https://saucelabs-sample-test-frameworks.github.io/training-test-page")
      .title()
      .should.become("I am a page title - Sauce Labs")
      .nodeify(done);
  });


  it("should go to the doc page1", function(done) {
    browser
      .get("https://saucelabs-sample-test-frameworks.github.io/training-test-page")
      .elementById('i am a link')
      .click()
      .waitForElementById("i_am_an_id", 10000)
      .title()
      .should.eventually.include("another")
      .nodeify(done);
  });
});

