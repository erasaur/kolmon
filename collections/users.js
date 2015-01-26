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
  },
  opponent: {
    type: Object
  },
  'opponent.username': {
    type: String
  },
  'opponent.id': {
    type: String
  },
  currentTurn: { // currently executing the turn
    type: Boolean
  },
  // timeLeft: { // time left for turn
  //   type: Number,
  //   decimal: true
  // }
});

Schema.UserBag = new SimpleSchema({
  items: {
    type: [String]
  },
  balls: {
    type: [String]
  },
  keyItems: {
    type: [String]
  },
  machines: { // tm/hm
    type: [String]
  }
});

Schema.Pokemon = new SimpleSchema({
  name: {
    type: String,
    optional: true,
    // regEx: SimpleSchema.RegEx.Name
  },
  type: {
    type: Number,
    // allowedValues: POKEMON_TYPES
  },
  level: {
    type: Number,
    min: 1
  },
  hp: {
    type: Number,
    min: 0
  }
  // XXX nature, gender, item, color, etc.
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
  bag: {
    type: Schema.UserBag
  },
  pokemon: {
    type: [Schema.Pokemon]
  },
  team: {
    type: [Schema.Pokemon],
    max: 4
  },
  game: { // XXX move to separate collection. every move sends entire user doc & invalidates all functions depending on user
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
