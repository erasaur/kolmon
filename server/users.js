Accounts.onCreateUser(function (options, user) {
  var defaults = {
    position: { x: CENTER_X, y: CENTER_Y },
    roomId: 'rooms',
    direction: 0
  };

  user.game = defaults;

  return user;
});
