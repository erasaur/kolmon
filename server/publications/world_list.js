var Worlds = KOL.Worlds;

Meteor.publish('worldList', function () {
  return Worlds.find();
});
