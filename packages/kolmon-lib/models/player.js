var constants = KOL.constants;

KOL.Player = (function () {
  function Player (options) {
    var self = this;
    var image;
    var defaultOptions;

    // load image
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

    _.extend(self, defaultOptions, _.pick(options, [
      'id', 'username', 'context', 'width', 'height', 'x', 'y', 'direction'
    ]));

    self.frameIndex = 0; // current frame in spritesheet
    self.stepsSinceLast = 0; // steps since last frame change
    self.stepsPerFrame = 2; // how many steps before frame change

    self.startTime; // time of last 'begin move'
  }

  Player.prototype.move = function (dir, offset) {
    this.direction = dir;
    this.moving = true;
    this.x = this.nextX(dir, offset);
    this.y = this.nextY(dir, offset);
  };

  Player.prototype.render = function () {
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
  };

  Player.prototype.update = function (now) {
    // make sure previous move completed before updating position
    var startTime = this.startTime;
    var moveDone = now >= startTime + constants.MOVE_TIME;

    // previous move has completed, update position
    if (!!startTime && moveDone) {
      var newX = this.nextX(this.direction);
      var newY = this.nextY(this.direction);

      Meteor.call('setPosition', newX, newY);
      this.startTime = null;
      // this.direction = 0;
      this.moving = false;
    }
  };

  Player.prototype.setPosition = function (x, y) {
    Meteor.call('setPosition', x, y);
  };

  Player.prototype.setDirection = function (direction, startTime) {
    this.direction = direction;
    this.startTime = startTime;

    Meteor.call('setDirection', direction, startTime);
  };

  Player.prototype.nextX = function (dir, offset) {
    offset = offset || constants.PX_PER_CELL;

    if (dir === constants.DIR_LEFT) // move left
      return this.x - offset;

    if (dir === constants.DIR_RIGHT) // move right
      return this.x + offset;

    return this.x;
  };

  Player.prototype.nextY = function (dir, offset) {
    offset = offset || constants.PX_PER_CELL;

    if (dir === constants.DIR_UP) // move up
      return this.y - offset;

    if (dir === constants.DIR_DOWN) // move down
      return this.y + offset;

    return this.y;
  };

  return Player;
})();
