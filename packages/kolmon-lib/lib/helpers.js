var Users = KOL.Users;

KOL.helpers = {
  get: (function () {
    var currentController = function getCurrentController () {
      return Router && Router.current();
    };

    var currentRoute = function getCurrentRoute () {
      var controller = currentController();
      return controller && controller.route && controller.route.getName();
    };

    var currentParams = function getCurrentParams () {
      var controller = currentController();
      return controller && controller.params;
    };

    return {
      currentController: currentController,
      currentRoute: currentRoute,
      currentParams: currentParams
    };
  })(),
  can: {
    evictPlayers: function (user) {
      user = _.isString(user) ? Users.findOne(user) : user;
      return _.contains(user.roles, 'admin');
    }
  },
  denyAll: {
    insert: function () { return true; },
    update: function () { return true; },
    remove: function () { return true; },
  }
};
