var constants = KOL.constants;


KOL.MapEditor = {
  /**
   * Checks whether two rectangles intersect.
   * If only their sides are touching, then they do not intersect.
   *
   * @param rect1 [x,y,w,h]
   * @param rect2 [x,y,w,h]
   * @returns boolean whether the rectangles intersect.
   */
  intersect: function(rect1, rect2) {
    if(  rect1.x + rect1.w - constants.EPSILON < rect2.x
      || rect2.x + rect2.w - constants.EPSILON < rect1.x
      || rect1.y + rect1.h - constants.EPSILON < rect2.y
      || rect2.y + rect2.h - constants.EPSILON < rect1.y) {
      return false;
    }
    return true;
  },


  /**
   * rounds number to the nearest multiple of unit.
   * may round up or down if half between multiples of unit.
   *
   * @param number an integer to be rounded
   * @param unit an integer
   * @returns number, rounded to the nearest multiple of unit.
   */
  getNearestMultiple: function(number, unit) {
    var round = (number + ( unit / 2 )) / unit;
    round = round | 0; // truncates the decimal part after round, turns round into an integer
    round = unit * round;
    return round;
  },

  /**
   * Gets the closest pixel coordinates to the click location
   *    that corresponds to a grid snap point / corner.
   * @param clickX x coordinate of the click location, in pixels from the upper left corner
   * @param clickY y coordinate of the click location, in pixels from the upper left corner
   * @returns {{x: *, y: *}}
   *
   */
  getGridSnapPoint: function(clickX, clickY, pixelsPerCell) {
    return {
      x: this.getNearestMultiple(clickX, pixelsPerCell),
      y: this.getNearestMultiple(clickY, pixelsPerCell)
    };
  },

  /**
   * floor of number / unit
   * @param number
   * @param unit
   * @returns {number}
   */
  getHighestMultiple: function(number, unit) {
    var round = number / unit;
    round = round | 0;
    round = unit * round;
    return round;
  },

  getUpperLeftSnapPoint: function(clickX, clickY, pixelsPerCell) {
    return {
      x: this.getHighestMultiple(clickX, pixelsPerCell),
      y: this.getHighestMultiple(clickY, pixelsPerCell)
    };
  },




  /**
   * draw all the saved rectangles in the currentMap
   *
   * @param canvasContext the canvas context to draw to
   * @param currentMap Map object as defined in collections/map.js
   */
  drawSavedRectangles: function(canvas, currentMap) {
    canvas.width = canvas.width;

    var canvasContext = canvas.getContext('2d');

    canvasContext.fillStyle = constants.PORTAL_FILL_STYLE;
    currentMap.portals.forEach(function(portal) {
      canvasContext.fillRect(portal.x, portal.y, portal.w, portal.h);
    });

    canvasContext.fillStyle = constants.WALL_FILL_STYLE;
    currentMap.walls.forEach(function(wall) {
      canvasContext.fillRect(wall.x, wall.y, wall.w, wall.h);
    });

    canvasContext.fillStyle = constants.WILD_FILL_STYLE;
    currentMap.wild.forEach(function(wild) {
      canvasContext.fillRect(wild.x, wild.y, wild.w, wild.h);
    });

    canvasContext.stroke();
  },

  /**
   * draws a single cell
   *
   * @param point a coordinate {{x: *, y: *}} in pixels
   *
   */
  drawSavedCell: function(canvas, point, pixelsPerCell) {
    canvas.width = canvas.width;

    var canvasContext = canvas.getContext('2d');

    canvasContext.fillStyle = constants.UNIT_FILL_STYLE;
    canvasContext.fillRect(point.x, point.y, pixelsPerCell, pixelsPerCell);

    canvasContext.stroke();
  },


  /**
   * Convert the rect = {x, y, w, h} to a valid rectangle with positive width and height
   *
   * @param rect
   * @returns {{x: *, y: *, w: *, h: *}} a rectangle with positive width and height
   */
  toValidRectangle: function(rect) {
    var x = rect.x;
    var y = rect.y;
    var w = rect.w;
    var h = rect.h;

    if(w < - constants.EPSILON) {
      x = x + w;
      w = - w;
    }
    if(h < - constants.EPSILON) {
      y = y + h;
      h = - h;
    }

    return {x: x,
      y: y,
      w: w,
      h: h};
  }
};
