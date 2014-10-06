Router.onBeforeAction(function () {
  if (!Meteor.loggingIn() && !Meteor.user())
    this.redirect("home");

}, {except: ["home"]});

Router.onBeforeAction(function () {
  if (Meteor.user()) {
    if (!!Session.get("currentRoom"))
      this.redirect("game");
    else 
      this.redirect("rooms");
  }

}, {only: ["home"]});

Router.map(function() {
  this.route("home", { 
    path: "/"
  });
  this.route("rooms", {
    path: "/rooms"
    // , waitOn: function () {
    //   return Meteor.subscribe("rooms");
    // }
  });
  this.route("game", {
    path: "/rooms/:_id",
    // , waitOn: function () {
    //   return Meteor.subscribe("room", this.params._id); // players (filtered by online), entities, etc
    // },
    data: function () {
      Session.set("currentRoom", this.params._id);
      //return Rooms.findOne(this.params._id);
    }
  });
});