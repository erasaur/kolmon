var helpers = KOL.helpers;
var constants = KOL.constants;
var schemas = KOL.schemas;

// player document contains information particular to
// in-game events, which are mostly temporary, as
// opposed to user document, which contains more long-term
// info that should be persisted even when not in-game

schemas.Player = new SimpleSchema({
  _id: {
    type: String,
    optional: true
  },
  userId: {
    type: String
  },
  username: {
    type: String
  },
  worldId: {
    type: String,
    optional: true
  },
  // mapId: { // which map user is currently in
  //   type: String,
  //   optional: true
  // },
  x: {
    type: Number,
    optional: true,
    // min: 0,
    // max: constants.CANVAS_WIDTH
  },
  y: {
    type: Number,
    optional: true,
    // min: 0,
    // max: constants.CANVAS_HEIGHT
  },
  direction: { // 0 - static, 1 - up, 2 - left, 3 - right, 4 - bottom
    type: Number,
    optional: true
  },
  inBattle: {
    type: Boolean,
    defaultValue: false
  },
  startTime: { // initiation time of last move
    type: Date,
    optional: true
  }
});

var Players = KOL.Players = new Mongo.Collection('players');
// Players.attachSchema(Schemas.Player);
Players.deny(helpers.denyAll);

Meteor.methods({
  setPosition: function (x, y) {
    check([x, y], [Number]);

    var user = Meteor.user();
    if (!user)
      throw new Meteor.Error('logged-out', i18n.t('please_login'));

    // manually validate x and y, so we don't have to validate entire doc with ss
    if (x < 0 || x > constants.CANVAS_WIDTH || y < 0 || y > constants.CANVAS_HEIGHT) {
      return;
    }

    Players.update(user.playerId, { $set: { x: x, y: y } }, { validate: false });
  },
  setDirection: function (direction, startTime) {
    check([direction, startTime], [Number]);

    var user = Meteor.user();
    if (!user)
      throw new Meteor.Error('logged-out', i18n.t('please_login'));

    // manually validate direction, so we don't have to validate entire doc with ss
    if (direction < 0 || direction > 4) {
      return;
    }

    Players.update(user.playerId, {
      $set: {
        'direction': direction,
        'startTime': startTime
      }
    }, { validate: false });
  }
});
