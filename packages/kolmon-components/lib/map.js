var constants = KOL.constants;

KOL.Map = (function () {
  function Map (options) {
    if (!this instanceof Map) {
      return new Map(options);
    }

    if (options) this.load(options);
  }

  Map.prototype.load = function (options) {
    var self = this;
    var map = options.map;
    var count = 0;
    var onload;

    // setup document ---------------------------------

    _.extend(self, map);

    // setup components -------------------------------

    self._world = options.world;
    self._renderers = options.renderers;

    // setup images -----------------------------------

    self._background = _.map(map.background, function (value, key) {
      return { src: key, x: value.x, y: value.y };
    });
    self._foreground = _.map(map.foreground, function (value, key) {
      return { src: key, x: value.x, y: value.y };
    });

    //TODO improve this
    onload = function () {
      if (++count >= 2) self.render();
    };
    self._renderers.bg.loadImages({
      srcs: _.keys(map.background),
      onload: onload
    });
    self._renderers.fg.loadImages({
      srcs: _.keys(map.foreground),
      onload: onload
    });
  };

  // rendering ---------------------------------------

  Map.prototype.render = function renderMap () {
    this._renderers.bg.render(this._background);
    this._renderers.fg.render(this._foreground);
  };

  Map.prototype.clear = function clearMap () {
    this._renderers.bg.clear();
    this._renderers.fg.clear();
  };

  // game functionality -------------------------------

  Map.prototype.initialPosition = function getInitialPosition (fromDirection) {
    var self = this;
    var start;

    switch (fromDirection) {
      case constants.DIR_UP:
        start = self.startingPosition.south; break;
      case constants.DIR_DOWN:
        start = self.startingPosition.north; break;
      case constants.DIR_LEFT:
        start = self.startingPosition.east; break;
      case constants.DIR_RIGHT:
        start = self.startingPosition.west; break;
    }

    return start || this.startingPosition.default;
  };

  Map.prototype.intersects = function (rects, x, y) {
    return _.find(rects, function (rect) {
      return (x < rect.x + rect.w) &&
             (x >= rect.x) &&
             (y < rect.y + rect.h) &&
             (y >= rect.y);
    });
  };

  Map.prototype.getPortal = function (x, y) {
    return this.intersects(this.portals, x, y);
  };

  Map.prototype.getWall = function (x, y) {
    return this.intersects(this.walls, x, y);
  };

  Map.prototype.getWild = function (x, y) {
    return this.intersects(this.wild, x, y);
  };

  return Map;
})();
