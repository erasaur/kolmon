var constants = KOL.constants;


Template.battle.helpers({
  canvasWidth: constants.CANVAS_WIDTH,
  canvasHeight: constants.CANVAS_HEIGHT,
  enemyPokes: function() {
    var i = Math.floor(Math.random() * 1200); 
    return KOL.Pokemon.find({index: i, side: "front"}); 
  },
  myPokes: function() {
    // TODO: change i to index of lead pokemon of currentUser
    var i = Math.floor(Math.random() * 500); 
    return KOL.Pokemon.find({index: i, side: "back"});
  }
});

Template.battle.onRendered(function() {
  var bgCanvas = document.getElementById("canvas-background");
  var fgCanvas = document.getElementById("canvas-foreground");
  fgContext = fgCanvas.getContext("2d");
  bgContext = bgCanvas.getContext("2d");

  var background = new Image();
  background.src = "http://i.imgur.com/53aqSY5.png";

  background.onload = function(){

    /* === DRAW BACKGROUND === */

    var textBoxHeight = 90;
    var widthScalar = constants.CANVAS_WIDTH / background.width;
    var heightScalar = (constants.CANVAS_HEIGHT - textBoxHeight) / background.height;

    bgContext.scale(widthScalar, heightScalar);
    bgContext.drawImage(background, 0, 0);  


    /* === DRAW TEXT BOX === */

    /* For reference */
    /* fillRect(x, y, width, height) */ 
    /* fillText(string text, float x, float y, [optional] float maxWidth) */
    /* strokeText(string text, float x, float y, [optional] float maxWidth) */

    /* Black Layer of Text Panel*/
    fgContext.fillStyle = "#000";
    var offset = 0;
    fgContext.fillRect(offset, constants.CANVAS_HEIGHT - (textBoxHeight - offset), constants.CANVAS_WIDTH - (2 * offset) , textBoxHeight - (2* offset));

    /* Color Layer of Text Panel */
    offset = 3;
    fgContext.fillStyle = "#6070C0";
    // fgContext.fillRect(offset, constants.CANVAS_HEIGHT - (textBoxHeight - offset), constants.CANVAS_WIDTH - (2 * offset) , textBoxHeight - (2* offset));

    roundRect(fgContext, offset, constants.CANVAS_HEIGHT - (textBoxHeight - offset), constants.CANVAS_WIDTH - (2 * offset) , textBoxHeight - (2* offset), 5, true, false)

    /* Front-most Layer of Text Panel */
    offset = 8;
    var secondaryOffset = 10;
    fgContext.fillStyle = "#FFF";
    // fgContext.fillRect(offset + secondaryOffset, constants.CANVAS_HEIGHT - (textBoxHeight - offset), constants.CANVAS_WIDTH - (2 * offset) - (4 * secondaryOffset), textBoxHeight - (2* offset));
    roundRect(fgContext, offset + secondaryOffset, constants.CANVAS_HEIGHT - (textBoxHeight - offset), constants.CANVAS_WIDTH - (2 * offset) - (4 * secondaryOffset), textBoxHeight - (2* offset), 5, true, false)


    /* === DRAW POKEMON HEALTH/STATUS BOXES === */


  };



});

/**
 * Draws a rounded rectangle using the current state of the canvas.
 * If you omit the last three params, it will draw a rectangle
 * outline with a 5 pixel border radius
 * @param {CanvasRenderingContext2D} ctx
 * @param {Number} x The top left x coordinate
 * @param {Number} y The top left y coordinate
 * @param {Number} width The width of the rectangle
 * @param {Number} height The height of the rectangle
 * @param {Number} [radius = 5] The corner radius; It can also be an object 
 *                 to specify different radii for corners
 * @param {Number} [radius.tl = 0] Top left
 * @param {Number} [radius.tr = 0] Top right
 * @param {Number} [radius.br = 0] Bottom right
 * @param {Number} [radius.bl = 0] Bottom left
 * @param {Boolean} [fill = false] Whether to fill the rectangle.
 * @param {Boolean} [stroke = true] Whether to stroke the rectangle.
 */
 function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
  if (typeof stroke == 'undefined') {
    stroke = true;
  }
  if (typeof radius === 'undefined') {
    radius = 5;
  }
  if (typeof radius === 'number') {
    radius = {tl: radius, tr: radius, br: radius, bl: radius};
  } else {
    var defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
    for (var side in defaultRadius) {
      radius[side] = radius[side] || defaultRadius[side];
    }
  }
  ctx.beginPath();
  ctx.moveTo(x + radius.tl, y);
  ctx.lineTo(x + width - radius.tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
  ctx.lineTo(x + width, y + height - radius.br);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
  ctx.lineTo(x + radius.bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
  ctx.lineTo(x, y + radius.tl);
  ctx.quadraticCurveTo(x, y, x + radius.tl, y);
  ctx.closePath();
  if (fill) {
    ctx.fill();
  }
  if (stroke) {
    ctx.stroke();
  }

}