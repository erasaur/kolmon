(function () {

  'use strict';

  var assert = require('assert');

  module.exports = function () {

    var helper = this;

    this.Given(/^I am a new visitor$/, function (callback) {
      callback();
    });

    this.When(/^I navigate to the landing page$/, function (callback) {
      helper.world.browser.
        url(helper.world.mirrorUrl).
        call(callback);
    });

    this.Then(/^I see the heading "([^"]*)"$/, function (expectedHeading, callback) {
      helper.world.browser.
        getText('h1', function (error, actualHeading) {
          assert.equal(actualHeading, expectedHeading);
          callback();
        });
    });

    this.Then(/^I see a button to sign up$/, function (callback) {
      // Write code here that turns the phrase above into concrete actions
      callback.pending();
    });

  };

})();
