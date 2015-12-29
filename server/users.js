var Bags = KOL.Bags;
var Players = KOL.Players;
var constants = KOL.constants;

Accounts.onCreateUser(function (options, user) {
  var bagId = Bags.insert({ userId: user._id });
  var playerId = Players.insert({
    userId: user._id,
    username: user.username,
    image: constants.DEFAULT_PLAYER_SRC
  });

  // general
  var defaults = {
    createdAt: new Date(),
    bagId: bagId,
    playerId: playerId
  };
  _.extend(user, defaults);
  return user;
});
