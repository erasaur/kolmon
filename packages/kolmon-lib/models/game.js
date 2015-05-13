var constants = KOL.constants;
var Timer = KOL.Timer;
var Player = KOL.Player;
var Map = KOL.Map;
var Players = KOL.Players;

KOL.Game = (function () {
  function Game (options) {
    this._updated = new Tracker.Dependency();
    if (options) this.load(options);
  }

  Game.prototype.load = function loadGame (options) {
    // init internal
    this.players = {}; // TODO: clear out players that disconnect
    this.worldId = options.worldId;
    this.lastUpdate;
    this.timer = Timer;

    // init map
    this.map = new Map(options.map, function () {
      this.renderBg().renderFg();
    });

    // init player
    this.player = this.loadPlayer(options.player);

    // start the update loop
    this.start();
    this._updated.changed();
  };

  Game.prototype.loadPlayer = function loadPlayer (player, options) {
    var defaults;
    var playerObj;

    defaults = {
      game: this,
      id: player._id,
      username: player.username,
      context: this.map.playerContext,
      x: player.x || this.map.defaultX,
      y: player.y || this.map.defaultY,
      direction: player.direction
    };
    playerObj = new Player(_.defaults(options || {}, defaults));
    this.players[playerObj.id] = playerObj;

    return playerObj;
  };

  Game.prototype.start = function startGame () {
    // initial render of player
    this.player.render();

    // initialize time of last update
    this.lastUpdate = Date.now();

    this.timer.stop('main');
    this.timer.start('main', this.main.bind(this), constants.UPDATE_STEP);

    // handle window events with jQuery since template events
    // don't seem to work well with global events
    $(window).off('keydown.move').on('keydown.move', this.keydown.bind(this));
  };

  Game.prototype.stop = function stopGame (id) {
    $(window).off('keydown.move');
    (this.timer || Timer).stop(id);

    if (!id) {
      this.map = this.player = this.players = null;
    }
  };

  Game.prototype.keydown = function onKeydown (event) {
    event.preventDefault();

    var player = this.player;
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

    if (_.some(this.map.walls, function (wall) {
      return (
        newX < wall.x + wall.w &&
        newX >= wall.x &&
        newY < wall.y + wall.h - constants.PX_PER_CELL &&
        newY >= wall.y - constants.PX_PER_CELL
      );
    })) return;

    player.setDirection(newDir, this.lastUpdate);
  };

  Game.prototype.update = function onUpdate (dt, now) {
    var self = this;
    var players;
    var player;
    var userId = Meteor.userId();

    // TODO let the player clearRect for itself only when it moves
    self.map.clearPlayers();

    players = Players.find({ 'worldId': self.worldId }, {
      sort: { 'y': 1 }
    });

    // render each player to canvas
    players.forEach(function (playerDoc) {
      player = self.players[playerDoc._id];

      if (!player) {
        player = self.loadPlayer(playerDoc);
      }

      player.update(dt, now, playerDoc, userId === playerDoc.userId);
    });
  };

  Game.prototype.main = function main () {
    var now = Date.now();
    var dt = now - this.lastUpdate; // time since last update

    // this.player.update(dt, now);
    this.update(dt, now);
    this.lastUpdate = now;
  };

  Game.prototype.nearbyPlayers = function nearbyPlayers () {
    this._updated.depend();

    if (this.player) {
      var player = this.player;
      var players = this.players;

      var minX = player.x - constants.PX_PER_CELL;
      var maxX = player.x + constants.PX_PER_CELL;
      var minY = player.y - constants.PX_PER_CELL;
      var maxY = player.y + constants.PX_PER_CELL;

      return _.filter(players, function (p) {
        return player.id !== p.id && (p.x >= minX && p.x <= maxX && p.y >= minY && p.y <= maxY);
      });
    }
  };

  return Game;
})();
