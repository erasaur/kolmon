var constants = KOL.constants;
var Timer = KOL.Timer;
var Player = KOL.Player;
var Players = KOL.Players;

KOL.Game = (function () {
  function Game (options) {
    if (options) this.load(options);
  }

  Game.prototype.load = function loadGame (options) {
    this.players = {}; // TODO: clear out players that disconnect

    this.worldId = options.worldId;
    this.map = options.map;
    this.player = this.players[options.player.id] = options.player;

    this.lastUpdate;
    this.timer = Timer;

    this.start(); // start the update loop
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
    $(window).off('keydown').on('keydown', this.keydown.bind(this));
  };

  Game.prototype.stop = function stopGame (id) {
    if (!id) {
      this.map = this.player = this.players = null;
    }
    this.timer.stop(id);
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

    var newX = player.nextX(newDir);
    var newY = player.nextY(newDir);

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

  Game.prototype.update = function onUpdate (dt) {
    var self = this;

    // TODO let the player clearRect for itself only when it moves
    self.map.clearPlayers();

    var players = Players.find({ 'worldId': self.worldId }, {
      sort: { 'y': 1 }
    });

    // render each player to canvas
    players.forEach(function (player) {
      var playerId = player._id;

      if (!self.players[playerId]) {

        var playerDefaults = {
          id: player._id,
          username: player.username,
          context: self.map.playerContext,
          x: self.map.defaultX,
          y: self.map.defaultY
        };
        self.players[playerId] = new Player(playerDefaults);
      }

      (function (player, dir, start, x, y) {
        var now = Date.now();
        var moveDone = now > start + constants.MOVE_TIME;

        if (dir && !moveDone) {
          var offset = (dt / constants.MOVE_TIME) * constants.PX_PER_CELL; // fraction of time * total dist
          player.move(dir, offset);
        }
        else if (moveDone) {
          player.moving = false;
          // player.x = x;
          // player.y = y;
        }

        // TODO if in battle, render indicator above player
        // TODO only render if position has changed
        player.render();
      })(self.players[playerId], player.direction, player.startTime, player.x, player.y);
    });
  };

  Game.prototype.main = function main () {
    var now = Date.now();
    var dt = now - this.lastUpdate; // time since last update

    this.player.update(now);
    this.update(dt);
    this.lastUpdate = now;
  };

  Game.prototype.nearbyPlayers = function nearbyPlayers () {
    if (!this.player) return;

    var player = this.player;
    var players = this.players;
    var minX = player.x - constants.PX_PER_CELL;
    var maxX = player.x + constants.PX_PER_CELL;
    var minY = player.y - constants.PX_PER_CELL;
    var maxY = player.y + constants.PX_PER_CELL;

    return _.filter(players, function (p) {
      return player.id !== p.id && (p.x >= minX && p.x <= maxX && p.y >= minY && p.y <= maxY);
    });
  };

  return Game;
})();
