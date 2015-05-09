KOL = {};
KOL.schemas = {};

// constants -----------------------------------------

KOL.constants = {
  STATUS_PENDING: 0,
  STATUS_ACCEPTED: 1,
  STATUS_REJECTED: 2,

  TURN_SENDER: 10,
  TURN_RECEIVER: 11,

  CANVAS_WIDTH: 1024,
  CANVAS_HEIGHT: 800,
  PX_PER_CELL: 16,

  get CENTER_X () {
    return Math.floor(this.CANVAS_WIDTH / (2 * this.PX_PER_CELL)) * this.PX_PER_CELL;
  },
  get CENTER_Y () {
    return Math.floor(this.CANVAS_HEIGHT / (2 * this.PX_PER_CELL)) * this.PX_PER_CELL;
  },

  // MOVES: JSON.parse(Assets.getText('moves.json')),
  // POKEMON: JSON.parse(Assets.getText('pokemon.json')),
  // TYPES: JSON.parse(Assets.getText('types.json')),

  DEFAULT_WORLD_ID: 'worlds',

  DIR_UP: 1,
  DIR_LEFT: 2,
  DIR_RIGHT: 3,
  DIR_DOWN: 4,

  MOVE_TIME: 500, // time in ms to travel one cell
  UPDATE_STEP: 50, // ms per update
};

// helpers -------------------------------------------

KOL.helpers = {
  get: (function () {
    var currentController = function getCurrentController () {
      return Router.current();
    };

    var currentRoute = function getCurrentRoute () {
      var controller = currentController();
      return controller && controller.route && controller.route.getName();
    };

    return {
      currentController: currentController,
      currentRoute: currentRoute
    };
  })(),
  can: {
    evictPlayers: function (user) {
      user = _.isString(user) ? KOL.Users.findOne(user) : user;
      return _.contains(user.roles, 'admin');
    }
  },
  denyAll: {
    insert: function () { return true; },
    update: function () { return true; },
    remove: function () { return true; },
  }
};

// utils ---------------------------------------------

KOL.Timer = {
  timers: {},
  start: function (id, fn, delay) {
    if (this.timers[id]) this.stop(id);
    this.timers[id] = Meteor.setInterval(fn, delay);
  },
  stop: function (id) {
    var self = this;
    var stop = function stopTimer (id, timerId) {
      Meteor.clearInterval(timerId);
      delete self.timers[id];
    };
    if (typeof id === 'undefined') {
      _.each(this.timers, function (val, key) { stop(key, val); });
      return;
    }
    stop(id, this.timers[id]);
  }
};

// wrappers ------------------------------------------

i18n = {
  t: function () {
    return TAPi18n.__.apply(this, arguments);
  }
};

// loadImages = function (srcs, callback) {
//   var images = {};
//   var loaded = 0;
//   var total = srcs.length;

//   _.each(srcs, function (src) {
//     if (images[src]) return loaded++;

//     images[src] = new Image();
//     images[src].onload = function () {
//       if (++loaded >= total) {
//         callback(images);
//       }
//     };
//     images[src].src = '/' + src;
//   });
// };

// function coorToPx (coor) {
//   if (!coor || _.isEmpty(coor)) return;

//   return {
//     x: PX_PER_CELL * coor.x,
//     y: PX_PER_CELL * coor.y
//   }
// }

// function pxToCoor (cpx) {
//   if (!cpx || _.isEmpty(cpx)) return;

//   return {
//     x: coor.x / PX_PER_CELL,
//     y: coor.y / PX_PER_CELL
//   }
// }
