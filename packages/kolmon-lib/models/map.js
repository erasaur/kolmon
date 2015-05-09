var constants = KOL.constants;

KOL.Map = (function () {
  function Map (options, onload) {
    var self = this;

    // starting coordinates for new players
    self.defaultX = constants.CENTER_X;
    self.defaultY = constants.CENTER_Y;

    // setup contexts --------------------------------

    self.playerContext = options.playerContext;
    self.bgContext = options.bgContext;
    self.fgContext = options.fgContext;

    // setup images ----------------------------------

    self.images = {};
    self.background = {
      data: options.background,
      images: _.keys(options.background)
    };
    self.foreground = {
      data: options.foreground,
      images: _.keys(options.foreground)
    };

    var bgSrcs = self.background.images;
    var fgSrcs = self.foreground.images;
    var imageSrcs = _.union(bgSrcs, fgSrcs);
    var loaded = 0;

    // preload all bg/fg images
    _.each(imageSrcs, function (src) {
      self.images[src] = new Image();
      self.images[src].onload = function () {
        if (++loaded >= imageSrcs.length) {
          onload.call(self);
        }
      };
      self.images[src].src = '/' + src + '.png';
    });

    // setup walls -----------------------------------

    self.walls = options.walls;
  }

  Map.prototype.render = function (context, options) {
    var self = this;
    var srcs = options.images;
    _.each(srcs, function (src) {
      var image = self.images[src];
      var origin = options.data[src];
      context.drawImage(image, origin.x, origin.y);
    });

    return self;
  };

  // render background images onto background context
  Map.prototype.renderBg = function () {
    return this.render(this.bgContext, this.background);
  };

  // render foreground images onto foreground context
  Map.prototype.renderFg = function () {
    return this.render(this.fgContext, this.foreground);
  };

  // clear player context
  Map.prototype.clearPlayers = function () {
    this.playerContext.clearRect(0, 0, constants.CANVAS_WIDTH, constants.CANVAS_HEIGHT);
  };

  return Map;
})();
