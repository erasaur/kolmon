var Players = KOL.Players;
var Worlds = KOL.Worlds;
var Battles = KOL.Battles;

Meteor.publish('singleWorld', function (worldId) {
  if (!this.userId) return this.ready();

  return [
    Players.find({ 'worldId': worldId }),
    Worlds.find(worldId),
    // Battles.find({ $or: [
    //   { 'sender.id': this.userId },
    //   { 'receiver.id': this.userId }
    // ]})
  ];
});
