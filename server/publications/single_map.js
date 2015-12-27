var Maps = KOL.Maps;

Meteor.publish('singleMap', function (mapId) {
  check(mapId, String);

  if (!this.userId) return this.ready();

  return Maps.find(mapId, { limit: 1 });
});
