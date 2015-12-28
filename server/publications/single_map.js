var Maps = KOL.Maps;
var Players = KOL.Players;

Meteor.publish('singleMap', function (mapId) {
  check(mapId, String);

  if (!this.userId) return this.ready();

  var map = Maps.findOne(mapId);

  return [
    Players.find({ 'worldId': map.worldId, 'mapId': mapId }),
    Maps.find(map._id, { limit: 1 })
  ];
});
