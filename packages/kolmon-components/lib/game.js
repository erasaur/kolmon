var constants = KOL.constants;
var Renderer = KOL.Renderer;
var Timer = KOL.Timer;
var Transition = KOL.Transition;
var World = KOL.World;

KOL.Game = (function () {
  function Game (options) {
    if (!this instanceof Game) {
      return new Game(options);
    }

    this._state = new ReactiveVar();
    if (options) this.load(options);
  }

  Game.prototype.load = function loadGame (options) {
    var self = this;

    // init renderers --------------------------------

    self._renderers = {
      bg: new Renderer({
        context: options.bgContext
      }),
      player: new Renderer({
        context: options.playerContext
      }),
      fg: new Renderer({
        context: options.fgContext
      }),
      // ui: new Renderer({
      //   context: options.uiContext
      // })
    };

    // init components -------------------------------

    self._world = new World({
      world: options.world,
      player: options.player,
      renderers: self._renderers
    });

    // config ----------------------------------------

    self._timer = Timer;
    self._lastUpdate;
    self._state.set(constants.STATE_MAP);

    self.start();
  };

  Game.prototype.world = function getWorld () {
    return this._world;
  };

  Game.prototype.state = function getState () {
    return this._state.get();
  };

  Game.prototype.start = function startGame () {
    var self = this;

    // initialize time of last update
    self._lastUpdate = Date.now();

    self._timer.stop('main');
    self._timer.start('main', self.main.bind(self), constants.UPDATE_STEP);

    // handle window events with jQuery since template events
    // don't seem to work well with global events
    $(window).off('keydown.game').on('keydown.game', self.keydown.bind(self));
  };

  Game.prototype.stop = function stopGame (id) {
    $(window).off('keydown.game');
    (this._timer || Timer).stop(id);

    //TODO handle player disconnect, e.g clear out player from the world

    if (!id) {
      this._map = null;
      this._players = null;
    }
  };

  Game.prototype.keydown = function onGameKeydown (event) {
    event.preventDefault();
    var self = this;

    switch (self._state.get()) {
      case constants.STATE_MAP:
        self._world.keydown(event, this._lastUpdate);
        break;
      case constants.STATE_BATTLE:
        //TODO
        break;
    }
  };

  Game.prototype.update = function onGameUpdate (dt, now) {
    var self = this;

    switch (self._state.get()) {
      case constants.STATE_TR_BATTLE:
        //TODO display transition to battle
        self._transition.update();
        break;
      case constants.STATE_MAP:
        self._world.update(dt, now);
        break;
      case constants.STATE_BATTLE:
        //TODO
        break;
    }
  };

  Game.prototype.main = function main () {
    var now = Date.now();
    var dt = now - this._lastUpdate; // time elapsed since last update

    this.update(dt, now);
    this._lastUpdate = now;
  };

  Game.prototype.changeState = function changeState (options) {
    //TODO improve this
    self._state.set(options.state.replace('STATE_', 'STATE_TR_'));

    self._transition.run({
      state: self._state.get(),
      onfinish: function () {
        self._state.set(option.state);
        options.onfinish();
      }
    });
  };

  return Game;
})();
