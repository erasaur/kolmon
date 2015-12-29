var Maps = KOL.Maps;

Meteor.publish('mapList', function (worldId) {
  check(worldId, String);

  if (!this.userId) return this.ready();

  return Maps.find({ worldId: worldId });
});
