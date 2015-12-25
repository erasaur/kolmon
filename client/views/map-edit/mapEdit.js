var constants = KOL.constants;

Template.mapClickable.onCreated(function () {
  this._dragging = false;
  this._drag_start_X = 0;
  this._drag_start_Y = 0;
});

Template.mapClickable.onRendered(function () {
  var self = this;
  var Canvas = self.find('#canvas');
  var CanvasRect = self.find("#canvasRect");

  var template = Template.instance();
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
});

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
    template._dragging = false;
  },
  "mousemove #canvasRect": function(e, template) {
    if (template._dragging) {
      var newX = e.offsetX;
      var newY = e.offsetY;
      var dX = newX - template._drag_start_X;
      var dY = newY - template._drag_start_Y;

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
    template._dragging = true;
    template._drag_start_X = e.offsetX;
    template._drag_start_Y = e.offsetY;
  }
});

Template.mapClickable.onDestroyed(function () {

});
