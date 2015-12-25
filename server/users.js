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

// user disconnect -----------------------------------

// Meteor.onConnection(function (connection) {
//   connection.onClose(function () {
//     var userId = Meteor.userId();
//     if (userId) {
//       Meteor.call('leaveWorld');
//     }
//   });
// });

// methods -------------------------------------------

Meteor.methods({
  enterWorld: function (worldId) {
    check(worldId, String);

    if (!this.userId) return;

    var player = Players.findOne({ 'userId': this.userId });
    if (!player)
      throw new Meteor.Error('no-permission', i18n.t('please_login'));

    var world = Worlds.findOne(worldId);
    if (!world || !world.slots)
      throw new Meteor.Error('invalid-world', i18n.t('invalid_world'));

    Worlds.update(worldId, {
      $addToSet: { 'playerIds': player._id },
      $inc: { 'slots': -1 }
    });
  },
  leaveWorld: function () {
    if (!this.userId) return;

    var player = Players.findOne({ 'userId': this.userId });
    var world = player && Worlds.findOne(player.worldId);

    if (world) {
      Worlds.update(world._id, {
        $pull: { 'playerIds': player._id },
        $inc: { 'slots': 1 }
      });
    }

    Players.update(player._id, { $unset: { worldId: '', inBattle: '' } });
    // Battles.remove({ $or: [
    //   { 'senderId': playerId },
    //   { 'receiverId': playerId }
    // ]}, function (error, result) {
    //   if (error) throw error;
    // });
  },
  enterMap: function (mapId) {
    check(mapId, String);

    if (!this.userId) return;

    var map = Maps.findOne(mapId);
    if (!map) {
      throw new Meteor.Error('invalid-map', i18n.t('invalid_map'));
    }

    //TODO disallow changing to non-adjacent maps

    // entering a new map, update player
    if (player.mapId !== mapId) {
      var defaults = {
        'worldId': map.worldId,
        'mapId': mapId,
        'x': map.startingPosition.south.x || constants.CENTER_X,
        'y': map.startingPosition.south.y || constants.CENTER_Y,
        'direction': 0
      };
      Players.update(player._id, { $set: defaults });
    }
  }
});
