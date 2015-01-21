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
  direction: { // 0 - static, 1 - up, 2 - left, 3 - right, 4 - bottom
    type: Number
  },
  inBattle: {
    type: Boolean
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

Meteor.methods({
  setPosition: function (position) {
    var userId = Meteor.userId();
    if (!userId) return;

    Meteor.users.update(userId, {
      $set: { 'game.position': position, 'game.direction': 0 }
    });
  },
  setDirection: function (direction, startTime) {
    var userId = Meteor.userId();
    if (!userId) return;

    Meteor.users.update(userId, {
      $set: {
        'game.direction': direction,
        'game.startTime': startTime
      }
    });
  }
});
