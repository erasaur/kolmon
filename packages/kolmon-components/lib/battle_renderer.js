var constants = KOL.constants;

KOL.BattleRenderer = (function () {
  function BattleRenderer (options) {
    if (!this instanceof BattleRenderer) {
      return new BattleRenderer(options);
    }

    if (options) this.load(options);
  }

  BattleRenderer.prototype.load = function loadBattleRenderer (options) {
    this._renderers = options.renderers;
    this._bgContext = this._renderers.bg.context();
    this._fgContext = this._renderers.fg.context();
    // text context (purely for typeWrite())?
    // this._textContext = this._renderers.text.context();
  };

  // TODO
  BattleRenderer.prototype.renderMain = function renderMain (index) {
    // index is an integer in the range [0,4) indicating which option
    // (fight, team, bag, run, in that order) the cursor is pointing to
  };

  // TODO
  BattleRenderer.prototype.renderBag = function renderBag (tabIndex, index) {
    // tabIndex is the index of the current tab. 0 should be items, 1 should be
    // balls (should use constants.BAG_TAB_ITEMS and BAG_TAB_BALLS respectively) 
    // index is the index of the cursor within the tab (e.g 5th index would mean
    // the cursor is highlighting the 6th item in the list)
  };

  // TODO
  BattleRenderer.prototype.renderTeam = function renderTeam (index) {
    // index is an integer in the range [0,6) indicating which pokemon
    // the cursor is currently pointing to
  };

  // TODO
  BattleRenderer.prototype.renderPokemonInfo = function renderPokemonInfo (pokemon) {
    // pokemon will be an object containing the name, description, etc. of the
    // pokemon (refer to pokemon.json)
  };

  // TODO
  BattleRenderer.prototype.renderItemInfo = function renderItemInfo (item) {
    // item will be an object containing an item field and a count field.
    // the item field will be an object containing the name, description, etc.
    // the count field will be an integer indicating the count of that item.
  };

  // TODO
  BattleRenderer.prototype.renderMove = function renderMove (command, cb) {
    // command will be an object containing information about the move to be
    // rendered, such as the current active pokemon and the move to be used. 
    // after the move is rendered/animated, the method should call cb (callback)
    // for now, this method can just call cb immediately.
  };

  // TODO
  BattleRenderer.prototype.renderItem = function renderItem (command, cb) {
    // command will be an object containing information about the move to be
    // rendered, such as the item to be used.
    // after the move is rendered/animated, the method should call cb (callback)
    // for now, this method can just call cb immediately.
  };

  // TODO
  BattleRenderer.prototype.renderSwitch = function renderSwitch (command, cb) {
    // command will be an object containing information about the move to be
    // rendered, such as the pokemon to be switched in.
    // after the move is rendered/animated, the method should call cb (callback)
    // for now, this method can just call cb immediately.
  };

  // TODO
  BattleRenderer.prototype.renderText = function renderText (message) {
    // this method can just call typeWrite with the provided message.
    // however, we might want to keep a queue of messages that are waiting
    // to be written. for example, if this method is called twice with 2 
    // different messages, we might want to let the first message finish
    // rendering before the second one starts.
  };

  // TODO
  BattleRenderer.prototype.renderPrompt = function renderPrompt (options, index) {
    // options will be an array of strings. each string will be one option
    // (e.g [ 'YES', 'NO' ])
    // index will be the index of the current option the cursor is pointing to
  };

  BattleRenderer.prototype.render = function renderBattleRenderer (options) {
    var ownCurrent = options.ownCurrent;
    var enemyCurrent = options.enemyCurrent;
    var bgImage = new Image();

    bgImage.src = "http://orig10.deviantart.net/5c58/f/2014/298/c/7/pokemon_x_and_y_cave_battle_background_1_by_phoenixoflight92-d844jms.png";

    bgImage.onload = function () {
      var textBoxHeight = 80;
      var widthScalar = constants.CANVAS_WIDTH / bgImage.width;
      var heightScalar = (constants.CANVAS_HEIGHT) / bgImage.height;
      var radius = 5;
      var frameWidth = 5;
      var enemyPokeName = "Pikachu";
      var currentPokeName = "Mudkip";

      this._bgContext.scale(widthScalar, heightScalar);
      this._bgContext.drawImage(bgImage, 0, 0); 

      // draw text box 

      this.drawTextBox(fgContext, textBoxHeight, frameWidth);

      // draw text 

      this.typeWrite(this._textContext, textCanvas, "What will " +  currentPokeName + " do?" , frameWidth + 5, 
        constants.CANVAS_HEIGHT - textBoxHeight + 30, 28, 10);

      // draw down arrow

      // this.drawDownArrow(fgContext, constants.CANVAS_WIDTH - 20, constants.CANVAS_HEIGHT - 20 - frameWidth, "#FFF");

      // draw options popup

      var width = 170;

      this.drawOptionsPopup(fgContext, width, textBoxHeight, frameWidth);
      this.drawRightArrow(fgContext, constants.CANVAS_WIDTH - width + (2 * frameWidth) + 10, 
      constants.CANVAS_HEIGHT - textBoxHeight + (2 * frameWidth) + 10 , "#FFF"); // 10 refers to the arrow size width

      // draw status panels

      this.drawStatusPanel(10, 10, ownCurrent, true);
      this.drawStatusPanel(constants.CANVAS_WIDTH - 150 - 10, constants.CANVAS_HEIGHT - textBoxHeight - 50, ownCurrent, false);
    };
  };

  BattleRenderer.prototype.roundRect = function roundRect (ctx, x, y, width, height, radius, fill, stroke) {
    if (typeof stroke == 'undefined') {
      stroke = true;
    }

    if (typeof radius === 'undefined') {
      radius = 5;
    }

    if (typeof radius === 'number') {
      radius = {tl: radius, tr: radius, br: radius, bl: radius};
    } 
    else {
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
  };

  BattleRenderer.prototype.drawTextBox = function drawTextBox (height, frameWidth) {
    this._fgContext.fillStyle = "rgba(0, 0, 0, 0.5)"; 
    roundRect(this._fgContext, 0, constants.CANVAS_HEIGHT - (height - frameWidth), 
      constants.CANVAS_WIDTH, height - (2 * frameWidth), 
      0, true, false);
  };

  BattleRenderer.prototype.drawOptionsPopup = function drawOptionsPopup(width, height, frameWidth) {
    var fontSize = 14;

    this._fgContext.fillStyle = "rgba(0, 0, 0, 0.5)"; 
    roundRect(this._fgContext, constants.CANVAS_WIDTH - (width - 2 * frameWidth), 
      constants.CANVAS_HEIGHT - (height - frameWidth), width - (2 * frameWidth), 
      height - (2 * frameWidth), 0, true, false)

    // draw options

    this._fgContext.font = "14px Verdana"
    this._fgContext.fillStyle = "#FFF";
    this._fgContext.fillText("Fight" , constants.CANVAS_WIDTH - (width - frameWidth) + 35, 
      constants.CANVAS_HEIGHT - height + 30);

    this._fgContext.font = "14px Verdana"
    this._fgContext.fillStyle = "#FFF";
    this._fgContext.fillText("Bag" , constants.CANVAS_WIDTH - (width - frameWidth) + 110, 
      constants.CANVAS_HEIGHT - height + 30);

    this._fgContext.font = "14px Verdana"
    this._fgContext.fillStyle = "#FFF";
    this._fgContext.fillText("Team" , constants.CANVAS_WIDTH - (width - frameWidth) + 35, 
      constants.CANVAS_HEIGHT - height + 30 + 2 * fontSize);

    this._fgContext.font = "14px Verdana"
    this._fgContext.fillStyle = "#FFF";
    this._fgContext.fillText("Run" , constants.CANVAS_WIDTH - (width - frameWidth) + 110, 
      constants.CANVAS_HEIGHT - height + 30 + 2 * fontSize);
  };

  BattleRenderer.prototype.drawStatusPanel = function drawStatusPanel (x, y, pokemon, isEnemy) {
    var width = 150;
    var height = 50;
    var radius = 5;
    var fontSize = 13;
    var percentHP = pokemon.currentHP / pokemon.maxHP;
    var percentEXP = pokemon.currentEXP / pokemon.maxEXP;
    var healthBarColor;

    // back panel

    this._fgContext.fillStyle = "rgba(0, 0, 0, 0.5)";
    roundRect(this._fgContext, x, y, width, height - 11, radius, true, false);

    // draw HP bar

    if (percentHP <= 0.15) {
      healthBarColor = "red";
    }
    else if (percentHP <= 0.5) {
      healthBarColor = "gold";
    }
    else if (percentHP <= 1) {
      healthBarColor = "lawngreen";
    }

    var gradient = this._fgContext.createLinearGradient( x + 28, y + (height / 2.5), x + 28, y + (height / 2.5) + 3);
    gradient.addColorStop(0, "#FFF");   
    gradient.addColorStop(1, "#000");
    this._fgContext.fillStyle = gradient;
    roundRect(this._fgContext, x + 28, y + (height / 2.5), width - (25 + 8), 4, 2, true, false);

    var gradient = this._fgContext.createLinearGradient( x + 28, y + (height / 2.5), x + 28, y + (height / 2.5) + 3);
    gradient.addColorStop(0, "#FFF");   
    gradient.addColorStop(1, healthBarColor);
    this._fgContext.fillStyle = gradient;
    roundRect(this._fgContext, x + 28, y + (height / 2.5), (width - (25 + 8)) * percentHP, 
      4, 2, true, false);

    // draw EXP bar

    if (!isEnemy) {
      var gradient = this._fgContext.createLinearGradient( x + 5, y + (height / 6 * 5), x + 5, y + (height / 6 * 5) + 3);
      gradient.addColorStop(0, "#FFF");   
      gradient.addColorStop(1, "#000");
      this._fgContext.fillStyle = gradient;
      roundRect(this._fgContext, x + 5, y + (height / 6 * 5), width - (2 * 5), 4, 2, true, false);

      var gradient = this._fgContext.createLinearGradient( x + 5, y + (height / 6 * 5), x + 5, y + (height / 6 * 5) + 3);
      gradient.addColorStop(0, "#FFF");   
      gradient.addColorStop(1, "deepskyblue");
      this._fgContext.fillStyle = gradient;
      roundRect(this._fgContext, x + 5, y + (height / 6 * 5), (width - (2 * 5)) * percentEXP, 
        4, 2, true, false);
    }

    // draw status label

    var statusColor = "transparent";
    var statusTextColor = "greenYellow";
    var statusText = " HP";

    if (pokemon.status === "burn"){
      statusColor = "#E05848";
      statusTextColor = "#FFF";
      statusText = "BRN";
    }
    else if (pokemon.status === "faint") {
      statusColor = "#B00000";
      statusTextColor = "#FFF";
      statusText = "FNT";
    }
    else if (pokemon.status === "freeze") {
      statusColor = "#009898";
      statusTextColor = "#FFF";
      statusText = "FRZ";
    }
    else if (pokemon.status === "paralyze") {
      statusColor = "#E8A800";
      statusTextColor = "#FFF";
      statusText = "PAR";
    }
    else if (pokemon.status === "poison") {
      statusColor = "#C040C8";
      statusTextColor = "#FFF";
      statusText = "PSN";
    }
    else if (status === "sleep") {
      statusColor = "#687060";
      statusTextColor = "#FFF";
      statusText = "SLP";
    }

    this._fgContext.font = fontSize - 5 + "px Verdana";
    this._fgContext.fillStyle = statusColor;
    roundRect(this._fgContext, x + 5, y + (height / 2.5) + ((fontSize - 5) / 2) - (fontSize - 5) + 1, 
      19, 11, 2, true, false);
    this._fgContext.fillStyle = statusTextColor;
    this._fgContext.fillText(statusText, x + 5 + 1, y + (height / 2.5) + ((fontSize - 4) / 2));

    // draw HP numbers 

    if (!isEnemy) {
      this._fgContext.font = fontSize - 2 + "px Verdana";
      this._fgContext.fillStyle = "#FFF";
      this._fgContext.fillText(pokemon.currentHP + " / " + pokemon.maxHP, x + 25, y + fontSize + 22);
    }

    // draw pokemon's name

    this._fgContext.font = fontSize + "px Verdana";
    this._fgContext.fillStyle = "#FFF";
    this._fgContext.fillText(name, x + 5, y + fontSize);

    // draw gender symbol

    var g;

    if (pokemon.gender === "male") {
      g = "♂";
      this._fgContext.fillStyle = "#B3E5FC";
    }
    else if (pokemon.gender === "female") {
      g = "♀";
      this._fgContext.fillStyle = "#FF80AB";
    }
    else {
      g = "";
    }

    this._fgContext.font = fontSize + "px Verdana";
    this._fgContext.fillText(g, x + 97, y + fontSize);

    // draw level lavel 

    this._fgContext.font = fontSize - 3 + "px Verdana";
    this._fgContext.fillStyle = "orange";
    this._fgContext.fillText("Lv", x + 108, y + fontSize); 

    // draw level number

    this._fgContext.font = fontSize + "px Tahoma";
    this._fgContext.fillStyle = "#FFF";
    this._fgContext.fillText(pokemon.level, x + 121, y + fontSize);
  };

  // this method needs the actual canvas to work properly (it uses canvas.width)
  BattleRenderer.prototype.typeWrite = function typeWrite (canvas, string, startX, startY, lineHeight, padding) {
    this._textContext.font = "14px Verdana";
    this._textContext.fillStyle = "#FFF";

    "use strict";
    var cursor_x = x || 0;
    var cursor_y = y || 0;
    var lineHeight = lineHeight || 14; 
    var padding = padding || 10;
    var i = 0;

    $_inter = setInterval(function() {
      var rem = string.substr(i);
      var space = rem.indexOf(' ');
      space = (space === -1) ? string.length:space;
      var wordwidth = this._textContext.measureText(rem.substr(0, space)).width;
      var w = this._textContext.measureText(string.charAt(i)).width;

      if (cursor_x + wordwidth >= canvas.width - padding) {
        cursor_x = x;
        cursor_y += lineHeight;
      }

      this._textContext.fillText(string.charAt(i), cursor_x, cursor_y);

      i++;
      cursor_x += w;

      if (i === string.length) {
        clearInterval($_inter);
      }
    }, 80);
  };

  BattleRenderer.prototype.drawDownArrow = function drawDownArrow (x, y, color) {
    this._fgContext.fillStyle = color;
    this._fgContext.beginPath();
    this._fgContext.moveTo(x, y);
    this._fgContext.lineTo(x + 10, y);
    this._fgContext.lineTo(x + (10 / 2), y + (Math.sqrt(3) * (10 / 2)));
    this._fgContext.lineTo(x, y);
    this._fgContext.closePath();
    this._fgContext.fill();

    // TODO: animate the arrow
  };

  BattleRenderer.prototype.drawRightArrow = function drawRightArrow (x, y, color) {
    this._fgContext.fillStyle = color;
    this._fgContext.beginPath();
    this._fgContext.moveTo(x, y);
    this._fgContext.lineTo(x + (Math.sqrt(3) * (10 / 2)), y + (10 / 2));
    this._fgContext.lineTo(x , y + 10);
    this._fgContext.lineTo(x, y);
    this._fgContext.closePath();
    this._fgContext.fill();

    //TODO: animate the arrow
  };

  return BattleRenderer;
})();
