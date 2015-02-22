Accounts.ui.config({
  passwordSignupFields: 'USERNAME_ONLY'
});

Meteor.startup(function() {
  Session.setDefault('currentRoom', 0);
});
