var Worlds = KOL.Worlds;
var Maps = KOL.Maps;
var Players = KOL.Players;
var constants = KOL.constants;

Meteor.methods({
  enterWorld: function (worldId) {
    check(worldId, String);

    if (!this.userId) return;

    console.log('entering world');

    var player = Players.findOne({ 'userId': this.userId });
    if (!player)
      throw new Meteor.Error('no-permission', i18n.t('please_login'));

    var world = Worlds.findOne(worldId);
    if (!world || !world.slots)
      throw new Meteor.Error('invalid-world', i18n.t('invalid_world'));

    var mapsInWorld = _.pluck(world.maps, 'id');
    if (!_.contains(mapsInWorld, player.mapId)) {
      Meteor.call('enterMap', world.defaultMapId);
    }
    else if (!player.worldId) {
      Players.update(player._id, { $set: { 'worldId': world._id } });
    }

    Worlds.update(world._id, {
      $addToSet: { 'playerIds': player._id },
      $inc: { 'slots': -1 }
    });
  },
  leaveWorld: function () {
    if (!this.userId) return;

    console.log('leaving world');

    var user = Meteor.users.findOne(this.userId);
    var player = Players.findOne(user.playerId);
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

    // entering a new map, update player
    var user = Meteor.users.findOne(this.userId);
    var player = Players.findOne(user.playerId);

    if (player.mapId !== mapId) {
      var defaults = {
        'worldId': map.worldId,
        'mapId': mapId,
        'x': map.startingPosition.default.x,
        'y': map.startingPosition.default.y,
        'direction': 0
      };
      Players.update(player._id, { $set: defaults });
    }
  },
  setPosition: function (x, y) {
    check([x, y], [Number]);

    // manually validate x and y, so we don't have to validate entire doc with ss
    if ((x < 0 || x > constants.CANVAS_WIDTH) ||
        (y < 0 || y > constants.CANVAS_HEIGHT)) {
      return;
    }

    var user = Meteor.users.findOne(this.userId);
    Players.update(user.playerId, {
      $set: {
        'moving': false,
        'startTime': null,
        'x': x,
        'y': y,
      }
    }, { validate: false });
  },
  setDirection: function (direction) {
    check(direction, Number);

    //TODO: validation

    var user = Meteor.users.findOne(this.userId);
    Players.update(user.playerId, {
      $set: {
        'direction': direction,
        'startTime': Date.now(),
        'moving': true
      }
    }, { validate: false });
  }
});
