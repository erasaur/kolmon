Template.main.rendered = function () {
  var canvas = document.getElementById('mainCanvas');
  var context = canvas.getContext('2d');
  var img = new Image();

  img.onload = function () {
    context.drawImage(img, 400, 400);
  }
  img.src = 'frank.png';

  // global events currently buggy, have to resort to jQuery for now
  $(window).on("keydown", keyDown);
}

// UI.body.events({ 
//   "keydown": function (event, template) {
//     console.log(event.keyCode);
//   }
// });

function keyDown (event) {
  event.preventDefault();
  var key = event.keyCode || event.which;

  if (key === 38 || key === 87) { // up arrow or W
    console.log("movin up");
  } else if (key === 39 || key === 68) { // right arrow or D
    console.log("movin right");
  } else if (key === 40 || key === 83) { // down arrow or S
    console.log("movin down");
  } else if (key === 37 || key === 65) { // left arrow or A
    console.log("movin left");
  }
}