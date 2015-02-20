Accounts.onCreateUser(function (options, user) {
  var defaults = {
    position: { x: CENTER_X, y: CENTER_Y },
    roomId: 'rooms',
    direction: 0
  };

  user.game = defaults;

  return user;
});

UserStatus.events.on('connectionIdle', function (fields) {
  var user = Meteor.user();
  Meteor.call('leaveRoom', user._id, user.game.roomId);
});
UserStatus.events.on('connectionLogout', function (fields) {
  cleanupUser(fields.userId);
});

var cleanupUser = function (userId) {
  Meteor.users.update(userId, { $set: {
    'game.roomId': 'rooms',
    'game.inBattle': false
  } });
  Challenges.remove({ $or: [
    { 'sender.id': userId },
    { 'receiver.id': userId }
  ]}, function (error, result) {
    if (error) throw error;
  });
};

Meteor.methods({
  enterRoom: function (roomId) {
    check(roomId, Match.OneOf(String, Number));

    var userId = Meteor.userId();
    if (!userId) return;

    var room = Rooms.findOne(roomId);
    if (!room || !room.slots)
      throw new Meteor.Error('room-error', 'Room does not exist or has no slots.');

    // XXX restore previous position?
    var defaults = {
      'position': { 'x': CENTER_X, 'y': CENTER_Y },
      'roomId': roomId,
      'direction': 0
    };

    Meteor.users.update(userId, { $set: { 'game': defaults } });
    Rooms.update(roomId, { $addToSet: { 'userIds': userId }, $inc: { 'slots': -1 } });
  },
  leaveRoom: function (userId, roomId) {
    check(userId, String);
    check(roomId, Match.OneOf(String, Number));

    var user = Meteor.user();
    if (!user || user._id !== userId && !isAdmin(user)) return;

    Rooms.update(roomId, { $pull: { 'userIds': userId }, $inc: { 'slots': 1 } });
    cleanupUser(userId);
  }
});
