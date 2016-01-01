var constants = KOL.constants;

var backgrounds = [
"http://orig12.deviantart.net/bb0c/f/2014/316/e/e/pokemon_x_and_y_indoor_battle_background_1_by_phoenixoflight92-d867blh.png",
"http://orig12.deviantart.net/f0dc/f/2014/314/7/1/aquacorde_town_battle_background__night__by_phoenixoflight92-d85yf5a.png",
"http://orig06.deviantart.net/e19f/f/2014/313/b/a/aquacorde_town_battle_background__evening__by_phoenixoflight92-d85t9gs.png",
"http://orig07.deviantart.net/f22e/f/2014/310/b/1/pokemon_x_and_y_frost_cavern_battle_background_by_phoenixoflight92-d85jk85.png",
"http://orig01.deviantart.net/4233/f/2014/310/7/a/pokemon_x_and_y_battle_maison_background_by_phoenixoflight92-d85jegc.png",
"http://orig12.deviantart.net/b598/f/2014/310/a/6/pokemon_x_and_y_forest_battle_background_by_phoenixoflight92-d85ijvr.png",
"http://orig08.deviantart.net/0296/f/2014/309/e/3/pokemon_x_and_y_vs_viola_battle_background_by_phoenixoflight92-d85cykm.png",
"http://orig11.deviantart.net/63f5/f/2014/309/5/e/pokemon_x_and_y_vs_grant_battle_background_by_phoenixoflight92-d859ys9.png",
"http://orig07.deviantart.net/826b/f/2014/308/6/b/pokemon_x_and_y_battle_background_17_by_phoenixoflight92-d8595uk.jpg",
"http://orig05.deviantart.net/e25b/f/2014/308/3/c/pokemon_x_and_y_battle_background_16_by_phoenixoflight92-d8594wx.png",
"http://orig01.deviantart.net/acfa/f/2014/303/d/d/pokemon_x_and_y_vs_champion_diantha_by_phoenixoflight92-d84q65v.png",
"http://orig04.deviantart.net/f004/f/2014/302/f/2/pokemon_x_and_y_battle_background_15_by_phoenixoflight92-d84ktu5.png",
"http://orig01.deviantart.net/ef73/f/2014/301/c/3/pokemon_x_and_y_vs_az_battle_background_by_phoenixoflight92-d84iqqt.png",
"http://orig08.deviantart.net/1dc8/f/2014/300/9/d/pokemon_x_and_y_battle_city__day__background_by_phoenixoflight92-d84e272.png",
"http://orig05.deviantart.net/c61d/f/2014/300/4/0/pokemon_x_and_y_vs_e4_siebold_battle_background_by_phoenixoflight92-d84cldd.png",
"http://orig14.deviantart.net/afce/f/2014/300/4/2/pokemon_x_and_y_vs_e4_drasna_battle_background_by_phoenixoflight92-d84cezp.png",
"http://orig01.deviantart.net/9046/f/2014/300/7/9/pokemon_x_and_y_cave_battle_background_2_by_phoenixoflight92-d84cayh.png",
"http://orig07.deviantart.net/dd44/f/2014/299/7/8/pokemon_x_and_y_vs_e4_malva_battle_background_by_phoenixoflight92-d84aius.png",
"http://orig04.deviantart.net/1121/f/2014/299/6/6/pokemon_x_and_y_battle_background_14_by_phoenixoflight92-d847oe1.jpg",
"http://orig04.deviantart.net/18b0/f/2014/299/6/9/pokemon_x_and_y_battle_background_13_by_phoenixoflight92-d847n4j.png",
"http://orig06.deviantart.net/8c64/f/2015/261/6/4/pokemon_x_and_y_misty_terrain_battle_background_by_phoenixoflight92-d844s2l.png",
"http://orig10.deviantart.net/5c58/f/2014/298/c/7/pokemon_x_and_y_cave_battle_background_1_by_phoenixoflight92-d844jms.png",
"http://orig15.deviantart.net/514e/f/2014/298/5/1/pokemon_x_and_y_battle_background_11_by_phoenixoflight92-d843okx.png",
"http://orig08.deviantart.net/50bb/f/2014/298/2/1/pokemon_x_and_y_battle_background_10_by_phoenixoflight92-d843fov.png",
"http://orig10.deviantart.net/eed6/f/2014/298/9/2/pokemon_x_and_y_battle_background_9_by_phoenixoflight92-d8438m9.png",
"http://orig15.deviantart.net/a3b3/f/2014/297/a/b/pokemon_x_and_y_battle_background_8_by_phoenixoflight92-d841p5r.png",
"http://orig15.deviantart.net/5c25/f/2014/297/5/0/pokemon_x_and_y_wifi_battle_background_by_phoenixoflight92-d841b5t.jpg",
"http://orig10.deviantart.net/815c/f/2014/313/7/4/pokemon_x_and_y_aquacorde_town_battle_background_by_phoenixoflight92-d83xeg8.png",
"http://orig11.deviantart.net/f238/f/2014/296/d/3/pokemon_x_and_y_battle_background_7_by_phoenixoflight92-d83w4vw.jpg",
"http://orig06.deviantart.net/9fe1/f/2014/296/7/9/pokemon_x_and_y_battle_background_6_by_phoenixoflight92-d83u6dm.jpg",
"http://orig10.deviantart.net/17e9/f/2014/295/1/4/pokemon_x_and_y_battle_city__night__background_by_phoenixoflight92-d83u1bh.png",
"http://orig06.deviantart.net/e268/f/2014/297/9/2/pokemon_x_and_y_battle_vs_lysandre_background_by_phoenixoflight92-d83tk61.png",
"http://orig05.deviantart.net/0043/f/2014/295/e/2/pokemon_x_and_y_battle_background_vs_olympia_by_phoenixoflight92-d83th12.png",
"http://orig01.deviantart.net/3a2b/f/2014/295/a/2/pokemon_x_and_y_team_flare_hq_battle_background_by_phoenixoflight92-d83tglc.png",
"http://orig11.deviantart.net/b2ea/f/2014/310/0/9/pokemon_x_and_y_battle_vs_xerneas_background_by_phoenixoflight92-d83t7tr.png",
"http://orig14.deviantart.net/d4ee/f/2014/294/7/f/pokemon_x_and_y_battle_background_5_by_phoenixoflight92-d83pwna.png",
"http://orig01.deviantart.net/e1f1/f/2014/294/4/1/pokemon_x_and_y_sky_battle_background_1_by_phoenixoflight92-d83pvei.png",
"http://orig15.deviantart.net/9562/f/2014/294/1/a/pokemon_x_and_y_battle_background_4_by_phoenixoflight92-d83ohf3.png",
"http://orig06.deviantart.net/f767/f/2014/294/d/4/pokemon_x_and_y_battle_background_3_by_phoenixoflight92-d83og9h.jpg",
"http://orig10.deviantart.net/5d2f/f/2014/293/4/5/pokemon_x_and_y_battle_background_electric_terrain_by_phoenixoflight92-d83l7ou.png",
"http://orig13.deviantart.net/d39b/f/2014/293/1/4/pokemon_x_and_y_battle_background_vs_wulfric_by_phoenixoflight92-d83kr4q.png",
"http://orig12.deviantart.net/24cd/f/2014/293/4/5/pokemon_x_and_y_battle_background_vs_valerie_by_phoenixoflight92-d83kp0g.png",
"http://orig05.deviantart.net/c3f8/f/2014/310/4/e/pokemon_x_and_y_battle_background_vs_clemont_by_phoenixoflight92-d83kmo1.png",
"http://orig07.deviantart.net/17f6/f/2014/293/0/d/pokemon_x_and_y_battle_background_vs_ramos_by_phoenixoflight92-d83k6hp.png",
"http://orig11.deviantart.net/257d/f/2014/293/5/5/pokemon_x_and_y_battle_background_2_by_phoenixoflight92-d83jrvo.jpg",
"http://orig08.deviantart.net/7ac0/f/2014/293/3/8/pokemon_x_and_y_battle_background_vs_korrina_by_phoenixoflight92-d83jo0l.png",
"http://orig06.deviantart.net/cbce/f/2014/293/3/6/pokemon_x_and_y_battle_background_1_by_phoenixoflight92-d83htw0.png"
];


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
  var textCanvas = document.getElementById("canvas-text");
  var fgCanvas = document.getElementById("canvas-foreground");
  
  var fgContext = fgCanvas.getContext("2d");
  var textContext = textCanvas.getContext("2d");
  var bgContext = bgCanvas.getContext("2d");

  var background = new Image();
  background.src = backgrounds[Math.floor(Math.random() * backgrounds.length)];
  // background.src = "http://orig12.deviantart.net/b598/f/2014/310/a/6/pokemon_x_and_y_forest_battle_background_by_phoenixoflight92-d85ijvr.png";

  background.onload = function(){

    /* === DRAW BACKGROUND === */

    var textBoxHeight = 80;
    var widthScalar = constants.CANVAS_WIDTH / background.width;
    var heightScalar = (constants.CANVAS_HEIGHT) / background.height;

    bgContext.scale(widthScalar, heightScalar);
    bgContext.drawImage(background, 0, 0); 


    var radius = 5;
    var frameWidth = 5;
    var enemyPokeName = "Pikachu";
    var currentPokeName = "Mudkip";

    /* === DRAW TEXT BOX === */

    drawTextBox(fgContext, textBoxHeight, frameWidth);
    // typeWrite(textContext, textCanvas, "A wild " +  enemyPokeName + " appeared!" , frameWidth + 5, 
    //   constants.CANVAS_HEIGHT - textBoxHeight + 30, 28, 10);

    typeWrite(textContext, textCanvas, "What will " +  currentPokeName + " do?" , frameWidth + 5, 
      constants.CANVAS_HEIGHT - textBoxHeight + 30, 28, 10);
    // drawDownArrow(fgContext, constants.CANVAS_WIDTH - 20, constants.CANVAS_HEIGHT - 20 - frameWidth, "#FFF");

    /* === DRAW OPTIONS POPUP === */

    var width = 170;

    drawOptionsPopup(fgContext, width, textBoxHeight, frameWidth);
    drawRightArrow(fgContext, constants.CANVAS_WIDTH - width + (2 * frameWidth) + 10, 
      constants.CANVAS_HEIGHT - textBoxHeight + (2 * frameWidth) + 10 , "#FFF"); // 10 refers to the arrow size width

    /* === DRAW STATUS PANELS === */

    drawStatusPanel(fgContext, 10, 10, true, enemyPokeName, "male", 100, 
      "poison", constants.CANVAS_HEIGHT - textBoxHeight, 420, 1000, 9001);

    drawStatusPanel(fgContext, constants.CANVAS_WIDTH - 150 - 10, constants.CANVAS_HEIGHT - textBoxHeight - 50, false, currentPokeName, "female", 5, 
      "", 15, 100, 1000, 9001);


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

  context.strokeStyle = "transparent"; 
  context.beginPath();
  context.moveTo(0, constants.CANVAS_HEIGHT - (height - frameWidth));
  context.lineTo(constants.CANVAS_WIDTH, constants.CANVAS_HEIGHT - (height - frameWidth));
  context.lineWidth = frameWidth;
  context.stroke();

  /* Frame Bottom */

  context.strokeStyle = "transparent";
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
 * @param context 2D Canvas context in which the popup should be drawn.
 * @param width Width of the popup, in px.
 * @param height Height of the popup, in px.
 * @param frameWidth The popup's frame width, in px, relative the canvas dimensions.
 */
 function drawOptionsPopup(context, width, height, frameWidth) {

  /* Frame Border */
  
  context.strokeStyle = "transparent"; 
  context.lineWidth = frameWidth;
  roundRect(context, constants.CANVAS_WIDTH - (width - frameWidth), 
    constants.CANVAS_HEIGHT - (height - frameWidth), width - (2 * frameWidth), 
    height - (2 * frameWidth), 0, false, true);

  /* Text Area */

  context.fillStyle = "rgba(0, 0, 0, 0.5)"; 
  roundRect(context, constants.CANVAS_WIDTH - (width - 2 * frameWidth), 
    constants.CANVAS_HEIGHT - (height - frameWidth), width - (2 * frameWidth), 
    height - (2 * frameWidth), 0, true, false)

  /* Options */ 

  var fontSize = 14;

  context.font = "14px Verdana"
  context.fillStyle = "#FFF";
  context.fillText("Fight" , constants.CANVAS_WIDTH - (width - frameWidth) + 35, 
    constants.CANVAS_HEIGHT - height + 30);

  context.font = "14px Verdana"
  context.fillStyle = "#FFF";
  context.fillText("Bag" , constants.CANVAS_WIDTH - (width - frameWidth) + 110, 
    constants.CANVAS_HEIGHT - height + 30);

  context.font = "14px Verdana"
  context.fillStyle = "#FFF";
  context.fillText("Team" , constants.CANVAS_WIDTH - (width - frameWidth) + 35, 
    constants.CANVAS_HEIGHT - height + 30 + 2 * fontSize);

  context.font = "14px Verdana"
  context.fillStyle = "#FFF";
  context.fillText("Run" , constants.CANVAS_WIDTH - (width - frameWidth) + 110, 
    constants.CANVAS_HEIGHT - height + 30 + 2 * fontSize);
}

/**
 * Draws a single StatusPanel anywhere on a given convas.
 * @param context 2D Canvas context in which the text box should be drawn.
 * @param pos_x X-coordinate of the StatusPanel, from the left of the canvas, in px.
 * @param pos_y Y-coordinate of the StatusPanel, from the top of the canvas, in px.
 * @param isEnemy Set to true to make this an enemy's StatusPanel, otherwise set to false
 * to make it the player pokemon's StatusPanel. 
 * @param name Name of the pokemon, e.g. "Bob".
 * @param gender Gender of the pokemon, accepts "male", "female", or "" (if
 * the Pokemon has no gender).
 * @param level Level of the pokemon, e.g. 100
 * @param status Status of the pokemon. Possible statuses are "burn", "faint", "freeze",
 * "paralyze", "poison", "sleep", and "" (for no status effect);
 * @param currentHP Current hitpoints of the pokemon, e.g. 26.
 * @param maxHP Maximum hitpoints of the pokemon, e.g. 100.
 * @param currentExp Current exp points of the pokemon, e.g. 1000
 * @param maxExp Maximum exp points of the pokemon, e.g. 9001
 */
 function drawStatusPanel(context, pos_x, pos_y, isEnemy, name, gender, level, status, 
  currentHP, maxHP, currentExp, maxExp) {

  var width = 150;
  var height = 50;
  var radius = 5;
  var fontSize = 13;

  /* Back Panel */

  context.fillStyle = "rgba(0, 0, 0, 0.5)";
  roundRect(context, pos_x, pos_y, width, height - 11, radius, true, false);

  /* HP Bar */

  var percentHP = currentHP / maxHP;
  var percentExp = currentExp / maxExp;
  var healthBarColor;

  if (percentHP <= 0.15) {
    healthBarColor = "red";
  }
  else if (percentHP <= 0.5) {
    healthBarColor = "gold";
  }
  else if (percentHP <= 1) {
    healthBarColor = "lawngreen";
  }

  context.fillStyle = "rgba(0, 0, 0, 0.618)";
  roundRect(context, pos_x + 28, pos_y + (height / 2.5), width - (25 + 8), 4, 2, true, false);

  context.fillStyle = healthBarColor;
  roundRect(context, pos_x + 28, pos_y + (height / 2.5), (width - (25 + 8)) * percentHP, 
    4, 2, true, false);

  /* Exp Bar */

  if (!isEnemy) {
    context.fillStyle = "rgba(0, 0, 0, 0.618)";
    roundRect(context, pos_x + 5, pos_y + (height / 6 * 5), width - (2 * 5), 4, 2, true, false);

    context.fillStyle = "deepskyblue";
    roundRect(context, pos_x + 5, pos_y + (height / 6 * 5), (width - (2 * 5)) * percentExp, 
      4, 2, true, false);
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
  roundRect(context, pos_x + 5, pos_y + (height / 2.5) + ((fontSize - 5) / 2) - (fontSize - 5) + 1, 
    19, 11, 2, true, false);
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
    context.fillStyle = "#FF80AB";
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

function typeWrite(context, canvas, string, startX, startY, lineHeight, padding) {
  context.font = "14px Verdana";
  context.fillStyle = "#FFF";

  "use strict";
  var cursorX = startX || 0;
  var cursorY = startY || 0;
  var lineHeight = lineHeight || 14; // Depends on the font size
  padding = padding || 10;
  var i = 0;
  $_inter = setInterval(function() {
    var rem = string.substr(i);
    var space = rem.indexOf(' ');
    space = (space === -1) ? string.length:space;
    var wordwidth = context.measureText(rem.substr(0, space)).width;
    var w = context.measureText(string.charAt(i)).width;
    if(cursorX + wordwidth >= canvas.width - padding) {
      cursorX = startX;
      cursorY += lineHeight;
    }
    context.fillText(string.charAt(i), cursorX, cursorY);
    i++;
    cursorX += w;
    if(i === string.length) {
      clearInterval($_inter);
    }
  }, 80);
}

function drawDownArrow(context, x, y, color) {
  context.fillStyle = color;
  context.beginPath();
  context.moveTo(x, y);
  context.lineTo(x + 10, y);
  context.lineTo(x + (10 / 2), y + (Math.sqrt(3) * (10 / 2)));
  context.lineTo(x, y);
  context.closePath();
  context.fill();
}

function drawRightArrow(context, x, y, color) {
  context.fillStyle = color;
  context.beginPath();
  context.moveTo(x, y);
  context.lineTo(x + (Math.sqrt(3) * (10 / 2)), y + (10 / 2));
  context.lineTo(x , y + 10);
  context.lineTo(x, y);
  context.closePath();
  context.fill();
}

