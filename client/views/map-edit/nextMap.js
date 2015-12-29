var MapEditor = KOL.MapEditor;
var constants = KOL.constants;
var Maps = KOL.Maps;


Template.nextMap.onCreated(function() {

});
Template.nextMap.onRendered(function(){

  var template = this;
  var mapId = template.data.mapId;
  var subscription = this.subscribe('singleMapEdit', mapId);

  this.autorun(function () {
    if (subscription.ready()) {
      template._map = Maps.findOne({_id: mapId});
      template._currentMap = template._map;
      MapEditor.drawSavedRectangles(template.find('#next-canvas'), template._currentMap);
    }
  });

});


Template.nextMap.helpers({
  canvasWidth: constants.CANVAS_WIDTH,
  canvasHeight: constants.CANVAS_HEIGHT
});

Template.nextMap.events({
  'click #next-canvas-portal': function(e, template) {
    var snapPoint = MapEditor.getUpperLeftSnapPoint(e.offsetX, e.offsetY, constants.PX_PER_CELL);

    template._lastClick = snapPoint;

    MapEditor.drawSavedCell(template.find('#next-canvas-portal'),
                            snapPoint,
                            constants.PX_PER_CELL);

  },
  'click #finish-selecting': function(e, template) {
    // save everything
    // close this template
  }
});