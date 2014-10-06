Rooms = new Mongo.Collection('rooms');

Survivor.Rooms = {
  addPlayer: function (roomId, playerId) {
    Rooms.update(roomId, {$push: {'players': playerId}});
  },
  removePlayer: function (roomId, playerId) {
    Rooms.update(roomId, {$pull: {'players': playerId}});
  }
}