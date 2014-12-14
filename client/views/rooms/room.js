var canvas, context, img;
var speed = 250;
var last; // time of last update
var position; // current player position
var requestId; // id returned by setInterval
var keysDown = {};

Template.room.rendered = function () {
  Meteor.call('enterRoom', Meteor.userId(), Session.get('currentRoom'));

  canvas = document.getElementById('game-canvas');
  context = canvas.getContext('2d');
  img = new Image();

  img.onload = function () {
    var position = Meteor.user() && Meteor.user().game.position;
    context.drawImage(img, position.x, position.y);
  };
  img.src = '/frank.png';

  // global events currently buggy, have to resort to jQuery for now
  $(window).on('keydown', keyDown);
  $(window).on('keyup', keyUp);

  start();
};

var start = function () {
  // initialize time of last update                      
  last = Date.now(); 

  stop();
  requestId = Meteor.setInterval(main, 30);
};

stop = function () {
  if (requestId) {
    Meteor.clearInterval(requestId);
    requestId = null;
  }
};

// update positions of players
var update = function (dt) {
  if (!context) return;
  context.clearRect(0, 0, 800, 800); // clear the canvas

  var users = Meteor.users.find({ 'game.roomId': Session.get('currentRoom') });

  // render each player to canvas
  users.forEach(function (user) {
    context.drawImage(img, user.game.position.x, user.game.position.y, 30, 30);
  });

  if (_.isEmpty(keysDown)) return;

  // update position of current player
  var position = Meteor.user() && Meteor.user().game.position;
  var offset = speed * dt;

  if (keysDown[38]) // moving up
    position.y -= offset;
  else if (keysDown[40]) // moving down
    position.y += offset;
  else if (keysDown[39]) // moving right  
    position.x += offset;
  else if (keysDown[37]) // moving left
    position.x -= offset;

  // Meteor.call('setPosition', Meteor.userId(), position);
  Meteor.users.update(Meteor.userId(), { 
    $set: { 'game.position': position }
  });
};

// main game loop
function main () {
  var now = Date.now();
  var dt = now - last; // time since last update

  update(dt/1000); // divide by 1000 ms

  last = now;
}

function keyDown (event) {
  event.preventDefault();
  var key = event.keyCode || event.which;

  keysDown[key] = true;
}

function keyUp (event) { 
  event.preventDefault(); 
  var key = event.keyCode || event.which;
  
  keysDown[key] = null;
}








