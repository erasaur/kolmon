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
    self.stepsPerFrame = 2; // how many steps before frame change

    self.attempts = 0; // track how many times setPosition is being called per move
    // self.startTime; // time of last 'begin move'

    // battle ----------------------------------------

    self.challenging = new ReactiveVar();
    self.inBattle = false;
  }

  Player.prototype.move = function movePlayer (direction, offset) {
    this.moving = true;
    this.direction = direction;

    this.x = this.nextX(this.x, direction, offset);
    this.y = this.nextY(this.y, direction, offset);
  };

  Player.prototype.render = function renderPlayer () {
    if (!this.image) return;

    if (this.moving) {
      this.stepsSinceLast++;

      if (this.stepsSinceLast > this.stepsPerFrame) {
        // loop back to first frame
        this.frameIndex = this.frameIndex >= this.numFrames - 1 ? 0 : this.frameIndex + 1;
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

  Player.prototype.update = function updatePlayer (dt, now, playerDoc, local) {
    if (playerDoc.moving) {
      var startTime = playerDoc.startTime;
      var dir = playerDoc.direction;

      // previous move has completed, update position
      if (startTime && (now >= startTime + constants.MOVE_TIME)) {
        if (++this.attempts < 5) {
          this.setPosition(
            this.nextX(playerDoc.x, dir),
            this.nextY(playerDoc.y, dir),
            local
          );
        }
      } else {
        this.attempts = 0;
        var offset = (dt / constants.MOVE_TIME) * constants.PX_PER_CELL; // fraction of time * total dist
        this.move(dir, offset);
      }
    }
    // update battle status
    this.inBattle = playerDoc.inBattle;

    this.render();
  };

  Player.prototype.setPosition = function setPosition (x, y, local) {
    this.x = x;
    this.y = y;
    this.moving = false;

    // if it is a local change, propagate to global
    if (local) {
      this.world._updated.changed();
      Meteor.call('setPosition', x, y);
    }
  };

  Player.prototype.setDirection = function setDirection (direction, startTime) {
    Meteor.call('setDirection', direction, startTime);
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
