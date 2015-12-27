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

    self._world = world;
    self._renderers = options.renderers;
    self._players = {}; // cache of playerObj's
    self._maps = {}; // cache of mapObj's

    // config -----------------------------------------

    self._keyMap = {
      38: constants.DIR_UP,
      37: constants.DIR_LEFT,
      39: constants.DIR_RIGHT,
      40: constants.DIR_DOWN
    };

    // setup map --------------------------------------

    self._map = self.loadMap(player.mapId);

    // setup player (after map) -----------------------

    self._player = self.loadPlayer(player);

    // initial update
    self._map.render();
    self._player.render();
    self._updated.changed();
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
    event.preventDefault();

    var player = this._player;
    var key = event.keyCode || event.which;
    var newDir = this._keyMap[key];

    // if moving already or invalid key, ignore
    if (!player || player.moving || !newDir) return;

    var newX = player.nextX(player.x, newDir);
    var newY = player.nextY(player.y, newDir);

    if (!this._map.isWall(newX, newY)) {
      if (this._map.isPortal(newX, newY)) {
        this.changeMap(newDir);
      } else {
        player.setDirection(newDir, lastUpdate);
      }
    }
  };

  World.prototype.update = function onWorldUpdate (dt, now) {
    var self = this;
    var userId = Meteor.userId();
    var players;
    var player;

    self._map.clearPlayers();

    players = Players.find({ 'worldId': self._world._id }, {
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

  World.prototype.changeMap = function changeMap (inDirection) {
    var self = this;
    var mapId = self.adjacentMap(inDirection);

    if (!mapId) {
      throw 'No adjacent map in that direction!';
    }

    self._game.changeState({
      state: constants.STATE_MAP,
      onfinish: function () {
        self._map = self._maps[mapId] || self.loadMap(mapId);

        self._player.changeMap(self._map);

        // set the player position to the map defaults
        self._player.setDestination(self._map.startingPosition(inDirection));
        self._player.setPosition(true);

        // reset player position/movement
        self._player.reset();

        // re-render everything
        self._map.clearPlayers();
        self._map.render();
        self._player.render();
      }
    });
  };

  World.prototype.adjacentMap = function adjacentMap (direction) {
    return this._world.maps[this._map.id][direction];
  };

  World.prototype.nearbyPlayers = function nearbyPlayers () {
    this._updated.depend();

    if (this._player) {
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
    }
  };

  return World;
})();
