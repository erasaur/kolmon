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
  };

  BattleRenderer.prototype.render = function renderBattleRenderer (options) {
    var ownCurrent = options.ownCurrent;
    var enemyCurrent = options.enemyCurrent;

    this.drawStatusBar(ownCurrent, enemyCurrent)

    this.drawStatusPanel(123, 123, ownCurrent, false);
    this.drawStatusPanel(123, 123, enemyCurrent, true);
  };

  BattleRenderer.prototype.roundRect = function roundRect (x, y, width, height, radius, fill, stroke) {

  };

  BattleRenderer.prototype.drawTextBox = function drawTextBox (height, frameWidth) {

  };

  BattleRenderer.prototype.drawOptionsPopup = function drawOptionsPopup(width, height, frameWidth) {

  };

  BattleRenderer.prototype.drawStatusPanel = function drawStatusPanel (pos_x, pos_y, pokemon, isEnemy) {

  };

  BattleRenderer.prototype.typeWrite = function typeWrite (canvas, string, startX, startY, lineHeight, padding) {

  };

  BattleRenderer.prototype.drawDownArrow = function drawDownArrow (x, y, color) {

  };

  BattleRenderer.prototype.drawRightArrow = function drawRightArrow (x, y, color) {

  };

})();