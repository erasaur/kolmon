var Bags = KOL.Bags;
var Players = KOL.Players;
var constants = KOL.constants;

Accounts.onCreateUser(function (options, user) {
  var bagId = Bags.insert({ userId: user._id });
  var playerId = {
    userId: user._id,
    username: user.username,
    worldId: worldId,
    image: constants.DEFAULT_PLAYER_SRC,
    // mapId: { // which map user is currently in
    //   type: String,
    //   optional: true
    // },
    x: map.startingPosition.default.x,
    y: map.startingPosition.default.y
  };

  // general
  var defaults = {
    createdAt: new Date(),
    bagId: bagId,
    playerId: playerId
  };
  _.extend(user, defaults);
  return user;
});
