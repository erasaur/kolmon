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
  image: {
    type: String,
    optional: true,
    defaultValue: constants.DEFAULT_PLAYER_SRC
  },
  worldId: {
    type: String,
    optional: true
  },
  mapId: { // which map user is currently in
    type: String,
    optional: true
  },
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
    optional: true,
    defaultValue: constants.DIR_STATIC
  },
  moving: {
    type: Boolean,
    defaultValue: false
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
