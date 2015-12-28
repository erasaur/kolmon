var constants = KOL.constants;

KOL.Transition = (function () {
  function Transition (options) {
    if (!this instanceof Transition) {
      return new Transition();
    }

    if (options) this.load(options);
  }

  Transition.prototype.load = function loadTransition (options) {
    var self = this;

    self._type = constants.TRANSITION_FADE_OUT;
    self._renderers = options.renderers;
    self._running = false;
    self._numFrames = constants.TRANSITION_NUM_FRAMES;
  };

  Transition.prototype.running = function getRunning () {
    return this._running;
  };

  Transition.prototype.run = function runTransition (options) {
    var self = this;

    if (self._running) {
      self.onfinish();
    }

    console.log('running transition');

    self._type = options.type || self._type;
    self._running = true;
    self._current = 0;

    if (_.isFunction(options.onfinish)) {
      self._onfinish = options.onfinish;
    }
  };

  Transition.prototype.onfinish = function finishTransition () {
    var self = this;
    self._running = false;

    console.log('finishing transition');

    if (self._onfinish) {
      self._onfinish();
      self._onfinish = null;
    }
  };

  Transition.prototype.update = function () {
    console.log('update');
    var self = this;
    var alpha = self._current / self._numFrames;

    if (self._type === constants.TRANSITION_FADE_OUT) {
      alpha = 1 - alpha;
    }

    self._renderers.transition.clear();
    self._renderers.transition.renderRect({
      globalAlpha: alpha,
      x: 0, y: 0,
      width: constants.CANVAS_WIDTH,
      height: constants.CANVAS_HEIGHT
    });

    if (++self._current >= self._numFrames) {
      self.onfinish();
    }
  };

  return Transition;
})();
