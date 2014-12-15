var Schema = {};

Schema.UserProfile = new SimpleSchema({
  name: {
    type: String,
    optional: true
  },
  avatar: {
    type: String,
    optional: true
  }
});

Schema.UserGame = new SimpleSchema({
  roomId: {
    type: String,
    defaultValue: 0
  },
  position: {
    type: Schema.UserPosition
  },
  direction: { // 0 - static, 1 - up, 2 - right, 3 - down, 4 - left
    type: Number
  }
});

Schema.User = new SimpleSchema({
  _id: {
    type: String,
    optional: true
  },
  createdAt: {
    type: Date,
    optional: true
  },
  username: {
    type: String,
    regEx: /^[a-z0-9A-Z_]{3,15}$/
  },
  emails: {
    type: [Object],
    optional: true
  },
  'emails.$.address': {
    type: String,
    regEx: SimpleSchema.RegEx.Email
  },
  'emails.$.verified': {
    type: Boolean
  },
  profile: { // public and editable
    type: Schema.UserProfile,
    optional: true
  },
  services: {
    type: Object,
    blackbox: true
  },
  game: {
    type: Schema.UserGame
  },
  status: { // for user-status
    type: Object,
    blackbox: true,
    optional: true
  }
});

// Meteor.users.attachSchema(Schema.User);

Meteor.users.allow({
  update: function (userId, user) {
    return true;
    // return userId === user._id;
  },
  remove: function (userId, user) {
    return true;
    // return userId === user._id;
  }
});

// Meteor.users.deny({
//   update: function (userId, user, fields) {
//     // TODO: how to make sure players don't give themselves buffs/teleport?
//     // buffs can practically be put in server, but not changing position
//     var editable = ['profile', 'game'];
//     return _.difference(fields, editable).length > 0;
//   }
// });

Meteor.methods({
  setPosition: function (userId, position) {
    Meteor.users.update(userId, { 
      $set: { 'game.position': position, 'game.direction': 0 }
    });
  },
  setDirection: function (userId, direction) {
    Meteor.users.update(userId, {
      $set: { 'game.direction': direction }
    });
  },
  enterRoom: function (userId, roomId) { 
    if (!userId) return;

    var room = Rooms.findOne(roomId);
    if (!room || !room.slots) 
      throw new Meteor.Error('room-error', 'Room does not exist or has no slots.');

    var defaults = { 
      'position': { 'x': 400, 'y': 400 }, 
      'roomId': roomId,
      'direction': 0
    };

    Meteor.users.update(userId, { $set: { 'game': defaults } });
    Rooms.update(roomId, { $addToSet: { 'userIds': userId }, $inc: { 'slots': -1 } });
  },
  leaveRoom: function (userId, roomId) { 
    Meteor.users.update(userId, { $set: { 'game.roomId': 'rooms' } });
    Rooms.update(roomId, { $pull: { 'userIds': userId }, $inc: { 'slots': 1 } });
  }
});
