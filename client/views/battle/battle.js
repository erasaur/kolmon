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


    var radius = 5;
    var backLayerOffset = 0;
    var middleLayerOffset = 3;
    var frontLayerOffset = 8;
    var styleOffset = 10;

    /* === DRAW TEXT BOX === */

    drawTextBox(fgContext, textBoxHeight, radius, "lightskyblue", backLayerOffset, middleLayerOffset, 
      frontLayerOffset, styleOffset, false);

    /* === DRAW OPTIONS POPUP === */

    var width = 170;

    /* Offsets are calculated with respect to the text box */
    drawOptionsPopup(fgContext, width, textBoxHeight, radius, "lightsteelblue", 
      backLayerOffset + middleLayerOffset, frontLayerOffset);

    /* === DRAW HEALTH BARS === */

    /* === DRAW MOVES MENU === */

    /* === DRAW BAG MENU === */

    /* === DRAW PKMN MENU === */

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

/**
 * Draws a styled text box (without text) on a canvas, using the roundRect() method.
 * @param context 2D Canvas context in which the text box should be drawn.
 * @param height Height of the text box, in px.
 * @param radius Border radius of the text box, in px.
 * @param color Color of the middle rectangle. 
 * @param backLayerOffset The back rectangle's offset, in px, based on the edge of the canvas.
 * @param middleLayerOffset The middle rectangle's offset, in px, based on the edge of the canvas.
 * @param frontLayerOffset The front rectangle's offset, in px, based on the edge of the canvas.
 * @param styleOffset The front rectangle's style offset, in px, based on the edge of the canvas.
 * @param transparentBackLayer Set to true to make the back rectangle transparent, or false to keep 
 * it black. Intended for non-battle scenes.
 */
 function drawTextBox(context, height, radius, color, backLayerOffset, middleLayerOffset, frontLayerOffset, 
  styleOffset, transparentBackLayer) {

  /* Back Layer of Text Box */

  if (transparentBackLayer) {
    context.fillStyle = "transparent"; 
    context.fillRect(backLayerOffset, constants.CANVAS_HEIGHT - (height - backLayerOffset), 
      constants.CANVAS_WIDTH - (2 * backLayerOffset) , height - (2 * backLayerOffset));
  }
  else {
    context.fillStyle = "#000"; // black 
    context.fillRect(backLayerOffset, constants.CANVAS_HEIGHT - (height - backLayerOffset), 
      constants.CANVAS_WIDTH - (2 * backLayerOffset) , height - (2 * backLayerOffset));
  }

  /* Middle Layer of Text Box */

  context.fillStyle = color; 
  roundRect(context, middleLayerOffset, constants.CANVAS_HEIGHT - (height - middleLayerOffset), 
    constants.CANVAS_WIDTH - (2 * middleLayerOffset), height - (2 * middleLayerOffset), 
    radius, true, false);

  /* Front Layer of Text Box */

  context.fillStyle = "#FFF"; // white
  roundRect(context, frontLayerOffset + styleOffset, constants.CANVAS_HEIGHT - (height - frontLayerOffset), 
    constants.CANVAS_WIDTH - (2 * frontLayerOffset) - (4 * styleOffset), height - (2 * frontLayerOffset), 
    radius, true, false);
}

/**
 * Draws a styled options popup (without text) on a canvas, using the roundRect() method.
 * Should be used in conjunction with a styled textbox (see drawTextBox()), and the offsets should be
 * given with respect to the styled textbox.
 * @param context 2D Canvas context in which the text box should be drawn.
 * @param width width of the text box, in px.
 * @param height Height of the text box, in px.
 * @param radius Border radius of the text box, in px.
 * @param color Color of the back rectangle. 
 * @param backLayerOffset The back rectangle's offset, in px, based on the edge of the canvas.
 * @param frontLayerOffset The front rectangle's offset, in px, based on the edge of the canvas.
 */
function drawOptionsPopup(context, width, height, radius, color, backLayerOffset, frontLayerOffset) {

  /* Back Layer of Popup */

  context.fillStyle = color; 
  roundRect(context, constants.CANVAS_WIDTH - width, constants.CANVAS_HEIGHT - (height - backLayerOffset), 
    width - backLayerOffset, height - (2 * backLayerOffset), radius, true, false)

  /* Front Layer of Popup */

  context.fillStyle = "#FFF"; 
  roundRect(context, constants.CANVAS_WIDTH - (width - frontLayerOffset), constants.CANVAS_HEIGHT - (height - frontLayerOffset), 
    width - (2 * frontLayerOffset), height - (2 * frontLayerOffset), radius, true, false)

}


function drawHealthBars() {


}

function drawMovesMenu() {

}

function drawBagMenu() {

}

function drawPkmnMenu() {

}