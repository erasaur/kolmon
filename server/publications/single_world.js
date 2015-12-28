var Worlds = KOL.Worlds;
var Players = KOL.Players;

Meteor.publish('singleWorld', function (worldId) {
  check(worldId, String);

  if (!this.userId) return this.ready();

  var user = Meteor.users.findOne(this.userId);

  return [
    Worlds.find(worldId, { limit: 1 }),
    Players.find(user.playerId, { limit: 1 })
  ];
});
