Players = new Mongo.Collection('players');

Survivor.Players = {
  getPosition: function (playerId) {
    return Players.findOne(playerId).position;
  },
  setPosition: function (playerId, position) {
    Players.update(playerId, {$set: {'position': position}});
  },
  // rotate: function (playerId, angle) { // angle in degrees

  // },
  setInGame: function (playerId, inGame) {

  }
}