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

Meteor.methods({
  setPosition: function (position) {
    Meteor.users.update(Meteor.userId(), { 
      $set: { 'game.position': position }
    });
  },
  enterRoom: function (roomId) { 
    var userId = Meteor.userId();
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
  leaveRoom: function (roomId) { 
    var userId = Meteor.userId();
    Meteor.users.update(userId, { $set: { 'game.roomId': 'rooms' } });

    Meteor.call('removeUser', roomId, userId);
  }
});
