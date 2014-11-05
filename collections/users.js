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

Schema.UserStats = new SimpleSchema({
  killCount: {
    type: Number,
    min: 0,
    defaultValue: 0
  },
  deathCount: {
    type: Number,
    min: 0,
    defaultValue: 0
  },
  isAdmin: {
    type: Boolean,
    defaultValue: false
  },
  isPremium: {
    type: Boolean,
    defaultValue: false
  }
});

Schema.UserPosition = new SimpleSchema({
  x: {
    type: Number,
    decimal: true
  },
  y: {
    type: Number,
    decimal: true
  }
})

Schema.UserGame = new SimpleSchema({
  roomId: {
    type: String,
    defaultValue: 0
  },
  position: {
    type: Schema.UserPosition
  },
  // TODO: equips, buffs, etc.
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
  stats: { // public but uneditable
    type: Schema.UserStats
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

Meteor.users.attachSchema(Schema.User);

Meteor.users.allow({
  update: function (userId, user) {
    return userId === user._id;
  },
  remove: function (userId, user) {
    return userId === user._id;
  }
});

Meteor.users.deny({
  update: function (userId, user, fields) {
    // TODO: how to make sure players don't give themselves buffs/teleport?
    // buffs can practically be put in server, but not changing position
    var editable = ['profile', 'game'];
    return _.difference(fields, editable).length > 0;
  }
});

setPosition = function (userId, position) {
  Meteor.users.update(userId, { 
    $set: { 'game.position': position }
  });
};

Meteor.methods({
  setPosition: function (userId, position) {
    Meteor.users.update(userId, { 
      $set: { 'game.position': position }
    });
  },
  enterRoom: function (userId, roomId) { 
    console.log('enterroom');
    var defaults = { 
      'position': { 'x': 400, 'y': 400 }, 
      'roomId': roomId, 
      // TODO: equips, buffs, etc.
    };
    Meteor.users.update(userId, {
      $set: { 'game': defaults } 
    });

    Meteor.call('addUser', roomId, userId);
  },
  leaveRoom: function (userId, roomId) { 
    Meteor.users.update(userId, { $set: { 'game.roomId': 'rooms' } });

    Meteor.call('removeUser', roomId, userId);
  }
});
