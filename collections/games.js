// XXX rename Game to Player
Schemas.Game = new SimpleSchema({
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
  roomId: {
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
    min: 0,
    max: CANVAS_WIDTH
  },
  y: {
    type: Number,
    optional: true,
    min: 0,
    max: CANVAS_HEIGHT
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

Games = new Mongo.Collection('games');
Games.attachSchema(Schemas.Game);

Meteor.methods({
  setPosition: function (x, y) {
    check([x, y], [Number]);

    var user = Meteor.user();
    if (!user)
      throw new Meteor.Error('logged-out', i18n.t('please_login'));

    Games.update(user.playerId, { $set: { x: x, y: y } });
  },
  setDirection: function (direction, startTime) {
    check(direction, Number);
    check(startTime, Date);

    var user = Meteor.user();
    if (!user)
      throw new Meteor.Error('logged-out', i18n.t('please_login'));

    Games.update(user.playerId, {
      $set: {
        'direction': direction,
        'startTime': startTime
      }
    });
  }
});
