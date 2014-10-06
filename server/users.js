Accounts.onCreateUser(function (options, user) {
  var playerId = Players.insert({userId: user._id, position: {x: 400, y: 400}});
  user.profile = {
    playerId: playerId
  };

  return user;
});