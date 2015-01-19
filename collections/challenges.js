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
  sender: {
    type: Object
  },
  receiver: {
    type: Object
  }
});

Challenges = new Mongo.Collection('challenges');
// Challenges.attachSchema(ChallengeSchema);

Meteor.methods({
  challengeSend: function (player) {
    var user = Meteor.user();
    if (!user || !player) return;

    var challenge = {
      createdAt: new Date(),
      roomId: user.game.roomId,
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
  challengeAccept: function (player) {
    // TODO
  }
});
