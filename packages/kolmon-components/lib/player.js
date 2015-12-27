var constants = KOL.constants;

KOL.Player = (function () {
  function Player (options) {
    var self = this;
    var player = options.player;
    var map = options.map;

    // setup document ---------------------------------

    _.extend(self, player, {
      _width: constants.PLAYER_WIDTH,
      _height: constants.PLAYER_HEIGHT,
      direction: 0
    });

    // setup components -------------------------------

    self._player = player;
    self._map = map;
    self._world = options.world;
    self._renderers = options.renderers;

    // setup rendering --------------------------------

    self._renderers.player.loadImages({
      srcs: player.image,
      onload: function (images) {
        self._image = images[player.image];
      }
    });

    // set values to defaults
    this.reset();
  }

  Player.prototype.reset = function resetPlayer () {
    var self = this;
    var timePerMove = constants.UPDATE_STEP * constants.PLAYER_NUM_FRAMES;

    // movement and animation -------------------------

    // current frame in spritesheet
    self._frameIndex = 0;
    // steps since last frame change
    self._stepsSinceLast = 0;
    // how many steps before frame change
    self._stepsPerFrame = constants.MOVE_TIME / timePerMove;

    // number of updates that have passed since our last attempt to setPosition
    self._updateCount = 0;

    // x and y coordinates of our current move destination
    self._destination = {};
    // queue of moves to be executed
    self._movementQueue = [];

    // battle ----------------------------------------

    self._challenging = new ReactiveVar();
    self._inBattle = false;
  };

  Player.prototype.changeMap = function changeMap (map) {
    var start = map.startingPosition();

    self._player.mapId = map._id;
    self._player.x = start.x;
    self._player.y = start.y;

    Meteor.call('enterMap', map._id);
  };

  /**
   * Method that gets called on every update step to update the player's
   * position in the specified direction and by the specified offset.
   * @param  {Number} direction Direction of movement (as defined in KOL.constants)
   * @param  {Number} offset    The amount to move in said direction
   */
  Player.prototype.move = function movePlayer (direction, offset) {
    var nextX = this.nextX(this.x, direction, offset);
    var nextY = this.nextY(this.y, direction, offset);
    var alreadyArrived = false;

    if (direction === constants.DIR_UP) {
      alreadyArrived = nextY <= this._destination.y;
    }
    else if (direction === constants.DIR_DOWN) {
      alreadyArrived = nextY >= this._destination.y;
    }
    else if (direction === constants.DIR_LEFT) {
      alreadyArrived = nextX <= this._destination.x;
    }
    else if (direction === constants.DIR_RIGHT) {
      alreadyArrived = nextX >= this._destination.x;
    }

    // if we haven't already arrived at our destination, keep
    // moving incrementally towards it
    if (!alreadyArrived) {
      this.x = nextX;
      this.y = nextY;
    }
    // otherwise, fix our position at the destination
    else {
      this.x = this._destination.x;
      this.y = this._destination.y;
    }
  };

  /**
   * Renders the player's avatar and username onto the player canvas.
   */
  Player.prototype.render = function renderPlayer () {
    if (!this._image) return;

    // this._test = this._test || 0;
    // if (this.username === 'user') {
    //   if (++this._test > 200) {
    //     console.log(this);
    //     this._test = 0;
    //   }
    // }

    if (this.moving) {
      this._stepsSinceLast++;

      if (this._stepsSinceLast > this._stepsPerFrame) {
        // loop back to first frame
        this._frameIndex = (this._frameIndex + 1) % constants.PLAYER_NUM_FRAMES;
        this._stepsSinceLast = 0;
      }
    } else {
      this._frameIndex = 0;
      this._stepsSinceLast = 0;
    }

    var width = Math.max(1, this._width);
    var height = Math.max(1, this._height / constants.PLAYER_NUM_FRAMES);

    // render image
    this._renderers.player.render(
      this._image,
      (this.direction % 4) * width, // source x in spritesheet
      this._frameIndex * height + 1, // source y in spritesheet
      width,
      height,
      ~~(0.5 + this.x), // round value to prevent anti aliasing by canvas
      ~~(0.5 + this.y),
      width,
      height
    );

    // render username
    this._renderers.player.renderText(
      this.username,
      this.x + width / 2, // initial x
      this.y + height + constants.PX_PER_CELL / 2, // initial y
      width * 3 // max width
    );
  };

  /**
   * A single update step for player. Called from World update step.
   * @param  {Number} dt        Time in ms that has elapsed since last update step.
   * @param  {Number} now       Current time in ms (Date.now())
   * @param  {Object} playerDoc Document fetched from KOL.Players collection representing this player
   * @param  {Boolean} local    True if this is our player, False if this is another player in the map
   */
  Player.prototype.update = function updatePlayer (dt, now, playerDoc, local) {
    // if not local, check the newly fetched player document to see
    // if the player initiated a move that we don't yet know about
    if (!local) {
      if (playerDoc.moving) {
        var previous = this._movementQueue.pop();

        // we've initiated a new move that we haven't seen yet (startTimes are different), enqueue it
        if (!previous || previous.startTime !== playerDoc.startTime) {
          this._movementQueue.push({
            destination: {
              x: this.nextX(playerDoc.x, playerDoc.direction),
              y: this.nextY(playerDoc.y, playerDoc.direction)
            },
            direction: playerDoc.direction,

            // we only really store the startTime to check the uniqueness of the move.
            // in reality, when coordinating the actual move and animations, we rely
            // on the client's startTime (to be in sync with our update steps), which
            // is different from this startTime that came from the server.
            startTime: playerDoc.startTime
          });
        }
      }
    }

    if (this.moving) {
      // previous move has completed, update position
      if (now >= this.startTime + constants.MOVE_TIME) {
        if (!local) {
          // if we've just finished a 'non-local' move, remove it from queue.
          // we remove it from queue after the move has completed (as opposed
          // to right when it begins) because we might end up enqueuing the same
          // move midway through, if playerDoc.moving happens to still be true
          // before we finish the move.
          this._movementQueue.shift();
          this.setPosition(false);
        }

        // if we're locally initiating a move, i.e on setPosition we have to make a method call,
        // we want to guard against the case where the method call fails and we keep re-trying
        // on every update (in which case the method calls will get backlogged and freeze up).
        // so we 'throttle' it by calling the method only after every X amount of updates.
        else if (this._updateCount++ % constants.UPDATES_PER_CALL === 0) {
          this.setPosition(true);
        }
      } else {
        this._updateCount = 0;
        // fraction of time * total dist
        var offset = (dt / constants.MOVE_TIME) * constants.PX_PER_CELL;
        this.move(this.direction, offset);
      }
    }

    // we're either idle or just finished a move, so let's move onto the next move in the queue, if there is one
    if (!local && !this.moving && this._movementQueue.length) {
      var next = this._movementQueue[0];
      this._destination.x = next.destination.x;
      this._destination.y = next.destination.y;
      this.direction = next.direction;
      this.startTime = now;
      this.moving = true;
    }

    this.render();
  };

  /**
   * Set the destination of the player, which will be its position upon the next setPosition call.
   * @param {Object} destination Coordinates of the destination (x,y)
   */
  Player.prototype.setDestination = function setDestination (destination) {
    this._destination.x = destination.x;
    this._destination.y = destination.y;
  };

  /**
   * Set the position of the player and end the current move.
   * @param {Boolean} local True if this is our player, False if this is another player in the map
   */
  Player.prototype.setPosition = function setPosition (local) {
    this._updateCount = 0;
    this.x = this._destination.x;
    this.y = this._destination.y;
    this.moving = false;
    this.startTime = null;

    // if it is a local change, propagate to global
    if (local) {
      this._world._updated.changed();
      Meteor.call('setPosition', this.x, this.y);
    }
  };

  Player.prototype.setDirection = function setDirection (direction, startTime) {
    this.moving = true;
    this.direction = direction;
    this.startTime = startTime;

    this._destination.x = this.nextX(this.x, direction);
    this._destination.y = this.nextY(this.y, direction);

    Meteor.call('setDirection', direction);
  };

  Player.prototype.nextX = function nextX (currX, dir, offset) {
    offset = offset || constants.PX_PER_CELL;

    if (dir === constants.DIR_LEFT) // move left
      return currX - offset;

    if (dir === constants.DIR_RIGHT) // move right
      return currX + offset;

    return currX;
  };

  Player.prototype.nextY = function nextY (currY, dir, offset) {
    offset = offset || constants.PX_PER_CELL;

    if (dir === constants.DIR_UP) // move up
      return currY - offset;

    if (dir === constants.DIR_DOWN) // move down
      return currY + offset;

    return currY;
  };

  Player.prototype.challenging = function challenging () {
    return this._challenging.get();
  },

  Player.prototype.sendChallenge = function sendChallenge (playerId) {
    if (this._challenging.get()) {
      alert(i18n.t('one_challenge_limit'));
      return;
    }
    this._challenging.set(playerId);

    // TODO

    alert(i18n.t('challenge_sent'));
  };

  Player.prototype.retractChallenge = function retractChallenge () {
    this._challenging.set();
  };

  return Player;
})();
