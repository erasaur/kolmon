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
    self._map = map;
    self._renderers = options.renderers;

    // setup walls ------------------------------------

    self._walls = map.walls;
    self._portals = map.portals;

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

  Map.prototype.render = function () {
    this._renderers.bg.render(this._background);
    this._renderers.fg.render(this._foreground);
  };

  Map.prototype.clearPlayers = function () {
    this._renderers.player.clear();
  };

  // game functionality -------------------------------

  Map.prototype.startingPosition = function (fromDirection) {
    if (fromDirection === constants.DIR_UP) {
      return this.startingPosition.south;
    }
    else if (fromDirection === constants.DIR_DOWN) {
      return this.startingPosition.north;
    }
    else if (fromDirection === constants.DIR_LEFT) {
      return this.startingPosition.east;
    }
    else if (fromDirection === constants.DIR_RIGHT) {
      return this.startingPosition.west;
    }
    return this.startingPosition.default;
  };

  Map.prototype.intersects = function (rects, x, y) {
    return _.some(rects, function (rect) {
      return (x < rect.x + rect.w) &&
             (x >= rect.x) &&
             (y < rect.y + rect.h - constants.PX_PER_CELL) &&
             (y >= rect.y - constants.PX_PER_CELL);
    });
  };

  Map.prototype.isPortal = function (x, y) {
    return this.intersects(this.portals, x, y);
  };

  Map.prototype.isWall = function (x, y) {
    return this.intersects(this.walls, x, y);
  };

  return Map;
})();
