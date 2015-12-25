var utils = KOL.utils;
var constants = KOL.constants;

KOL.Renderer = (function () {
  function Renderer (options) {
    if (!this instanceof Renderer) {
      return new Renderer(options);
    }

    if (options) this.load(options);
  }

  Renderer.prototype.load = function (options) {
    this._context = options.context;
    this._width = options.width || constants.CANVAS_WIDTH;
    this._height = options.height || constants.CANVAS_HEIGHT;

    // text rendering options ------------------------

    this._context.lineWidth = constants.DEFAULT_LINE_WIDTH;
    this._context.font = constants.DEFAULT_FONT;
    this._context.textAlign = constants.DEFAULT_TEXT_ALIGN;

    // image cache -----------------------------------

    this._images = {};
  };

  Renderer.prototype.loadImages = function (options) {
    if (!_.isArray(options.srcs)) {
      options.srcs = [options.srcs];
    }

    var self = this;
    var loaded = 0;
    var len = options.srcs.length;
    _.each(options.srcs, function (src) {
      if (self._images[src]) return ++loaded;

      self._images[src] = new Image();
      self._images[src].onload = function () {
        if (++loaded >= len) {
          options.onload(self._images);
        }
      };
      self._images[src].src = utils.normalizeSrc(src);
    });
  };

  Renderer.prototype.render = function (images) {
    if (arguments.length > 1) {
      return self._context.drawImage.apply(self, arguments);
    }

    if (!_.isArray(images)) {
      images = [images];
    }

    var self = this;
    _.each(images, function (image) {
      var img = self._images[image.src];
      var origin = image.origin;
      self._context.drawImage(img, origin.x, origin.y);
    });

    return self;
  };

  Renderer.prototype.renderText = function (options) {
    if (arguments.length > 1) {
      return self._context.fillText.apply(self, arguments);
    }

    self._context.fillText(options.text, options.x, options.y, options.width);
    return self;
  };

  Renderer.prototype.clear = function () {
    this.context.clearRect(0, 0, this.width, this.height);
  };

  return Renderer;
})();

