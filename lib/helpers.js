CANVAS_WIDTH = 1000;
CANVAS_HEIGHT = 1000;
PX_PER_CELL = 100;

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