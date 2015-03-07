var playerContext;
var last; // time of last update

var direction = 0;
var startedMoving;

// TODO: clear out players that disconnect
var players = {}; // local copy of player positions
var map;

var MOVE_TIME = 500; // 500 ms to travel 1 cell
var UPDATE_STEP = 50; // ms per update

var playerDefaults = {};

var kolTimer = {
  timers: {},
  set: function (id, fn, delay) {
    if (this.timers[id]) this.stop(id);
    this.timers[id] = Meteor.setInterval(fn, delay);
  },
  stop: function (id) {
    var self = this;
    var stop = function (id, timerId) {
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

function Player (options) {
  var self = this;
  var image = new Image();
  image.onload = function () {
    self.image = this;
  };
  image.src = options.image;

  _.extend(self, _.pick(options, [
    'context', 'width', 'height', 'position', 'direction'
  ]));

  this.frameIndex = 0; // current frame in spritesheet
  this.stepsSinceLast = 0; // steps since last frame change
  this.numFrames = options.numFrames || 1; // how many frames
  this.stepsPerFrame = 2; // how many steps before frame change
}

Player.prototype.move = function (dir, offset) {
  this.direction = dir;
  this.moving = true;
  this.position = nextPosition(this.position, dir, offset);
};

Player.prototype.render = function () {
  if (!this.image) return;

  if (this.moving) {
    this.stepsSinceLast++;

    if (this.stepsSinceLast > this.stepsPerFrame) {
      this.frameIndex = this.frameIndex >= this.numFrames - 1 ? 0 : this.frameIndex + 1;
      this.stepsSinceLast = 0;
    }
  } else {
    this.frameIndex = 0;
    this.stepsSinceLast = 0;
  }

  var width = Math.max(1, this.width);
  var height = Math.max(1, this.height / this.numFrames);

  this.context.drawImage(
    this.image,
    (this.direction % 4) * width, // source x in spritesheet
    this.frameIndex * height + 1, // source y in spritesheet
    width,
    height,
    this.position.x,
    this.position.y,
    width,
    height
  );
};

function Map (options, callback) {
  var self = this;
  self.background = {
    data: options.background,
    images: _.keys(options.background)
  };
  self.foreground = {
    data: options.foreground,
    images: _.keys(options.foreground)
  };
  self.images = {};
  self.bgContext = options.bgContext;
  self.fgContext = options.fgContext;

  var bgSrcs = self.background.images;
  var fgSrcs = self.foreground.images;
  var imageSrcs = _.union(bgSrcs, fgSrcs);
  var loaded = 0;

  // preload all bg/fg images
  _.each(imageSrcs, function (src) {
    self.images[src] = new Image();
    self.images[src].onload = function () {
      if (++loaded >= imageSrcs.length) {
        callback.call(self);
      }
    };
    self.images[src].src = '/' + src + '.png';
  });
}

Map.prototype.render = function (context, options) {
  var self = this;
  var srcs = options.images;
  _.each(srcs, function (src) {
    var image = self.images[src];
    var origin = options.data[src];
    context.drawImage(image, origin.x, origin.y);
  });

  return self;
};
Map.prototype.renderBg = function () {
  return this.render(this.bgContext, this.background);
};
Map.prototype.renderFg = function () {
  return this.render(this.fgContext, this.foreground);
};

Template.room.rendered = function () {
  var user = Meteor.user();
  if (!user) return;

  Meteor.call('enterRoom', Session.get('currentRoom'));
};

Template.map.rendered = function () {
  var self = this;
  var user = Meteor.user();
  if (!user) return;

  var fgCanvas = this.find('#canvas-foreground');
  var bgCanvas = this.find('#canvas-background');
  var playerCanvas = this.find('#canvas-players');

  var fgContext = fgCanvas.getContext('2d');
  var bgContext = bgCanvas.getContext('2d');
  playerContext = playerCanvas.getContext('2d');

  var options = {
    bgContext: bgContext,
    fgContext: fgContext,
    background: this.data.background,
    foreground: this.data.foreground
  };
  map = new Map(options, function () {
    this.renderBg().renderFg();
  });

  // init player
  playerDefaults = {
    context: playerContext,
    image: '/player.png',
    width: PX_PER_CELL,
    height: 66,
    position: user.game.position,
    numFrames: 3,
    direction: 0
  };

  players[user._id] = new Player(playerDefaults);
  players[user._id].render();

  var boundKeyDown = keyDown.bind(this.data);
  $(window).on('keydown', boundKeyDown);

  start();

  // as soon as new challenge is accepted, show countdown
  Tracker.autorun(function () {
    // XXX separate package and class
    var selector = { $or: [
      { 'senderId': user._id },
      { 'receiverId': user._id }
    ], status: STATUS_ACCEPTED };
    var challenge = Battles.findOne(selector, { fields: { 'status': 1 } });
    var $message = $('#modal-challenge');
    if (challenge && (!$message || !$message.length)) {
      (function (s, r) {
        var opponentId = s === user._id ? r : s;
        var opponent = Meteor.users.findOne(opponentId, { fields: {
          'username': 1
        }});

        var modal = Blaze.renderWithData(Template.modalChallenge, {
          username: opponent.username
        }, document.body);

        $('#modal-challenge').modal('show').on('hidden.bs.modal', function () {
          Blaze.remove(modal);
        });
      })(challenge.senderId, challenge.receiverId);
    }
  });
};

Template.modalChallenge.created = function () {
  this._countdown = new ReactiveVar(3);
};
Template.modalChallenge.rendered = function () {
  var self = this;
  kolTimer.set('countdown', function () {
    var curr = self._countdown.get();
    if (--curr <= 0) {
      kolTimer.stop('countdown');
      $('#modal-challenge').modal('hide');
      return;
    }
    self._countdown.set(curr);
  }, 1000);
};

Template.modalChallenge.helpers({
  countdown: function () {
    var template = Template.instance();
    return template && template._countdown && template._countdown.get();
  }
});

Template.room.helpers({
  opponent: function () {
    var selector = { $or: [
      { 'sender.id': user._id },
      { 'receiver.id': user._id }
    ], status: STATUS_ACCEPTED };
    var options = { fields: { 'status': 1 } };
    var challenge = Battles.findOne(selector, options);

    if (challenge) {
      var isSender = challenge.senderId === user._id;
      var userId = isSender ? receiverId : senderId;
      return Meteor.users.findOne(userId);
    }
  }
});

Template.map.helpers({
  canvasWidth: CANVAS_WIDTH,
  canvasHeight: CANVAS_HEIGHT,
  challengesSent: function () {
    return Battles.find({
      'roomId': this.player.roomId,
      'senderId': this.player.userId
    });
  },
  challengesReceived: function () {
    return Battles.find({
      'roomId': this.player.roomId,
      'receiverId': this.player.userId
    });
  },
  nearbyPlayers: function () {
    // retrieve players in vicinity
    return (function (p) {
      var minX = p.x - PX_PER_CELL;
      var maxX = p.x + PX_PER_CELL;
      var minY = p.y - PX_PER_CELL;
      var maxY = p.y + PX_PER_CELL;

      var res = Games.find({ 'roomId': p.roomId, $and: [
        { 'x': { $gte: minX } },
        { 'x': { $lte: maxX } },
        { 'y': { $gte: minY } },
        { 'y': { $lte: maxY } }
      ]}, { fields: { 'userId': 1, 'username': 1 } });

      return res;
    })(this.player);
  }
});

Template.map.events({
  'click .js-challenge-send': function (event, template) {
    if (this._id === Meteor.userId()) return;
    if (confirm('challenge ' + this.username + '?')) {
      Meteor.call('challengeSend', this);
    }
  },
  'click .js-challenge-accept': function (event, template) {
    if (this.sender._id === Meteor.userId()) return;
    if (confirm('accept ' + this.sender.username + '\'s challenge?')) {
      Meteor.call('challengeAccept', this);
    }
  }
});

Template.room.destroyed = function () {
  kolTimer.stop(); // stop all timers
  Meteor.call('leaveRoom', Meteor.userId(), Session.get('currentRoom'));
};

Template.map.destroyed = function () {
  kolTimer.stop('main');
};

var start = function () {
  // initialize time of last update
  last = Date.now();

  kolTimer.stop('main');
  kolTimer.set('main', main, UPDATE_STEP);
};

// update positions of players
var update = function (dt) {
  playerContext.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  var users = Meteor.users.find({ 'game.roomId': Session.get('currentRoom') }, {
    fields: { 'game': 1 }, sort: { 'game.position.y': 1 }
  });

  // render each player to canvas
  users.forEach(function (user) {
    if (!players[user._id]) {
      playerDefaults.position = user.game.position;
      players[user._id] = new Player(playerDefaults);
    }

    (function (player, dir, start, pos) {
      var now = Date.now();
      var moveDone = now > start + MOVE_TIME;

      if (dir && !moveDone) {
        var offset = (dt / MOVE_TIME) * PX_PER_CELL; // fraction of time * total dist
        player.move(dir, offset);
      } else if (!dir) {
        player.moving = false;
        player.position = pos;
      }

      // TODO if in battle, render indicator above player
      player.render();
    })(players[user._id], user.game.direction, user.game.startTime, user.game.position);
  });
};

// main game loop
function main () {
  var now = Date.now();
  var dt = now - last; // time since last update

  // make sure previous move completed before updating position
  var moveDone = now >= startedMoving + MOVE_TIME;
  if (startedMoving && moveDone) {
    var user = Meteor.user();
    var newPos = nextPosition(user.game.position, direction);

    Meteor.call('setPosition', newPos);
    startedMoving = null;
    direction = 0;
  }

  update(dt);
  last = now;
}

function keyDown (event) {
  event.preventDefault();

  var user = Meteor.user();
  var key = event.keyCode || event.which;
  var move = { 38: 1, 39: 3, 40: 4, 37: 2 }[key];

  // if moving already or invalid key
  if (!user || user.game.direction || !move) return;

  var newPos = nextPosition(user.game.position, move);
  if (_.some(this.walls, function (wall) {
    return (
      newPos.x < wall.x + wall.w &&
      newPos.x >= wall.x &&
      newPos.y < wall.y + wall.h - PX_PER_CELL &&
      newPos.y >= wall.y - PX_PER_CELL
    );
  })) return;

  direction = move;
  startedMoving = last;
  Meteor.call('setDirection', direction, startedMoving);
}








