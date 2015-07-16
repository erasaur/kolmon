var constants = KOL.constants;
var Timer = KOL.Timer;
var Player = KOL.Player;
var Map = KOL.Map;
var Players = KOL.Players;

KOL.World = (function () {
  function World (options) {
    this._updated = new Tracker.Dependency();
    if (options) this.load(options);
  }

  World.prototype.load = function loadWorld (options) {
    // init internal
    this._players = {}; // TODO: clear out players that disconnect
    this._worldId = options.worldId;
    this._lastUpdate;
    this._timer = Timer;

    // init map
    this._map = new Map(options.map, function () {
      this.renderBg().renderFg();
    });

    // init player
    this._player = this.loadPlayer(options.player);

    // start the update loop
    this.start();
    this._updated.changed();
  };

  World.prototype.loadPlayer = function loadPlayer (player, options) {
    var defaults;
    var playerObj;

    defaults = {
      world: this,
      id: player._id,
      username: player.username,
      context: this._map.playerContext,
      x: player.x || this._map.defaultX,
      y: player.y || this._map.defaultY,
      direction: player.direction
    };
    playerObj = new Player(_.defaults(options || {}, defaults));
    this._players[playerObj.id] = playerObj;

    return playerObj;
  };

  World.prototype.player = function getPlayer () {
    return this._player;
  };

  World.prototype.start = function startWorld () {
    // initial render of player
    this._player.render();

    // initialize time of last update
    this._lastUpdate = Date.now();

    this._timer.stop('main');
    this._timer.start('main', this.main.bind(this), constants.UPDATE_STEP);

    // handle window events with jQuery since template events
    // don't seem to work well with global events
    $(window).off('keydown.move').on('keydown.move', this.keydown.bind(this));
  };

  World.prototype.stop = function stopWorld (id) {
    $(window).off('keydown.move');
    (this._timer || Timer).stop(id);

    if (!id) {
      this._map = this._player = this._players = null;
    }
  };

  World.prototype.keydown = function onKeydown (event) {
    event.preventDefault();

    var player = this._player;
    var key = event.keyCode || event.which;
    var newDir = {
      38: constants.DIR_UP,
      37: constants.DIR_LEFT,
      39: constants.DIR_RIGHT,
      40: constants.DIR_DOWN
    }[key];

    // if moving already or invalid key
    if (!player || player.moving || !newDir) return;

    var newX = player.nextX(player.x, newDir);
    var newY = player.nextY(player.y, newDir);

    if (_.some(this._map.walls, function (wall) {
      return (
        newX < wall.x + wall.w &&
        newX >= wall.x &&
        newY < wall.y + wall.h - constants.PX_PER_CELL &&
        newY >= wall.y - constants.PX_PER_CELL
      );
    })) return;

    player.setDirection(newDir, this._lastUpdate);
  };

  World.prototype.update = function onUpdate (dt, now) {
    var self = this;
    var players;
    var player;
    var userId = Meteor.userId();

    // TODO let the player clearRect for itself only when it moves
    self._map.clearPlayers();

    players = Players.find({ 'worldId': self._worldId }, {
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

  World.prototype.main = function main () {
    var now = Date.now();
    var dt = now - this._lastUpdate; // time since last update

    // this.player.update(dt, now);
    this.update(dt, now);
    this._lastUpdate = now;
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
        return player.id !== p.id && (p.x >= minX && p.x <= maxX && p.y >= minY && p.y <= maxY);
      });
    }
  };

  return World;
})();
