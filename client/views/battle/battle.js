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
  // background.src = "http://i.imgur.com/53aqSY5.png";
  background.src = "http://orig09.deviantart.net/0c99/f/2012/120/0/5/pokemon_bw_2_background_trainer_rips_by_arshes91-d4y2k47.png"

  background.onload = function(){

    /* === DRAW BACKGROUND === */

    var textBoxHeight = 90;
    var widthScalar = constants.CANVAS_WIDTH / background.width;
    var heightScalar = (constants.CANVAS_HEIGHT) / background.height;

    bgContext.scale(widthScalar, heightScalar);
    bgContext.drawImage(background, 0, 0); 


    var radius = 5;
    var frameWidth = 5;

    /* === DRAW TEXT BOX === */

    drawTextBox(fgContext, textBoxHeight, frameWidth);

    /* === DRAW OPTIONS POPUP === */

    var width = 170;

    /* Offsets are calculated with respect to the text box */
    drawOptionsPopup(fgContext, width, textBoxHeight, frameWidth);

    /* === DRAW HEALTH BARS === */

    drawHealthBar(fgContext, 10, 10, true, "Mewtwo", "male", 100, 
      "poison", 420, 420, 1000, 9001);

    drawHealthBar(fgContext, 220, 170, false, "Mudkip", "female", 5, 
      "", 26, 100, 1000, 9001);


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
 * Draws a text box (without text) on a canvas, using the roundRect() method. 
 * Note that the perceived height of the text box will not be the same as the  
 * given height (the actual height will be smaller).
 * @param context 2D Canvas context in which the text box should be drawn.
 * @param height Height of the text box, in px. Actual height will be smaller.
 * @param frameWidth The text box's frame width, in px, relative the canvas dimensions.
 */
 function drawTextBox(context, height, frameWidth) {

  /* Frame Top */

  context.beginPath();
  context.moveTo(0, constants.CANVAS_HEIGHT - (height - frameWidth));
  context.lineTo(constants.CANVAS_WIDTH, constants.CANVAS_HEIGHT - (height - frameWidth));
  context.lineWidth = frameWidth;
  context.stroke();

  /* Frame Bottom */

  context.beginPath();
  context.moveTo(0, constants.CANVAS_HEIGHT - frameWidth);
  context.lineTo(constants.CANVAS_WIDTH, constants.CANVAS_HEIGHT - frameWidth);
  context.lineWidth = frameWidth;
  context.stroke();

  /* Text Area*/

  context.fillStyle = "rgba(0, 0, 0, 0.5)"; 
  roundRect(context, 0, constants.CANVAS_HEIGHT - (height - frameWidth), 
    constants.CANVAS_WIDTH, height - (2 * frameWidth), 
    0, true, false);

}

/**
 * Draws an options popup (without text) on a canvas, using the roundRect() method.
 * Should be used in conjunction with a styled textbox (see drawTextBox()).
 * @param context 2D Canvas context in which the text box should be drawn.
 * @param width width of the text box, in px.
 * @param height Height of the text box, in px.
 * @param frameWidth The popup's frame width, in px, relative the canvas dimensions.
 */
 function drawOptionsPopup(context, width, height, frameWidth) {

  /* Frame Border */
  
  context.strokeStyle = "#FFF"; 
  context.lineWidth = frameWidth;
  roundRect(context, constants.CANVAS_WIDTH - (width - frameWidth), constants.CANVAS_HEIGHT - (height - frameWidth), 
    width - (2 * frameWidth), height - (2 * frameWidth), 5, false, true);

  /* Text Area */

  context.fillStyle = "rgba(0, 0, 0, 0.5)"; 
  roundRect(context, constants.CANVAS_WIDTH - (width - frameWidth), 
    constants.CANVAS_HEIGHT - (height - frameWidth), width - (2 * frameWidth), 
    height - (2 * frameWidth), 5, true, false)

}


function drawHealthBar(context, pos_x, pos_y, isEnemy, name, gender, level, status, 
  currentHP, maxHP, currentExp, maxExp) {

  var width = 150;
  var height = 50;
  var radius = 5;
  var fontSize = 13;

  /* Back Panel */

  context.fillStyle = "rgba(0, 0, 0, 0.618)";
  roundRect(context, pos_x, pos_y, width, height - 11, radius, true, false);

  /* HP Bar */

  context.fillStyle = "lawngreen";
  roundRect(context, pos_x + 25, pos_y + (height / 2.5), width - (25 + 5), 4, 2, true, false);

  /* Exp Bar */

  if (!isEnemy) {
    context.fillStyle = "deepskyblue";
    roundRect(context, pos_x + 5, pos_y + (height / 6 * 5), width - (2 * 5), 3, 2, true, false);
  }

  /* HP Label */
  
  var statusColor = "transparent";
  var statusTextColor = "greenYellow";
  var statusText = " HP";

  if (status === "burn"){
    statusColor = "#E05848";
    statusTextColor = "#FFF";
    statusText = "BRN";
  }
  else if (status === "faint") {
    statusColor = "#B00000";
    statusTextColor = "#FFF";
    statusText = "FNT";
  }
  else if (status === "freeze") {
    statusColor = "#009898";
    statusTextColor = "#FFF";
    statusText = "FRZ";
  }
  else if (status === "paralyze") {
    statusColor = "#E8A800";
    statusTextColor = "#FFF";
    statusText = "PAR";
  }
  else if (status === "poison") {
    statusColor = "#C040C8";
    statusTextColor = "#FFF";
    statusText = "PSN";
  }
  else if (status === "sleep") {
    statusColor = "#687060";
    statusTextColor = "#FFF";
    statusText = "SLP";
  }

  context.font = fontSize - 5 + "px Verdana";
  context.fillStyle = statusColor;
  roundRect(context, pos_x + 5, pos_y + (height / 2.5) + ((fontSize - 5) / 2) - (fontSize - 5) + 1, 18, 11, 2, true, false);
  context.fillStyle = statusTextColor;
  context.fillText(statusText, pos_x + 5 + 1, pos_y + (height / 2.5) + ((fontSize - 4) / 2));

  /* HP Numbers */

  if (!isEnemy) {
    context.font = fontSize - 2 + "px Verdana";
    context.fillStyle = "#FFF";
    context.fillText(currentHP + " / " + maxHP, pos_x + 25, pos_y + fontSize + 22);
  }

  /* Pokemon's Name */

  context.font = fontSize + "px Verdana";
  context.fillStyle = "#FFF";
  context.fillText(name, pos_x + 5, pos_y + fontSize);

  /* Gender Symbol */

  context.font = fontSize + "px Verdana";

  var g;
  if (gender === "male") {
    g = "♂";
    context.fillStyle = "#B3E5FC";
  }
  else if (gender === "female") {
    g = "♀";
    context.fillStyle = "#FF8A80";
  }
  else {
    g = "";
  }
  
  context.fillText(g, pos_x + 97, pos_y + fontSize);

  /* Level Label */

  context.font = fontSize - 3 + "px Verdana";
  context.fillStyle = "orange";
  context.fillText("Lv", pos_x + 108, pos_y + fontSize); 

  /* Level Number*/

  context.font = fontSize + "px Tahoma";
  context.fillStyle = "#FFF";
  context.fillText(level, pos_x + 121, pos_y + fontSize);
}

function drawMovesMenu() {
  // re-use drawOptionsPopup()
}

function drawBagMenu() {
  // different canvas
}

function drawPkmnMenu() {
  // different canvas
}