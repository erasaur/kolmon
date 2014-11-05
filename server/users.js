Accounts.onCreateUser(function (options, user) {
  var defaults = {
    position: {
      x: 400, 
      y: 400
    },
    roomId: 0
  };

  user.game = defaults;

  return user;
});