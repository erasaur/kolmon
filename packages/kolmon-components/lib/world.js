var constants = KOL.constants;
var Timer = KOL.Timer;
var Player = KOL.Player;
var Map = KOL.Map;
var Maps = KOL.Maps;
var Players = KOL.Players;

KOL.World = (function () {
  function World (options) {
    if (!this instanceof World) {
      return new World(options);
    }

    this._updated = new Tracker.Dependency();
    if (options) this.load(options);
  }

  World.prototype.load = function loadWorld (options) {
    var self = this;
    var world = options.world;
    var player = options.player;

    // setup document ---------------------------------

    _.extend(self, world);

    // setup components -------------------------------

    self._game = options.game;
    self._renderers = options.renderers;
    self._players = {}; // cache of playerObj's
    self._maps = {}; // cache of mapObj's

    // config -----------------------------------------

    self._keyMap = {};
    self._keyMap[constants.KEY_UP] = constants.DIR_UP;
    self._keyMap[constants.KEY_LEFT] = constants.DIR_LEFT;
    self._keyMap[constants.KEY_RIGHT] = constants.DIR_RIGHT;
    self._keyMap[constants.KEY_DOWN] = constants.DIR_DOWN;

    // setup map --------------------------------------

    self._map = self.loadMap(player.mapId);

    // setup player (after map) -----------------------

    self._player = self.loadPlayer(player);

    // initial update
    this._updated.changed();
  };

  World.prototype.loadPlayer = function loadPlayer (playerId) {
    var player = _.isString(playerId) ? Players.findOne(playerId) : playerId;
    var playerObj = new Player({
      world: this,
      map: this._map,
      player: player,
      renderers: this._renderers
    });

    this._players[playerObj._id] = playerObj;
    return playerObj;
  };

  World.prototype.loadMap = function loadMap (mapId) {
    var map = _.isString(mapId) ? Maps.findOne(mapId) : mapId;
    var mapObj = new Map({
      world: this,
      map: map,
      renderers: this._renderers
    });

    this._maps[mapObj.id] = mapObj;
    return mapObj;
  };

  World.prototype.player = function getPlayer () {
    return this._player;
  };

  World.prototype.keydown = function onWorldKeydown (event, lastUpdate) {
    var player = this._player;
    var key = event.keyCode || event.which;
    var newDir = this._keyMap[key];

    // if moving already or invalid key, ignore
    if (!player || player.moving || !newDir) return;

    var newX = player.nextX(player.x, newDir);
    var newY = player.nextY(player.y, newDir);
    var portal = this._map.getPortal(newX, newY);

    if (portal) {
      this.changeMap(portal);
    }
    else if (!this._map.getWall(newX, newY)) {
      player.setDirection(newDir, lastUpdate);

      // var wild = this._map.getWild(newX, newY);
      // if (wild) {
      //   this.encounterWild(wild);
      // }
    }
  };

  World.prototype.encounterWild = function encounterWild (wild) {
    if (Math.random() <= wild.rate) {
      var self = this;
      var random = Math.random();
      var encounter = _.find(wild.encounters, function (encounter) {
        return random <= encounter.rate;
      });

      // self._game.fetchPokemon(encounter.id, function () {
      //   self._game.changeState({
      //     state: constants.STATE_BATTLE,
      //     transition: constants.TRANSITION_FADE_OUT
      //   });
      //   // TODO
      //   // self._game.initBattle();
      // });
    }
  };

  World.prototype.updated = function worldUpdated () {
    this._updated.changed();
  };

  World.prototype.render = function renderWorld () {
    this._map.render();
    this._player.render();
    this._updated.changed();
  };

  World.prototype.clear = function clearWorld () {
    this._map.clear();
    this.clearPlayers();
  };

  World.prototype.clearPlayers = function clearPlayers () {
    this._renderers.player.clear();
  };

  World.prototype.update = function onWorldUpdate (dt, now) {
    var self = this;
    var userId = Meteor.userId();
    var players;
    var player;

    self.clearPlayers();

    players = Players.find({ 'worldId': self._id, 'mapId': self._map._id }, {
      sort: { 'y': 1 }
    });

    // render each player to canvas
    players.forEach(function (playerDoc) {
      player = self._players[playerDoc._id];

      if (!player) {
        player = self.loadPlayer(playerDoc);
      }

      player.update(dt, now, playerDoc, userId === playerDoc.userId);
    });
  };

  World.prototype.changeMap = function changeMap (portal) {
    var self = this;
    var mapId = portal.mapId;

    // whether we have the map obj cached or not, we have to
    // re-subscribe to the map to get the updated players
    self._game.fetchMap(mapId, function () {
      self._map = self._maps[mapId] || self.loadMap(mapId);

      self._player.changeMap(self._map);

      // set the player position to the map defaults
      self._player.setDestination(self._map.initialPosition(portal.enterAt));
      self._player.setPosition(true);
      self._player.positionChanged();

      // clear everything
      self.clear();

      // reset player movement
      self._player.reset();

      // render everything
      self.render();

      self._game.transition(constants.TRANSITION_FADE_OUT);
    });
  };

  World.prototype.nearbyPlayers = function nearbyPlayers () {
    this._updated.depend();
    if (!this._player) return;

    var player = this._player;
    var players = this._players;

    var minX = player.x - constants.PX_PER_CELL;
    var maxX = player.x + constants.PX_PER_CELL;
    var minY = player.y - constants.PX_PER_CELL;
    var maxY = player.y + constants.PX_PER_CELL;

    return _.filter(players, function (p) {
      return (player.id !== p.id) &&
             (p.x >= minX && p.x <= maxX) &&
             (p.y >= minY && p.y <= maxY);
    });
  };

  return World;
})();
