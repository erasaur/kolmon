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

    drawBlankTextBox(fgContext, textBoxHeight, 5, 0, 3, 8, 10);

    /* === DRAW OPTIONS POPUP === */

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
 * Draws a blank text box on a canvas, using the roundRect() method.
 * @param {CanvasRenderingContext2D} context
 * @param {Number} height of text box, in px
 * @param {Number} border radius of text box, in px
 * @param {Number} the back rectangle's offset based on the edge of canvas, in px
 * @param {Number} the middle rectangle's offset based on the edge of canvas, in px
 * @param {Number} the front rectangle's offset based on the edge of canvas, in px
 * @param {Number} the front rectangle's style offset based on the edge of the canvas, in px
 */

function drawTextBox(context, height, radius, backOffset, middleOffset, frontOffset, styleOffset) {
  var fgContext = context;

  /* Back Layer of Text Box */

  fgContext.fillStyle = "#000";
  fgContext.fillRect(backOffset, constants.CANVAS_HEIGHT - (height - backOffset), 
    constants.CANVAS_WIDTH - (2 * backOffset) , height - (2 * backOffset));

  /* Middle Layer of Text Box */

  fgContext.fillStyle = "#6070C0";
  roundRect(fgContext, middleOffset, constants.CANVAS_HEIGHT - (height - middleOffset), 
    constants.CANVAS_WIDTH - (2 * middleOffset) , height - (2 * middleOffset), radius, true, false)

  /* Front Layer of Text Box */

  fgContext.fillStyle = "#FFF";
  roundRect(fgContext, frontOffset + styleOffset, constants.CANVAS_HEIGHT - (height - frontOffset), 
    constants.CANVAS_WIDTH - (2 * frontOffset) - (4 * styleOffset), height - (2 * frontOffset), radius, true, false);
}

function drawOptionsPopup() {

  offset = 3; // offset from edge of the canvas
  fgContext.fillStyle = "#6070C0";
  var popupWidth = 170; // width of the popup
  roundRect(fgContext, constants.CANVAS_WIDTH - popupWidth, constants.CANVAS_HEIGHT - textBoxHeight, 
    popupWidth, textBoxHeight, radius, true, false)

  offset = 5; // offset from edge of the popup
  fgContext.fillStyle = "#FFF";
  roundRect(fgContext, constants.CANVAS_WIDTH - (popupWidth - offset) , 
    constants.CANVAS_HEIGHT - (textBoxHeight - offset), popupWidth - (2 * offset), textBoxHeight - (2 * offset), radius, true, false)
}


function drawHealthBars() {

}

function drawMovesMenu() {

}

function drawBagMenu() {

}

function drawPkmnMenu() {

}