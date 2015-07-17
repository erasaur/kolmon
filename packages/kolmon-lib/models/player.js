var constants = KOL.constants;

KOL.Player = (function () {
  function Player (options) {
    var self = this;
    var image;
    var defaultOptions;

    // rendering -------------------------------------

    image = new Image();
    image.onload = function () {
      self.image = this;
    };
    image.src = options.image || '/player.png';

    defaultOptions = {
      width: constants.PX_PER_CELL,
      height: 66,
      x: constants.CENTER_X,
      y: constants.CENTER_Y,
      numFrames: 3,
      direction: 0
    };

    options = _.defaults(_.pick(options, [
      'world', 'id', 'username', 'context', 'width', 'height', 'x', 'y', 'direction'
    ]), defaultOptions);
    _.extend(self, options);

    // style text rendering
    this.context.lineWidth = 1;
    this.context.font = '12px sans-serif';
    this.context.textAlign = 'center';

    // movement/animation ----------------------------

    self.frameIndex = 0; // current frame in spritesheet
    self.stepsSinceLast = 0; // steps since last frame change
    self.stepsPerFrame = constants.MOVE_TIME/(constants.UPDATE_STEP*this.numFrames); // how many steps before frame change

    self.updateCount = 0; // track how many updates have passed since our last attempt to setPosition

    self.startTime; // time of last 'begin move'
    self.destination = {}; // object containing the x and y coordinates of our current move destination
    self.movementQueue = []; // queue of moves to be executed

    // battle ----------------------------------------

    self.challenging = new ReactiveVar();
    self.inBattle = false;
  }

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
      alreadyArrived = nextY < this.destination.y;
    }
    else if (direction === constants.DIR_DOWN) {
      alreadyArrived = nextY > this.destination.y;
    }
    else if (direction === constants.DIR_LEFT) {
      alreadyArrived = nextX < this.destination.x;
    }
    else if (direction === constants.DIR_RIGHT) {
      alreadyArrived = nextX > this.destination.x;
    }

    // if we haven't already arrived at our destination, keep
    // moving incrementally towards it
    if (!alreadyArrived) {
      this.x = nextX;
      this.y = nextY;
    }
    // otherwise, fix our position at the destination
    else {
      this.x = this.destination.x;
      this.y = this.destination.y;
    }
  };

  /**
   * Renders the player's avatar and username onto the player canvas.
   */
  Player.prototype.render = function renderPlayer () {
    if (!this.image) return;

    if (this.moving) {
      this.stepsSinceLast++;

      if (this.stepsSinceLast > this.stepsPerFrame) {
        // loop back to first frame
        this.frameIndex = (this.frameIndex + 1) % this.numFrames;
        this.stepsSinceLast = 0;
      }
    } else {
      this.frameIndex = 0;
      this.stepsSinceLast = 0;
    }

    var width = Math.max(1, this.width);
    var height = Math.max(1, this.height / this.numFrames);

    // render image
    this.context.drawImage(
      this.image,
      (this.direction % 4) * width, // source x in spritesheet
      this.frameIndex * height + 1, // source y in spritesheet
      width,
      height,
      this.x,
      this.y,
      width,
      height
    );

    // render username
    this.context.fillText(
      this.username,
      this.x + width/2, // initial x
      this.y + height + constants.PX_PER_CELL/2, // initial y
      width*3 // max width
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
        var previous = this.movementQueue.length && this.movementQueue[this.movementQueue.length - 1];

        // we've initiated a new move that we haven't seen yet (startTimes are different), enqueue it
        if (!previous || previous.startTime !== playerDoc.startTime) {
          this.movementQueue.push({
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
        // if we're not locally emulating a move, i.e on setPosition we make a method call,
        // we want to guard against the case where the method call fails and we keep trying
        // on every update, in which case the method calls will get backlogged and freeze up.
        // so we 'throttle' it by calling the method only after every X amount of updates
        if (!local || this.updateCount++ % constants.UPDATES_PER_CALL === 0) {
          this.setPosition(local);
        }
      } else {
        this.updateCount = 0;
        var offset = (dt / constants.MOVE_TIME) * constants.PX_PER_CELL; // fraction of time * total dist
        this.move(this.direction, offset);
      }
    }

    // we're either idle or just finished a move, so let's move onto the next move in the queue, if there is one
    if (!local && !this.moving && this.movementQueue.length) {
      var next = this.movementQueue[0];
      this.destination.x = next.destination.x;
      this.destination.y = next.destination.y;
      this.direction = next.direction;
      this.startTime = now;
      this.moving = true;
    }

    this.render();
  };

  /**
   * Set the position of the player and end the current move.
   * @param {Boolean} local True if this is our player, False if this is another player in the map
   */
  Player.prototype.setPosition = function setPosition (local) {
    this.updateCount = 0;
    this.x = this.destination.x;
    this.y = this.destination.y;
    this.moving = false;
    this.startTime = null;

    // if we've just finished a 'non-local' move, remove it from queue.
    // we remove the movement after the move has completed (as opposed
    // to right when we begin) because we might end up enqueuing the same
    // move midway through the move if we see that playerDoc.moving is
    // still true (which it likely)
    if (!local) {
      this.movementQueue.shift();
    }
    // if it is a local change, propagate to global
    else {
      this.world._updated.changed();
      Meteor.call('setPosition', this.x, this.y);
    }
  };

  Player.prototype.setDirection = function setDirection (direction, startTime) {
    this.moving = true;
    this.direction = direction;
    this.startTime = startTime;

    this.destination.x = this.nextX(this.x, direction);
    this.destination.y = this.nextY(this.y, direction);

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
    return this.challenging.get();
  },

  Player.prototype.sendChallenge = function sendChallenge (playerId) {
    if (this.challenging.get()) {
      alert(i18n.t('one_challenge_limit'));
      return;
    }
    this.challenging.set(playerId);

    // TODO

    alert(i18n.t('challenge_sent'));
  };

  Player.prototype.retractChallenge = function retractChallenge () {
    this.challenging.set();
  };

  return Player;
})();
