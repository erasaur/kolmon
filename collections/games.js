Schemas.Game = new SimpleSchema({
  _id: {
    type: String,
    optional: true
  },
  playerId: {
    type: String
  },
  roomId: {
    type: String,
    defaultValue: 0
  },
  x: {
    type: Number
  },
  y: {
    type: Number
  },
  direction: { // 0 - static, 1 - up, 2 - left, 3 - right, 4 - bottom
    type: Number
  },
  inBattle: {
    type: Boolean
  },
  startTime: { // initiation time of last move
    type: Date
  }
});

Games = new Mongo.Collection('games');
Games.attachSchema(Schemas.Game);

Meteor.methods({
  setPosition: function (position) {
    var user = Meteor.user();

    if (!user)
      throw new Meteor.Error('logged-out', i18n.t('please_login'));

    check(position, {
      x: Number,
      y: Number,
    });
    position.direction = 0;

    Games.update(user.game, { $set: position });
  },
  setDirection: function (direction, startTime) {
    var user = Meteor.user();

    if (!user)
      throw new Meteor.Error('logged-out', i18n.t('please_login'));

    check(direction, Number);
    check(startTime, Date);

    Games.update(user.game, {
      $set: {
        'direction': direction,
        'startTime': startTime
      }
    });
  }
});
