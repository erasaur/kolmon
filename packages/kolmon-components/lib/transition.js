KOL.Transition = (function () {
  function Transition (options) {
    if (!this instanceof Transition) {
      return new Transition();
    }

    if (options) this.load(options);
  }

  Transition.prototype.load = function loadTransition (options) {
    var self = this;

    self._renderers = options.renderers;
    self._running = false;
  };

  Transition.prototype.run = function runTransition (options) {
    var self = this;
    var frames = constants.TRANSITIONS[options.state];

    if (self._running || !_.isArray(frames)) {
      options.onfinish();
    }

    self._renderers.fg.loadImages({
      srcs: frames,
      onload: function (images) {
        self._images = images;
        self._current = 0;
        self._numFrames = frames.length;
        self._onfinish = options.onfinish;
        self._running = true;
      }
    });
  };

  Transition.prototype.onfinish = function finishTransition () {
    self._running = false;

    if (self._onfinish) {
      self._onfinish();
      self._onfinish = null;
    }
  };

  Transition.prototype.update = function () {
    var self = this;
    renderers.fg.render(self._images[self._current]);

    if (++self._current >= self._numFrames) {
      self.onfinish();
    }
  };

  return Transition;
})();
