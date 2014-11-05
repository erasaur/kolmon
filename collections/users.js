// Schema.UserProfile = new SimpleSchema({
//   name: {
//     type: String,
//     optional: true
//   },
//   avatar: {
//     type: String,
//     optional: true
//   }
// });

// Schema.UserStats = new SimpleSchema({
//   killCount: {
//     type: Number,
//     min: 0,
//     defaultValue: 0
//   },
//   deathCount: {
//     type: Number,
//     min: 0,
//     defaultValue: 0
//   },
//   isAdmin: {
//     type: Boolean,
//     defaultValue: false
//   },
//   isPremium: {
//     type: Boolean,
//     defaultValue: false
//   }
// });

// Schema.UserPosition = new SimpleSchema({
//   x: {
//     type: Number,
//     decimal: true
//   },
//   y: {
//     type: Number,
//     decimal: true
//   }
// })

// Schema.UserGame = new SimpleSchema({
//   roomId: {
//     type: Number,
//     defaultValue: 0
//   },
//   position: {
//     type: Schema.UserPosition
//   },
//   // TODO: equips, buffs, etc.
// });

// Schema.User = new SimpleSchema({
//   _id: {
//     type: String,
//     optional: true
//   },
//   createdAt: {
//     type: Date,
//     optional: true
//   },
//   username: {
//     type: String // TODO: regex
//   },
//   emails: {
//     type: [Object],
//     optional: true
//   },
//   'emails.$.address': {
//     type: String,
//     regEx: SimpleSchema.RegEx.Email
//   },
//   'emails.$.verified': {
//     type: Boolean
//   },
//   profile: { // public and editable
//     type: Schema.UserProfile
//   },
//   stats: { // public but uneditable
//     type: Schema.UserStats
//   },
//   game: {
//     type: Schema.UserGame
//   }
// });

Survivor.Users = { 
  // getPosition: function (userId) { 
  //   var user = Meteor.users.findOne(userId);
  //   return user && user.game && game.position;
  // },
  setPosition: function (position) { 
    Meteor.users.update(Meteor.userId(), { 
      $set: { 'game.position': position }
    });
   },
  enterRoom: function (roomId) { 
    Session.set('currentRoom', roomId);

    var userId = Meteor.userId();
    var defaults = { 
      'position': { 'x': 400, 'y': 400 }, 
      'roomId': roomId, 
      // TODO: equips, buffs, etc.
    };
    Meteor.users.update(userId, {
      $set: { 'game': defaults } 
    });

    Survivor.Rooms.addUser(roomId, userId);
   },
  leaveRoom: function (roomId) { 
    Session.set('currentRoom');

    var userId = Meteor.userId();
    Meteor.users.update(userId, { $set: { 'game.roomId': 0 } });
    Survivor.Rooms.removeUser(roomId, userId);
   }
  //,
  // rotate: function (userId, angle) {  // angle in degrees

  //  }
};