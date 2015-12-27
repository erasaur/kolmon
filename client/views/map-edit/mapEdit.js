var constants = KOL.constants;
var Maps = KOL.Maps;
var helpers = KOL.helpers;

Template.mapEdit.onCreated(function() {
  this._chosenType = new ReactiveVar();
});


Template.mapEdit.helpers({
  isChosen: function(type) {
    var template = Template.instance();
    if (type === template._chosenType.get()) {
      return "active";
    }
    return "";
  },
  getChosenType: function() {
    var template = Template.instance();
    return template._chosenType.get();
  }
});

Template.mapEdit.events({
  "click #type-list": function(e, template) {
    var element = e.target;
    var type = element.getAttribute('data-type');
    template._chosenType.set(type);
  }
});





Template.mapClickable.onCreated(function () {
  this._dragging = false;
  this._drag_start_X = 0;
  this._drag_start_Y = 0;
});

Template.mapClickable.onRendered(function () {
  var templateInstance = this;
  var Canvas = templateInstance.find('#canvas');
  var CanvasRect = templateInstance.find("#canvasRect");

  templateInstance._context = Canvas.getContext('2d');
  templateInstance._contextRect = CanvasRect.getContext('2d');

  var imageElement = new Image();
  imageElement.onload = function() {
    templateInstance._context.drawImage(imageElement, 0, 0, constants.CANVAS_WIDTH, constants.CANVAS_HEIGHT);
  };

  imageElement.src = '/map0.png'; // change this later to grab the Id in the URL
  if(imageElement.complete ){
    templateInstance._context.drawImage(imageElement, 0, 0, constants.CANVAS_WIDTH, constants.CANVAS_HEIGHT);
  }



  var canvasRectSaved = templateInstance.find('#canvasRectSaved');
  var contextRectSaved = canvasRectSaved.getContext('2d');
  templateInstance._contextRectSaved = contextRectSaved;

  var params = helpers.get.currentParams();

  templateInstance.autorun( function() {
    templateInstance._currentMap = Maps.findOne({ _id: params._id });



    if( templateInstance._currentMap === undefined) {
      return;
    }

    drawSavedRectangles(canvasRectSaved, templateInstance._currentMap);
  });


});


/**
 * rounds number to the nearest multiple of unit.
 * may round up or down if half between multiples of unit.
 *
 * @param number an integer to be rounded
 * @param unit an integer
 * @returns number, rounded to the nearest multiple of unit.
 */
var getNearestMultiple = function(number, unit) {
  var round = (number + ( unit / 2 )) / unit;
  round = round | 0; // truncates the decimal part after round, turns round into an integer
  round = unit * round;
  return round;
}

/**
 * Gets the closest pixel coordinates to the click location
 *    that corresponds to a grid snap point / corner.
 * @param clickX x coordinate of the click location, in pixels from the upper left corner
 * @param clickY y coordinate of the click location, in pixels from the upper left corner
 * @returns point with x,y
 *
 */
var getGridSnapPoint = function(clickX, clickY, pixelsPerCell) {
  return {
    x: getNearestMultiple(clickX, pixelsPerCell),
    y: getNearestMultiple(clickY, pixelsPerCell)
  };
}




/**
 * draw all the saved rectangles in the currentMap
 *
 * @param canvasContext the canvas context to draw to
 * @param currentMap Map object as defined in collections/map.js
 */
var drawSavedRectangles = function(canvas, currentMap) {
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
}


/**
 * Convert the rect = {x, y, w, h} to a valid rectangle with positive width and height
 *
 * @param rect
 * @returns a rectangle with positive width and height
 */
var toValidRectangle = function(rect) {
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


/**
 * Checks whether two rectangles intersect.
 * If only their sides are touching, then they do not intersect.
 *
 * @param rect1 [x,y,w,h]
 * @param rect2 [x,y,w,h]
 * @returns boolean whether the rectangles intersect.
 */
var intersect = function(rect1, rect2) {
  if(  rect1.x + rect1.w - constants.EPSILON < rect2.x
    || rect2.x + rect2.w - constants.EPSILON < rect1.x
    || rect1.y + rect1.h - constants.EPSILON < rect2.y
    || rect2.y + rect2.h - constants.EPSILON < rect1.y) {
    return false;
  }
  return true;
}


Template.mapClickable.helpers({
  canvasWidth: constants.CANVAS_WIDTH,
  canvasHeight: constants.CANVAS_HEIGHT
});

Template.mapClickable.events({
  "click #canvasRect": function(e, template) {
    /*
     Clear the rectangle, because it tends to stick around.
     */
    var canvasRect = template.find('#canvasRect');
    canvasRect.width = canvasRect.width;
  },
  "mouseup #canvasRect": function(e, template) {
    if(this.type !== undefined) {
      var snapPoint = getGridSnapPoint(e.offsetX, e.offsetY, constants.PX_PER_CELL);

      var dX = snapPoint.x - template._drag_start_X;
      var dY = snapPoint.y - template._drag_start_Y;

      var rect = toValidRectangle({
        x: template._drag_start_X,
        y: template._drag_start_Y,
        w: dX,
        h: dY
      });


      if(['walls', 'portals', 'wild'].indexOf(this.type) >= 0) {
        template._currentMap[this.type].push(rect);
      }
      else if(this.type === 'delete') {
        console.log(template._currentMap);

        // delete all rectangles in template._currentMap that intersect this rectangle
        template._currentMap.portals = template._currentMap.portals.filter(function(portal) {
          return ! intersect(portal, rect);
        });
        template._currentMap.wild = template._currentMap.wild.filter(function(wild) {
          return ! intersect(wild, rect);
        });
        template._currentMap.walls = template._currentMap.walls.filter(function(wall) {
          return ! intersect(wall, rect);
        });

        console.log(template._currentMap);
      }
      else if(this.type === undefined) {
        // do nothing
      }


      drawSavedRectangles(template.find('#canvasRectSaved'), template._currentMap);
    }


    template._dragging = false;

  },
  "mousemove #canvasRect": function(e, template) {
    if (template._dragging) {
      var snapPoint = getGridSnapPoint(e.offsetX, e.offsetY, constants.PX_PER_CELL);

      var dX = snapPoint.x - template._drag_start_X;
      var dY = snapPoint.y - template._drag_start_Y;

      /*
       Clear the canvas before drawing the next rectangle.
       */
      var canvasRect = template.find('#canvasRect');
      canvasRect.width = canvasRect.width;
      template._contextRect.rect(template._drag_start_X, template._drag_start_Y, dX, dY);
      template._contextRect.stroke();

    }
  },
  "mousedown #canvasRect": function(e, template) {
    if(this.type !== undefined ) {
      template._dragging = true;

      var snapPoint = getGridSnapPoint(e.offsetX, e.offsetY, constants.PX_PER_CELL);

      template._drag_start_X = snapPoint.x;
      template._drag_start_Y = snapPoint.y;
    }
  }
});

Template.mapClickable.onDestroyed(function () {

});
