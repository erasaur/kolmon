Accounts.onCreateUser(function (options, user) {
  var player = {
    userId: user._id, 
    position: {
      x: 400, 
      y: 400,
      angle: 0
    },
    roomId: 0
  };

  var playerId = Players.insert(player);

  user.profile = {
    playerId: playerId
  };

  return user;
});