ChallengeSchema = new SimpleSchema({
  _id: {
    type: String,
    optional: true
  },
  createdAt: {
    type: Date
  },
  roomId: {
    type: String
  },
  status: {
    type: Number,
    allowedValues: [STATUS_PENDING, STATUS_ACCEPTED, STATUS_REJECTED],
    defaultValue: STATUS_PENDING
  },
  sender: {
    type: Object
  },
  receiver: {
    type: Object
  }
});

Challenges = new Mongo.Collection('challenges');
// Challenges.attachSchema(ChallengeSchema);

// XXX move to server-side?
Meteor.methods({
  challengeSend: function (player) {
    var user = Meteor.user();
    if (!user || !player) return;

    var challenge = {
      createdAt: new Date(),
      roomId: user.game.roomId,
      status: STATUS_PENDING,
      sender: {
        id: user._id,
        username: user.username
      },
      receiver: {
        id: player._id,
        username: player.username
      }
    };

    // check(challenge, ChallengeSchema);
    Challenges.insert(challenge);
  },
  challengeAccept: function (challenge) {
    if (!this.userId) return;
    // check(challenge, Match.ObjectIncluding({
    //   sender: Object,
    //   receiver: Object
    // }));

    var sender = Meteor.users.findOne(challenge.sender.id);
    var receiver = Meteor.users.findOne(challenge.receiver.id);

    if (sender.inBattle || receiver.inBattle)
      throw new Meteor.Error('already-battling', 'One of the users on either side of the challenge is already in battle');

    Challenges.update(challenge._id, { $set: { status: STATUS_ACCEPTED } });
    Meteor.users.update({ _id: { $in: [sender,receiver] } }, {
      $set: { 'game.inBattle': true }
    }, { multi: true });
  },
  challengeReject: function (challenge) {
    if (!this.userId) return;
    Challenges.update(challenge._id, {
      $set: { status: STATUS_REJECTED }
    });
  }
});
