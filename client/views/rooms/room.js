var bgContext, playerContext;
var last; // time of last update
var requestId; // id returned by setInterval

var direction = 0;
var startedMoving;

// TODO: clear out players that disconnect
var players = {}; // local copy of player positions

var MOVE_TIME = 500; // 500 ms to travel 1 cell
var UPDATE_STEP = 50; // ms per update

var options; // default options for creating new player

function Player (options) {
  // TODO: change image based on direction
  var image = new Image();
  image.src = options.image;
  this.image = image;

  this.context = options.context;
  this.width = options.width;
  this.height = options.height;
  this.position = options.position;
  this.direction = options.direction;

  this.frameIndex = 0; // current frame in spritesheet
  this.stepsSinceLast = 0; // steps since last frame change
  this.numFrames = options.numFrames || 1; // how many frames
  this.stepsPerFrame = MOVE_TIME / this.numFrames; // how many steps before frame change
}

Player.prototype.move = function (dir, offset) {
  switch (dir) {
    case 1: 
      this.position.y -= offset;
      break;
    case 2:
      this.position.x += offset;
      break;
    case 3:
      this.position.y += offset;
      break;
    case 4:
      this.position.x -= offset;
      break;
  }
};

Player.prototype.render = function () {
  if (this.direction) {
    this.stepsSinceLast++;

    if (this.stepsSinceLast > this.stepsPerFrame) {
      this.frameIndex = this.frameIndex >= numFrames - 1 ? 0 : this.frameIndex + 1;
      this.stepsSinceLast = 0;
    }  
  } else {
    this.frameIndex = 0;
    this.stepsSinceLast = 0;
  }

  var width = Math.max(1, this.width / this.numFrames);
  var height = Math.max(1, this.height);

  this.context.drawImage(
    this.image, 
    this.frameIndex * width, // source x in spritesheet
    0, // source y in spritesheet
    width, 
    height, 
    this.position.x, 
    this.position.y, 
    width, 
    height 
  );
};

Template.room.rendered = function () {
  var user = Meteor.user();
  if (!user) return;

  Meteor.call('enterRoom', Session.get('currentRoom'));

  var bgCanvas = this.find('#canvas-background');
  var playerCanvas = this.find('#canvas-players');

  bgContext = bgCanvas.getContext('2d');  
  playerContext = playerCanvas.getContext('2d');

  options = {
    context: playerContext,
    image: '/frank.png',
    width: PX_PER_CELL,
    height: PX_PER_CELL,
    position: user.game.position
  };

  players[user._id] = new Player(options);
  players[user._id].render();

  $(window).on('keydown', keyDown);

  start();
};
var count = 0;
Template.room.helpers({
  canvasWidth: CANVAS_WIDTH,
  canvasHeight: CANVAS_HEIGHT,
  nearbyPlayers: function () {
    var user = Meteor.user();
    if (!user) return;

    // retrieve players in vicinity
    return (function (u) {
      var minX = u.position.x - PX_PER_CELL;
      var maxX = u.position.x + PX_PER_CELL;
      var minY = u.position.y - PX_PER_CELL;
      var maxY = u.position.y + PX_PER_CELL;

      var res = Meteor.users.find({ 'game.roomId': u.roomId, $and: [
        { 'game.position.x': { $gte: minX } }, 
        { 'game.position.x': { $lte: maxX } },
        { 'game.position.y': { $gte: minY } },
        { 'game.position.y': { $lte: maxY } }
      ]}, { fields: { '_id': 1, 'username': 1 } }).fetch();
      
      // console.log(++count);
      return res;
    })(user.game);
  }
});
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
  bgContext.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); // clear the canvas
  playerContext.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  var users = Meteor.users.find({ 'game.roomId': Session.get('currentRoom') }, {
    fields: { 'game': 1 }
  });

  // render each player to canvas
  users.forEach(function (user) {
    if (!players[user._id]) {
      options.position = user.game.position;
      players[user._id] = new Player(options);
    }

    (function (player, dir, pos) {
      if (dir) {
        var offset = (dt / MOVE_TIME) * PX_PER_CELL; // fraction of time * total dist

        player.move(dir, offset);
      } else {
        player.position = pos;
      }  
      
      player.render();
    })(players[user._id], user.game.direction, user.game.position);
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
  var move = { 38: 1, 39: 2, 40: 3, 37: 4 }[key];

  // if moving already or invalid key
  if (!user || user.game.direction || !move) return;

  // TODO: only if valid move (e.g no wall), update direction
  direction = move;
  startedMoving = last;
  Meteor.call('setDirection', direction);
}








