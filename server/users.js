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

    var player = this.userId && Players.findOne({ 'userId': this.userId });
    if (!player)
      throw new Meteor.Error('no-permission', i18n.t('please_login'));

    var world = Worlds.findOne(worldId);
    if (!world || !world.slots)
      throw new Meteor.Error('invalid-world', i18n.t('invalid_world'));

    // entering a new world, use world defaults
    if (player.worldId !== worldId) {
      var defaults = {
        'worldId': worldId,
        'x': world.defaultX || constants.CENTER_X,
        'y': world.defaultY || constants.CENTER_Y,
        'direction': 0
      };
      Players.update(player._id, { $set: defaults });
    }

    Worlds.update(worldId, {
      $addToSet: { 'playerIds': player._id },
      $inc: { 'slots': -1 }
    });
  },
  leaveWorld: function () {
    if (!this.userId) return;
      // throw new Meteor.Error('no-permission', i18n.t('please_login'));

    var player = Players.findOne({ 'userId': this.userId });
    var world = player && Worlds.findOne(player.worldId);

    if (world) {
      Worlds.update(world._id, { $pull: { 'playerIds': player._id }, $inc: { 'slots': 1 } });
    }

    Players.update(player._id, { $unset: { worldId: '', inBattle: '' } });
    // Battles.remove({ $or: [
    //   { 'senderId': playerId },
    //   { 'receiverId': playerId }
    // ]}, function (error, result) {
    //   if (error) throw error;
    // });
  }
});
