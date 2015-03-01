Accounts.onCreateUser(function (options, user) {
  // bag
  var bag = { userId: user._id };
  Schemas.Bag.clean(bag);
  user.bagId = Bags.insert(bag);

  // game
  var game = { userId: user._id };
  Schemas.Game.clean(game);
  user.gameId = Games.insert(game);

  // general
  var defaults = {
    createdAt: new Date()
  };

  _.extend(user, defaults);
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
  Games.update({ 'userId': userId }, {
    $set: {
      roomId: 'rooms',
      inBattle: false
    }
  });
  
  Battles.remove({ $or: [
    { 'senderId': userId },
    { 'receiverId': userId }
  ]}, function (error, result) {
    if (error) throw error;
  });
};

Meteor.methods({
  enterRoom: function (roomId) {
    check(roomId, String);

    var user = Meteor.user();
    if (!user) return;

    var room = Rooms.findOne(roomId);
    if (!room || !room.slots)
      throw new Meteor.Error('room-error', 'Room does not exist or has no slots.');

    // XXX restore position based on map data
    var defaults = {
      'x': CENTER_X, 
      'y': CENTER_Y,
      'roomId': roomId,
      'direction': 0
    };

    Games.update(user.gameId, { $set: defaults });
    Rooms.update(roomId, { 
      $addToSet: { 'userIds': userId }, 
      $inc: { 'slots': -1 } 
    });
  },
  leaveRoom: function (userId) {
    check(userId, String);

    var user = Meteor.user();
    if (!user || user._id !== userId && !isAdmin(user))
      throw new Meteor.Error('no-permission', i18n.t('no_permission'));

    var game = Games.findOne({ 'userId': userId });
    var room = game && Rooms.findOne(game.roomId);
    if (!room)
      throw new Meteor.Error('invalid-user', i18n.t('invalid_user'));

    Rooms.update(room._id, { $pull: { 'userIds': userId }, $inc: { 'slots': 1 } });
    cleanupUser(userId);
  }
});
