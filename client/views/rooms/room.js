var canvas;
var context;
var img;
var speed = 250;
var last; // time of last update
var keysDown = {};
var requestId;

Template.room.rendered = function () {
  Meteor.call('enterRoom', Session.get('currentRoom'));

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
}

var start = function () {
  var w = window;
  // better than setInterval apparently
  requestAnimationFrame = w.requestAnimationFrame || 
                          w.webkitRequestAnimationFrame || 
                          w.msRequestAnimationFrame || 
                          w.mozRequestAnimationFrame || 
                          function (callback) {
                            w.setTimeout(callback, 1000 / 60);
                          };

  // initialize time of last update                      
  last = Date.now(); 

  if (!requestId)
    main();
};

stop = function () {
  if (requestId) {
    window.cancelAnimationFrame(requestId);
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
    context.drawImage(img, user.game.position.x, user.game.position.y);
  });

  if (!keysDown) return;

  // update position of current player
  var position = Meteor.user() && Meteor.user().game.position;
  var offset = speed * dt;

  if (38 in keysDown) // moving up
    position.y -= offset;
  else if (40 in keysDown) // moving down
    position.y += offset;
    
  if (39 in keysDown) // moving right  
    position.x += offset;
  else if (37 in keysDown) // moving left
    position.x -= offset;

  Meteor.call('setPosition', position);
};

// main game loop
var main = function () {
  var now = Date.now();
  var dt = now - last; // time since last update

  update(dt/1000); // divide by 1000 ms

  last = now;
  requestId = requestAnimationFrame(main);
};

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










