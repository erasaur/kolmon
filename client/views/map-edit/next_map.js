var MapEditor = KOL.MapEditor;
var constants = KOL.constants;
var Maps = KOL.Maps;
var helpers = KOL.helpers;


Template.nextMap.onCreated(function() {
  this._direction = constants.DIR_DOWN;
});

Template.nextMap.onRendered(function(){

  var template = this;
  var mapId = template.data.mapId;
  var subscription = this.subscribe('singleMapEdit', mapId);
  template._contextBack = template.find('#next-canvas').getContext('2d');

  var imageElement = new Image();
  imageElement.onload = function() {
    template._contextBack.drawImage(imageElement, 0, 0, constants.CANVAS_WIDTH, constants.CANVAS_HEIGHT);
  };

  imageElement.src = '/map0.png'; // change this later to grab the Id in the URL
  if(imageElement.complete ){
    template._contextBack.drawImage(imageElement, 0, 0, constants.CANVAS_WIDTH, constants.CANVAS_HEIGHT);
  }

  var canvasSaved = template.find('#next-canvas-saved');
  var canvasSavedContext = canvasSaved.getContext('2d');

  template.autorun(function () {
    if (subscription.ready()) {

      template._map = Maps.findOne({_id: mapId});
      template._currentMap = template._map;

      if(template._currentMap)  {
        MapEditor.drawSavedRectangles(canvasSaved, template._currentMap);
      }
    }
  });


  $(window).on('keydown', function(e) {
    if( ! template._lastClick) {
      return;
    }
    switch(e.keyCode) {
      case 37:
        // left
        template._direction = constants.DIR_LEFT;
        break;
      case 38:
        // up
        template._direction = constants.DIR_UP;
        break;
      case 39:
        // right
        template._direction = constants.DIR_RIGHT;
        break;
      case 40:
        // down
        template._direction = constants.DIR_DOWN;
        break;
      default:
        break;
    }
    MapEditor.drawPlayer(template.find('#next-canvas-select'),
      template._lastClick,
      constants.PX_PER_CELL,
      template._direction);
  });

});


Template.nextMap.helpers({
  canvasWidth: constants.CANVAS_WIDTH,
  canvasHeight: constants.CANVAS_HEIGHT
});


Template.nextMap.events({
  'click #next-canvas-select': function(e, template) {
    var snapPoint = MapEditor.getUpperLeftSnapPoint(e.offsetX, e.offsetY, constants.PX_PER_CELL);

    if( ! MapEditor.containedInWallOrPortal(snapPoint,
                                            template._currentMap,
                                            constants.PX_PER_CELL)) {

      MapEditor.drawPlayer(template.find('#next-canvas-select'),
                           snapPoint,
                           constants.PX_PER_CELL,
                           template._direction);

      template._lastClick = snapPoint;

    }
  },
  'click #finish-selecting': function(e, template) {
    // save everything
    // close this template

    if( ! template._lastClick ) {
      alert("Please click on the map to set the new teleport location from the portal you have chosen. "
         + "Note that you may also press your arrow keys to define the new direction you are facing");
    }
    else {
      template.data.enterAt.x = template._lastClick.x;
      template.data.enterAt.y = template._lastClick.y;
      template.data.enterAt.dir = template._direction;
      template.data.selecting.set(false);
    }
  },
  'keydown #next-canvas-select': function(e, template) {

  }
});