(function () {

  'use strict';

  var assert = require('assert');

  module.exports = function () {

    var helper = this;

    this.Given(/^I am a user currently in\-game$/, function (callback) {
      // helper.world.browser.
      //   waitForExist('#login-sign-in-link').
      //   click('#login-sign-in-link').
      //   waitForExist('#login-name-link').
      //   click('.rooms a[href]').
      //   waitForExist('#canvas-players').
      //   call(callback);
      callback.pending();
    });

    this.When(/^I click on another player's icon$/, function (callback) {
      callback.pending();
    });

    this.Then(/^I see an option to initiate a challenge$/, function (callback) {
      // Write code here that turns the phrase above into concrete actions
      callback.pending();
    });

    this.Given(/^I am a user that can propose challenges$/, function (callback) {
      // Write code here that turns the phrase above into concrete actions
      callback.pending();
    });

    this.When(/^I click on the option to initiate a challenge$/, function (callback) {
      // Write code here that turns the phrase above into concrete actions
      callback.pending();
    });

    this.Then(/^I see an indicator of a pending challenge$/, function (callback) {
      // Write code here that turns the phrase above into concrete actions
      callback.pending();
    });

    this.Given(/^I am a user that has already proposed a challenge$/, function (callback) {
      // Write code here that turns the phrase above into concrete actions
      callback.pending();
    });

    this.Then(/^I see a message indicating a one\-challenge limit$/, function (callback) {
      // Write code here that turns the phrase above into concrete actions
      callback.pending();
    });

    this.When(/^I challenge a user who already accepted a challenge$/, function (callback) {
      // Write code here that turns the phrase above into concrete actions
      callback.pending();
    });

    this.Then(/^I see a message indicating the other user is occupied$/, function (callback) {
      // Write code here that turns the phrase above into concrete actions
      callback.pending();
    });

    this.Given(/^I am a user that has received a challenge$/, function (callback) {
      // Write code here that turns the phrase above into concrete actions
      callback.pending();
    });

    this.When(/^I click on the option to accept the challenge$/, function (callback) {
      // Write code here that turns the phrase above into concrete actions
      callback.pending();
    });

    this.Then(/^I am taken to the battle screen$/, function (callback) {
      // Write code here that turns the phrase above into concrete actions
      callback.pending();
    });

    this.Given(/^I am a user that has already accepted a challenge$/, function (callback) {
      // Write code here that turns the phrase above into concrete actions
      callback.pending();
    });

    this.When(/^I click on the option to accept a challenge$/, function (callback) {
      // Write code here that turns the phrase above into concrete actions
      callback.pending();
    });

  };

})();
