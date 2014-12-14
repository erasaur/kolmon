var canvas, context, img;

var last; // time of last update
var requestId; // id returned by setInterval

var direction = 0;
var startedMoving;

// TODO: clear out players that disconnect
var players = {}; // local copy of player positions

var MOVE_TIME = 500; // 500 ms to travel 1 cell
var UPDATE_STEP = 50;

Template.room.rendered = function () {
  var user = Meteor.user();
  if (!user) return;

  Meteor.call('enterRoom', user._id, Session.get('currentRoom'));

  canvas = this.find('#game-canvas');
  context = canvas.getContext('2d');
  img = new Image();

  img.onload = function () {
    var position = user.game.position;
    context.drawImage(img, position.x, position.y);
  };
  img.src = '/frank.png';

  $(window).on('keydown', keyDown);

  start();
};

Template.room.destroyed = function () {
  stop();
};

var start = function () {
  // initialize time of last update                      
  last = Date.now(); 

  stop();
  requestId = Meteor.setInterval(main, UPDATE_STEP);
};

var stop = function () {
  if (requestId) {
    Meteor.clearInterval(requestId);
    requestId = null;
  }
};

// update positions of players
var update = function (dt) {
  if (!context) return;
  context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); // clear the canvas

  var users = Meteor.users.find({ 'game.roomId': Session.get('currentRoom') }, {
    fields: { 'game': 1 }
  });

  // render each player to canvas
  users.forEach(function (user) {
    players[user._id] = players[user._id] || user.game.position;

    if (user.game.direction) {
      var offset = (dt / MOVE_TIME) * PX_PER_CELL; // fraction of time * total dist

      switch (user.game.direction) {
        case 1: 
          players[user._id].y -= offset;
          break;
        case 2:
          players[user._id].x += offset;
          break;
        case 3:
          players[user._id].y += offset;
          break;
        case 4:
          players[user._id].x -= offset;
          break;
      }
    } else {
      players[user._id] = user.game.position;
    }
    context.drawImage(img, players[user._id].x, players[user._id].y, PX_PER_CELL, PX_PER_CELL);
  });
};

// main game loop
function main () {
  var now = Date.now();
  var dt = now - last; // time since last update

  // move should have completed, so update position
  if (startedMoving && now >= startedMoving + MOVE_TIME) {
    var user = Meteor.user();
    var newPos = user.game.position;

    switch (direction) {
      case 1: 
        newPos.y -= PX_PER_CELL;
        break;
      case 2:
        newPos.x += PX_PER_CELL;
        break;
      case 3:
        newPos.y += PX_PER_CELL;
        break;
      case 4:
        newPos.x -= PX_PER_CELL;
        break;
    }

    Meteor.call('setPosition', user._id, newPos);
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
  var move = { 38: 1, 39: 2, 40: 3, 37: 4 }[key];

  // if moving already or invalid key
  if (!user || user.game.direction || !move) return;

  // TODO: only if valid move (e.g no wall), update direction
  direction = move;
  startedMoving = last;
  Meteor.call('setDirection', user._id, direction);
}








