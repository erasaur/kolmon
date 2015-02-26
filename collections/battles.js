Schemas.Battle = new SimpleSchema({
  _id: {
    type: String,
    optional: true
  },
  roomId: {
    type: String
  },
  createdAt: {
    type: String
  },
  senderId: {
    type: String
  },
  receiverId: {
    type: String
  },
  status: {
    type: Number,
    allowedValues: [STATUS_PENDING, STATUS_ACCEPTED, STATUS_REJECTED],
    defaultValue: STATUS_PENDING
  },
  turn: {
    type: Number,
    allowedValues: [TURN_SENDER, TURN_RECEIVER],
    defaultValue: TURN_RECEIVER // defender goes first
  },
  // timeLeft: { // time left for turn
  //   type: Number,
  //   decimal: true
  // }
});

Battles = new Mongo.Collection('battles');
Battles.attachSchema(Schemas.Battle);

Meteor.methods({
  challengeSend: function (opponent) {
    check(opponent, Match.ObjectIncluding({
      _id: String,
      gameId: String
    }));

    var user = Meteor.users.findOne(this.userId);
    if (!user)
      throw new Meteor.Error('no-permission', i18n.t('please_login');

    var opponent = Meteor.users.findOne(opponent._id);
    if (!opponent || user._id === opponent._id)
      throw new Meteor.Error('invalid-user', i18n.t('cannot_challenge_user'));

    var existing = Battles.findOne({ 'senderId': user._id });
    if (existing)
      throw new Meteor.Error('invalid-challenge', i18n.t('one_challenge_limit'));

    var userGame = Games.findOne(user.gameId);
    var opponentGame = Games.findOne(opponent.gameId);
    if (userGame.roomId !== opponentGame.roomId)
      throw new Meteor.Error('invalid-user', i18n.t('user_not_in_room'));

    var challenge = {
      createdAt: new Date(),
      roomId: userGame.roomId,
      senderId: user._id,
      receiverId: opponent._id
    };

    Schemas.Battle.clean(challenge);
    check(challenge, Schemas.Battle);
    return Battles.insert(challenge);
  },
  challengeAccept: function (challenge) {
    check(challenge, Match.ObjectIncluding({
      _id: String,
      senderId: String,
      receiverId: String
    }));

    if (!this.userId)
      throw new Meteor.Error('logged-out', i18n.t('please_login'));

    var sender = Games.findOne({ 'userId': challenge.senderId });
    var receiver = Games.findOne({ 'userId': challenge.receiverId });
    if (!sender || !receiver)
      throw new Meteor.Error('invalid-challenge', i18n.t('invalid_challenge'));

    if (sender.inBattle || receiver.inBattle)
      throw new Meteor.Error('already-battling', i18n.t('already_battling'));

    Battles.update(challenge._id, { $set: { status: STATUS_ACCEPTED } });
    Games.update({ _id: { $in: [sender._id, receiver._id] } }, {
      $set: { 'inBattle': true }
    }, { multi: true });
  },
  challengeReject: function (challenge) {
    check(challenge, Match.ObjectIncluding({
      _id: String,
      senderId: String,
      receiverId: String
    }));

    if (!this.userId)
      throw new Meteor.Error('logged-out', i18n.t('please_login'));

    Battles.update(challenge._id, { $set: { status: STATUS_REJECTED } });
  }
});
