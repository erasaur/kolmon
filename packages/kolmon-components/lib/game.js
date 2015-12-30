var constants = KOL.constants;
var Renderer = KOL.Renderer;
var Timer = KOL.Timer;
var Transition = KOL.Transition;
var World = KOL.World;
var Battle = KOL.Battle;

KOL.Game = (function () {
  function Game (options) {
    if (!this instanceof Game) {
      return new Game(options);
    }

    this._stateDep = new Tracker.Dependency();
    this._fetchDocs = new ReactiveVar();
    if (options) this.load(options);
  }

  Game.prototype.load = function loadGame (options) {
    var self = this;

    // config ----------------------------------------

    self._timer = Timer;
    self._lastUpdate;
    self._fetchCb;
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

    self._transition = new Transition({
      renderers: self._renderers
    });
    self._battle = new Battle({
      renderers: self._renderers
    });

    // fetch initial map document
    self.fetchMap(options.player.mapId, function () {
      self._world = new World({
        game: this,
        world: options.world,
        player: options.player,
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

  Game.prototype.fetchDocs = function getFetchDocs () {
    return this._fetchDocs.get();
  };

  // subscriptions ------------------------------------

  Game.prototype.fetch = function gameFetch (docIds, sub, cb) {
    this._fetchCb = cb;
    this._fetchDocs.set({ ids: docIds, sub: sub });
  };

  Game.prototype.fetched = function gameFetched () {
    if (_.isFunction(this._fetchCb)) {
      this._fetchCb();
      this._fetchCb = null;
    }
  };

  //TODO improve fetching. currently, if multiple calls to fetch are
  //concurrently initiated, then some callbacks will be thrown away.

  Game.prototype.fetchMap = function gameFetchMap (mapId, cb) {
    this.fetch(mapId, 'singleMap', cb);
  };

  Game.prototype.fetchPokemon = function gameFetchPokemon (pokeIds, cb) {
    if (!_.isArray(pokeIds)) {
      pokeIds = [ pokeIds ];
    }
    this.fetch(pokeIds, 'pokemon', cb);
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

    if (self._transition.running()) {
      return; // disable keypress when transitioning
    }

    switch (self._state) {
      case constants.STATE_MAP:
        self._world.keydown(event, this._lastUpdate);
        break;
    }
  };

  Game.prototype.update = function onGameUpdate (dt, now) {
    var self = this;

    if (self._transition.running()) {
      self._transition.update(); // run transition concurrently
    }

    switch (self._state) {
      case constants.STATE_MAP:
        self._world.update(dt, now);
        break;
      case constants.STATE_BATTLE:
        self._battle.update(dt, now);
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

    self.transition(options.transition, function () {
      self._state = options.state;
      self._stateDep.changed();

      if (_.isFunction(options.onfinish)) {
        options.onfinish();
      }
    });
  };

  return Game;
})();
