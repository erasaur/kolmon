var constants = KOL.constants;
var Maps = KOL.Maps;
var MapEditor = KOL.MapEditor;
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
  this._selectingNextMap = new ReactiveVar(false);
  this._enterAt = undefined;
});


Template.mapClickable.onRendered(function () {
  var template = this;
  var Canvas = template.find('#canvas');
  var CanvasRect = template.find("#canvasRect");

  template._context = Canvas.getContext('2d');
  template._contextRect = CanvasRect.getContext('2d');

  var imageElement = new Image();
  imageElement.onload = function() {
    template._context.drawImage(imageElement, 0, 0, constants.CANVAS_WIDTH, constants.CANVAS_HEIGHT);
  };

  imageElement.src = '/map0.png'; // change this later to grab the Id in the URL
  if(imageElement.complete ){
    template._context.drawImage(imageElement, 0, 0, constants.CANVAS_WIDTH, constants.CANVAS_HEIGHT);
  }

  var canvasRectSaved = template.find('#canvasRectSaved');
  var contextRectSaved = canvasRectSaved.getContext('2d');
  template._contextRectSaved = contextRectSaved;

  var params = helpers.get.currentParams();

  template.autorun( function() {
    template._currentMap = Maps.findOne({ _id: params._id });

    if( template._currentMap === undefined) {
      return;
    }

    MapEditor.drawSavedRectangles(canvasRectSaved, template._currentMap);
  });


  template.autorun(function() {
    if( ! template._selectingNextMap.get() ) {
      if(template._enterAt && template._portalRect) {
        template._currentMap.portals.push({
          mapId: template._nextMapId,
          x: template._portalRect.x,
          y: template._portalRect.y,
          w: template._portalRect.w,
          h: template._portalRect.h,
          enterAt: template._enterAt
        });

        console.log(template._enterAt);
        console.log(template._currentMap.portals);

        MapEditor.drawSavedRectangles(template.find('#canvasRectSaved'), template._currentMap);
      }
    }
  });

});

Template.mapClickable.helpers({
  canvasWidth: constants.CANVAS_WIDTH,
  canvasHeight: constants.CANVAS_HEIGHT,
  getMapsInWorld: function() {

    var worldId = helpers.get.currentParams().worldId;

    return Maps.find({worldId: worldId});
  },
  selectingNextMapVar: function() {
    return Template.instance()._selectingNextMap;
  },
  selectingNextMap: function() {
    return Template.instance()._selectingNextMap.get();
  },
  nextMapId: function() {
    return Template.instance()._nextMapId;
  },
  hookEnterAt: function() {
    var template = Template.instance();

    template._enterAt = {
      x: 0,
      y: 0,
      dir: constants.DIR_DOWN
    };

    return template._enterAt;
  }
});

Template.mapClickable.events({
  "click #save-map": function(e, template) {
    Meteor.call('updateMapRegions', helpers.get.currentParams()._id,
                                    template._currentMap.walls,
                                    template._currentMap.portals,
                                    template._currentMap.wild, function (error, result) {
        if (!error) alert('Saved successfully');
      });
  },
  "click #canvasRect": function(e, template) {
    /*
     Clear the rectangle, because it tends to stick around.
     */
    var canvasRect = template.find('#canvasRect');
    canvasRect.width = canvasRect.width;
  },
  "mouseup #canvasRect": function(e, template) {
    if(this.type !== undefined) {
      var snapPoint = MapEditor.getGridSnapPoint(e.offsetX, e.offsetY, constants.PX_PER_CELL);

      var dX = snapPoint.x - template._drag_start_X;
      var dY = snapPoint.y - template._drag_start_Y;

      var rect = MapEditor.toValidRectangle({
        x: template._drag_start_X,
        y: template._drag_start_Y,
        w: dX,
        h: dY
      });


      if( this.type === 'portals' ) {
        template._portalRect = rect;
        $('#next-map-select').modal();
      }
      else if(['walls', 'wild'].indexOf(this.type) >= 0) {

        template._currentMap[this.type].push(rect);

      }
      else if(this.type === 'delete') {
        // delete all rectangles in template._currentMap that intersect this rectangle
        template._currentMap.portals = template._currentMap.portals.filter(function(portal) {
          return ! MapEditor.intersect(portal, rect);
        });
        template._currentMap.wild = template._currentMap.wild.filter(function(wild) {
          return ! MapEditor.intersect(wild, rect);
        });
        template._currentMap.walls = template._currentMap.walls.filter(function(wall) {
          return ! MapEditor.intersect(wall, rect);
        });
      }
      else if(this.type === undefined) {
        // do nothing
      }


      MapEditor.drawSavedRectangles(template.find('#canvasRectSaved'), template._currentMap);
    }


    template._dragging = false;

  },
  "mousemove #canvasRect": function(e, template) {
    if (template._dragging) {
      var snapPoint = MapEditor.getGridSnapPoint(e.offsetX, e.offsetY, constants.PX_PER_CELL);

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

      var snapPoint = MapEditor.getGridSnapPoint(e.offsetX, e.offsetY, constants.PX_PER_CELL);

      template._drag_start_X = snapPoint.x;
      template._drag_start_Y = snapPoint.y;
    }
  },
  "click #next-map-list > li": function(e, template) {
    var mapId = e.target.innerText.trim();
    template._selectingNextMap.set(true);
    template._nextMapId = mapId;
    $('#next-map-select').modal('hide');
  }
});

Template.mapClickable.onDestroyed(function () {

});
