Accounts.onCreateUser(function (options, user) {
  var defaults = {
    position: {
      x: 400, 
      y: 400
    },
    roomId: 'rooms'
  };

  user.game = defaults;

  return user;
});