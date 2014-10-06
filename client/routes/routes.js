Router.onBeforeAction(function () {
  if (!Meteor.loggingIn() && !Meteor.user())
    this.redirect("home");

}, {except: ["home"]}); //forgot password page

Router.onBeforeAction(function () {
  if (Meteor.user())
    this.redirect("game");

}, {only: ["home"]});

Router.map(function() {
  this.route("home", { 
    path: "/"
  });
  this.route("game");
});