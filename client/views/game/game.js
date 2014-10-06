var canvas;
var context;
var img;
var speed = 250;

Template.game.rendered = function () {
  canvas = document.getElementById('gameCanvas');
  context = canvas.getContext('2d');
  img = new Image();

  img.onload = function () {
    var player = Players.findOne(Meteor.user().profile.playerId);
    var position = player.position;
    context.drawImage(img, position.x, position.y);
  }
  img.src = 'frank.png';

  // global events currently buggy, have to resort to jQuery for now
  $(window).on("keydown", keyDown);
  $(window).on("keyup", keyUp);
}

var update = function (dt) {
  if (!context) return;
  context.clearRect (0, 0, 800, 800);

  // render each player to canvas
  var players = Players.find().fetch(); // todo: return position only
  players.forEach(function (player) {
    context.drawImage(img, player.position.x, player.position.y);
  });

  if (!moving) return;
  // update position of current player
  var playerId = Meteor.user().profile.playerId;
  var currentPlayer = Players.findOne(playerId);
  var position = currentPlayer.position;
  var offset = speed * dt;

  switch (moving) {
    case 1: // moving up
      position.y -= offset;
      break;
    case 2: // moving right
      position.x += offset;
      break;
    case 3: // moving down
      position.y += offset;
      break;
    case 4: // moving left
      position.x -= offset;
      break;
  }

  Players.update(playerId, {$set: {'position': position}});
}

// main game loop
var main = function () {
  var now = Date.now();
  var dt = now - last; // time since last update

  update(dt/1000); // divide by 1000 ms

  last = now;
  requestAnimationFrame(main);
}

var w = window;
// better than setInterval apparently
requestAnimationFrame = w.requestAnimationFrame || 
                        w.webkitRequestAnimationFrame || 
                        w.msRequestAnimationFrame || 
                        w.mozRequestAnimationFrame;

// initialize time of last update                      
var last = Date.now(); 
var moving;
main();

function keyDown (event) {
  event.preventDefault();
  var key = event.keyCode || event.which;

  if (key === 38 || key === 87) { // up arrow or W
    moving = 1;
  } else if (key === 39 || key === 68) { // right arrow or D
    moving = 2;
  } else if (key === 40 || key === 83) { // down arrow or S
    moving = 3;
  } else if (key === 37 || key === 65) { // left arrow or A
    moving = 4;
  }
}

function keyUp (event) { moving = 0; }










