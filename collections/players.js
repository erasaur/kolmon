Players = new Mongo.Collection('players');

Survivor.Players = {
  getPosition: function (playerId) {
    return Players.findOne(playerId).position;
  },
  setPosition: function (playerId, position) {
    Players.update(playerId, {$set: {'position': position}});
  },
  enterRoom: function (playerId, roomId) {
    Players.update(playerId, {$set: {'roomId': roomId}});
    Players.update(playerId, {$set: {'position': {'x': 400, 'y': 400}}});
    // Survivor.Rooms.addPlayer(roomId, playerId);
  },
  leaveRoom: function (playerId, roomId) {
    Players.update(playerId, {$set: {'roomId': 0}});
    // Survivor.Rooms.removePlayer(roomId, playerId);
  }
  //,
  // rotate: function (playerId, angle) { // angle in degrees

  // }
}