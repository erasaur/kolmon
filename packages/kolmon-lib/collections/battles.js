var schemas = KOL.schemas;
var constants = KOL.constants;

schemas.Battle = new SimpleSchema({
  _id: {
    type: String,
    optional: true
  },
  worldId: {
    type: String
  },
  createdAt: {
    type: String
  },
  sender: {
    type: String
  },
  senderId: {
    type: String
  },
  receiver: {
    type: String
  },
  receiverId: {
    type: String
  },
  status: {
    type: Number,
    allowedValues: [constants.STATUS_PENDING, constants.STATUS_ACCEPTED, constants.STATUS_REJECTED],
    defaultValue: constants.STATUS_PENDING
  },
  turn: {
    type: Number,
    allowedValues: [constants.TURN_SENDER, constants.TURN_RECEIVER],
    defaultValue: constants.TURN_RECEIVER // defender goes first
  },
  // timeLeft: { // time left for turn
  //   type: Number,
  //   decimal: true
  // }
});

var Battles = KOL.Battles = new Mongo.Collection('battles');
Battles.attachSchema(schemas.Battle);

// Meteor.methods({
//   challengeSend: function (opponent) {
//     check(opponent, Match.ObjectIncluding({
//       _id: String,
//       playerId: String
//     }));

//     var user = Meteor.user();
//     if (!user)
//       throw new Meteor.Error('no-permission', i18n.t('please_login'));

//     var opponent = Meteor.users.findOne(opponent._id);
//     if (!opponent || user._id === opponent._id)
//       throw new Meteor.Error('invalid-user', i18n.t('cannot_challenge_user'));

//     var existing = Battles.findOne({ 'senderId': user._id });
//     if (existing)
//       throw new Meteor.Error('invalid-challenge', i18n.t('one_challenge_limit'));

//     var userPlayer = Players.findOne(user.playerId);
//     var opponentPlayer = Players.findOne(opponent.playerId);
//     if (userPlayer.roomId !== opponentPlayer.roomId)
//       throw new Meteor.Error('invalid-user', i18n.t('user_not_in_room'));

//     return Battles.insert({
//       createdAt: new Date(),
//       roomId: userPlayer.roomId,
//       senderId: user._id,
//       receiverId: opponent._id
//     });
//   },
//   challengeAccept: function (challenge) {
//     check(challenge, Match.ObjectIncluding({
//       _id: String,
//       senderId: String,
//       receiverId: String
//     }));

//     if (!this.userId)
//       throw new Meteor.Error('logged-out', i18n.t('please_login'));

//     var sender = Players.findOne({ 'userId': challenge.senderId });
//     var receiver = Players.findOne({ 'userId': challenge.receiverId });
//     if (!sender || !receiver)
//       throw new Meteor.Error('invalid-challenge', i18n.t('invalid_challenge'));

//     if (sender.inBattle || receiver.inBattle)
//       throw new Meteor.Error('already-battling', i18n.t('already_battling'));

//     Battles.update(challenge._id, { $set: { status: constants.STATUS_ACCEPTED } });
//     Players.update({ _id: { $in: [sender._id, receiver._id] } }, {
//       $set: { 'inBattle': true }
//     }, { multi: true });
//   },
//   challengeReject: function (challenge) {
//     check(challenge, Match.ObjectIncluding({
//       _id: String,
//       senderId: String,
//       receiverId: String
//     }));

//     if (!this.userId)
//       throw new Meteor.Error('logged-out', i18n.t('please_login'));

//     Battles.update(challenge._id, { $set: { status: constants.STATUS_REJECTED } });
//   }
// });
