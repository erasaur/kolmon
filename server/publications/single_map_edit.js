var Maps = KOL.Maps;

Meteor.publish('singleMapEdit', function (mapId) {
  check(mapId, String);

  if (!this.userId) return this.ready();

  return Maps.find(mapId, { limit: 1 });
});
