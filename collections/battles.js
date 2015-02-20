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
  challengeSend: function (player) {
    var user = Meteor.user();
    if (!user || !player || user._id === player._id)
      throw new Meteor.Error('invalid-challenge', i18n.t('invalid_challenge'));

    var challenge = Battles.findOne({ $or: [
      { 'senderId': user._id },
      { 'receiverId': user._id }
    ]});

    // XXX limit to one challenge at a time?
    // if (challenge)
    //   throw new Meteor.Error('already-challenged', 'Players can only send one challenge at a time.');

    var challenge = {
      createdAt: new Date(),
      roomId: user.game.roomId,
      status: STATUS_PENDING,
      senderId: user._id,
      receiverId: player._id
    };

    Schemas.Battle.clean(challenge);
    check(challenge, Schemas.Battle);
    Battles.insert(challenge);
  },
  challengeAccept: function (challenge) {
    if (!this.userId)
      throw new Meteor.Error('logged-out', i18n.t('please_login'));

    check(challenge, Match.ObjectIncluding({
      _id: String,
      senderId: String,
      receiverId: String
    }));

    var sender = Meteor.users.findOne(challenge.senderId);
    var receiver = Meteor.users.findOne(challenge.receiverId);

    if (!sender || !receiver)
      throw new Meteor.Error('invalid-user', i18n.t('invalid_user'));

    if (sender.inBattle || receiver.inBattle)
      throw new Meteor.Error('already-battling', i18n.t('already_battling'));

    Battles.update(challenge._id, { $set: { status: STATUS_ACCEPTED } });
    Meteor.users.update({ _id: { $in: [senderId, receiverId] } }, {
      $set: { 'game.inBattle': true }
    }, { multi: true });
  },
  challengeReject: function (challenge) {
    if (!this.userId)
      throw new Meteor.Error('logged-out', i18n.t('please_login'));

    check(challenge, Match.ObjectIncluding({
      _id: String,
      senderId: String,
      receiverId: String
    }));

    Battles.update(challenge._id, {
      $set: { status: STATUS_REJECTED }
    });
  }
});
