var canvas;
var context;
var img;
var speed = 250;
var last; // time of last update
var keysDown = {};

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

  if (!keysDown) return;
  // update position of current player
  var playerId = Meteor.user().profile.playerId;
  var position = Survivor.Players.getPosition(playerId);
  var offset = speed * dt;

  if (38 in keysDown) // moving up
    position.y -= offset;
  else if (40 in keysDown) // moving down
    position.y += offset;
    
  if (39 in keysDown) // moving right  
    position.x += offset;
  else if (37 in keysDown) // moving left
    position.x -= offset;

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

  keysDown[key] = true;
}

function keyUp (event) { 
  event.preventDefault(); 
  var key = event.keyCode || event.which;
  
  delete keysDown[key];
}










