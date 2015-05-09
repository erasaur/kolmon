var Bags = KOL.Bags;
var Worlds = KOL.Worlds;
var Players = KOL.Players;
var constants = KOL.constants;

Accounts.onCreateUser(function (options, user) {
  var bagId = Bags.insert({ userId: user._id });
  var playerId = Players.insert({
    userId: user._id,
    username: user.username
  });

  // general
  var defaults = {
    createdAt: new Date(),
    bagId: bagId,
    playerId: playerId
  };
  _.extend(user, defaults);
  return user;
});

// user status ---------------------------------------

var onPlayerDisconnect = function onPlayerDisconnect (fields) {
  if (fields.userId) {
    Meteor.call('leaveWorld');
  }
};
UserStatus.events.on('connectionIdle', onPlayerDisconnect);
UserStatus.events.on('connectionLogout', onPlayerDisconnect);

// methods -------------------------------------------

Meteor.methods({
  enterWorld: function (worldId) {
    check(worldId, String);

    var user = Meteor.user();
    if (!user)
      throw new Meteor.Error('no-permission', i18n.t('please_login'));

    var world = Worlds.findOne(worldId);
    if (!world || !world.slots)
      throw new Meteor.Error('invalid-world', i18n.t('invalid_world'));

    // XXX restore position based on map data
    var defaults = {
      'x': constants.CENTER_X,
      'y': constants.CENTER_Y,
      'worldId': worldId,
      'direction': 0
    };

    Players.update(user.playerId, { $set: defaults });
    Worlds.update(worldId, {
      $addToSet: { 'playerIds': user.playerId },
      $inc: { 'slots': -1 }
    });
  },
  leaveWorld: function () {
    if (!this.userId) return;
      // throw new Meteor.Error('no-permission', i18n.t('please_login'));

    var user = Meteor.user();
    var player = Players.findOne(user.playerId);
    var world = player && Worlds.findOne(player.worldId);

    if (world) {
      Worlds.update(world._id, { $pull: { 'playerIds': playerId }, $inc: { 'slots': 1 } });
    }

    Players.update(playerId, { $unset: { worldId: '', inBattle: '' } });
    // Battles.remove({ $or: [
    //   { 'senderId': playerId },
    //   { 'receiverId': playerId }
    // ]}, function (error, result) {
    //   if (error) throw error;
    // });
  }
});
