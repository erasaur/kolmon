var constants = KOL.constants;

KOL.utils = {
  normalizeSrc: function normalizeSrc (src) {
    // TODO: better checks
    return _.contains(src, '/') ? src : '/' + src + '.png';
  },
  coorToPx: function coorToPx (coor) {
    if (!coor || _.isEmpty(coor)) return;

    return {
      x: constants.PX_PER_CELL * coor.x,
      y: constants.PX_PER_CELL * coor.y
    }
  },
  pxToCoor: function pxToCoor (cpx) {
    if (!cpx || _.isEmpty(cpx)) return;

    return {
      x: coor.x / constants.PX_PER_CELL,
      y: coor.y / constants.PX_PER_CELL
    }
  }
};
