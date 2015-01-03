CANVAS_WIDTH = 1024;
CANVAS_HEIGHT = 800;
PX_PER_CELL = 16;
CENTER_X = Math.floor(CANVAS_WIDTH / (2 * PX_PER_CELL)) * PX_PER_CELL;
CENTER_Y = Math.floor(CANVAS_HEIGHT / (2 * PX_PER_CELL)) * PX_PER_CELL;

isAdmin = function (user) {
  return user && user.isAdmin;
};
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
