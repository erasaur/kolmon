CANVAS_WIDTH = 1024;
CANVAS_HEIGHT = 800;
PX_PER_CELL = 16;
CENTER_X = Math.floor(CANVAS_WIDTH / (2 * PX_PER_CELL)) * PX_PER_CELL;
CENTER_Y = Math.floor(CANVAS_HEIGHT / (2 * PX_PER_CELL)) * PX_PER_CELL;

isAdmin = function (user) {
  return user && user.isAdmin;
};

getCurrentRoute = function () {
  return Router && Router.current() && Router.current().url;
};

nextPosition = function (current, dir, offset) {
  if (!current || !dir) return;
  var temp = { x: current.x, y: current.y };
  var offset = offset || PX_PER_CELL;

  switch (dir) {
    case 1:
      temp.y -= offset;
      break;
    case 2:
      temp.x -= offset;
      break;
    case 3:
      temp.x += offset;
      break;
    case 4:
      temp.y += offset;
      break;
  }

  return temp;
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
