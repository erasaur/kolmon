var canvas;
var context;
var img;
var speed = 250;
var last; // time of last update
var moving;

Template.game.rendered = function () {
  var playerId = Meteor.user().profile.playerId;
  Survivor.Players.enterRoom(playerId, Session.get('currentRoom'));

  canvas = document.getElementById('gameCanvas');
  context = canvas.getContext('2d');
  img = new Image();

  img.onload = function () {
    var position = Survivor.Players.getPosition(playerId);
    context.drawImage(img, position.x, position.y);
  }
  img.src = '/frank.png';

  // global events currently buggy, have to resort to jQuery for now
  $(window).on('keydown', keyDown);
  $(window).on('keyup', keyUp);

  start();
}

var start = function () {
  var w = window;
  // better than setInterval apparently
  requestAnimationFrame = w.requestAnimationFrame || 
                          w.webkitRequestAnimationFrame || 
                          w.msRequestAnimationFrame || 
                          w.mozRequestAnimationFrame;

  // initialize time of last update                      
  last = Date.now(); 
  main();
}

var update = function (dt) {
  if (!context) return;
  context.clearRect (0, 0, 800, 800);

  // render each player to canvas
  Players.find({roomId: Session.get('currentRoom')}).forEach(function (player) {
    context.drawImage(img, player.position.x, player.position.y);
  });

  if (!moving) return;
  // update position of current player
  var playerId = Meteor.user().profile.playerId;
  var position = Survivor.Players.getPosition(playerId);
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

  Survivor.Players.setPosition(playerId, position);
}

// main game loop
var main = function () {
  var now = Date.now();
  var dt = now - last; // time since last update

  update(dt/1000); // divide by 1000 ms

  last = now;
  requestAnimationFrame(main);
}

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

function keyUp (event) { 
  event.preventDefault(); 
  moving = 0; 
}










