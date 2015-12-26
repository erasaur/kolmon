var Players = KOL.Players;
var Maps = KOL.Maps;
var Worlds = KOL.Worlds;
// var Battles = KOL.Battles;

Meteor.publish('singleWorld', function (worldId) {
  check(worldId, String);

  if (!this.userId) return this.ready();

  var world = Worlds.findOne(worldId);
  var player = Players.findOne({ 'userId': this.userId });
  var mapId = player.mapId || world.defaultMapId;
  var map = Maps.findOne(mapId);

  return [
    Players.find({ 'worldId': worldId, 'mapId': mapId }),
    Worlds.find(worldId, { limit: 1 }),
    Maps.find(mapId, { limit: 1 })
    // Battles.find({ $or: [
    //   { 'sender.id': this.userId },
    //   { 'receiver.id': this.userId }
    // ]})
  ];
});
