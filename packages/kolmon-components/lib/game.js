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

    this._stateDep = new Tracker.Dependency();
    this._fetchMapDep = new Tracker.Dependency();
    if (options) this.load(options);
  }

  Game.prototype.load = function loadGame (options) {
    var self = this;

    // config ----------------------------------------

    self._timer = Timer;
    self._lastUpdate;
    self._fetchMapCb;
    self._state = constants.STATE_MAP;
    self._stateDep.changed();

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
      transition: new Renderer({
        context: options.transitionContext
      }),
      // ui: new Renderer({
      //   context: options.uiContext
      // })
    };

    // init components -------------------------------

    // fetch initial map document
    self.fetchMap(options.player.mapId, function () {
      self._world = new World({
        game: this,
        world: options.world,
        player: options.player,
        renderers: self._renderers
      });
      self._transition = new Transition({
        renderers: self._renderers
      });

      self.start();
    });
  };

  // getters ------------------------------------------

  Game.prototype.world = function getWorld () {
    return this._world;
  };

  Game.prototype.state = function getState () {
    this._stateDep.depend();
    return this._state;
  };

  Game.prototype.fetchMapId = function getFetchMapId () {
    this._fetchMapDep.depend();
    return this._fetchMapId;
  };

  // subscriptions ------------------------------------

  Game.prototype.fetchMap = function gameFetchMap (mapId, cb) {
    this._fetchMapCb = cb;
    this._fetchMapId = mapId;
    this._fetchMapDep.changed();
  };

  Game.prototype.fetchedMap = function gameFetchedMap () {
    if (_.isFunction(this._fetchMapCb)) {
      this._fetchMapCb();
      this._fetchMapCb = null;
    }
  };

  // game loop ----------------------------------------

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
  };

  Game.prototype.keydown = function onGameKeydown (event) {
    event.preventDefault();
    var self = this;

    switch (self._state) {
      case constants.STATE_MAP:
        self._world.keydown(event, this._lastUpdate);
        break;
      case constants.STATE_BATTLE:
        //TODO
        break;
      // case constants.STATE_LOADING: break; // noop
    }
  };

  Game.prototype.update = function onGameUpdate (dt, now) {
    var self = this;

    if (self._transition.running()) {
      self._transition.update();
    }

    switch (self._state) {
      case constants.STATE_LOADING:
        //TODO display nice loading indicator
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

  Game.prototype.transition = function transitionGame (type, cb) {
    this._transition.run({ type: type, onfinish: cb });
  };

  Game.prototype.changeState = function changeState (options) {
    var self = this;

    //TODO improve this
    console.log('about to run transition for: ', options.state);

    self.transition(options.transition, function () {
      console.log('changed state to: ', options.state);
      self._state = options.state;
      self._stateDep.changed();

      if (_.isFunction(options.onfinish)) {
        options.onfinish();
      }
    });
  };

  return Game;
})();
