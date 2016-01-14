var c = KOL.constants;
var Bags = KOL.Bags;

KOL.Bag = (function () {

  function Bag (options) {
    if (!this instanceof Bag) {
      return new Bag(options);
    }
    if (options) this.load(options);
  }

  Bag.prototype.load = function (options) {
    this._computations = {};

    var bag = options;
    if (_.isString(options)) { // bagId
      bag = Bags.findOne(options);
    }

    _.extend(this, bag);

    this._tabIndex = 0;
    this._tabs = ['items','balls'];
  };

  Bag.prototype.switchTab = function bagSwitchTab (index) {
    this._tabIndex = index;
  };

  Bag.prototype.getItem = function (index) {
    var tab = this._tabs[this._tabIndex]; // e.g 'items'
    var item = this[tab][index]; // e.g { id: 'asd', count: 3 }
    return {
      item: c.ITEMS[item.id],
      count: item.count
    };
  };

  Bag.prototype.fetch = function bagFetch () {
    var self = this;
    Tracker.autorun(function (computation) {
      var bag = Bags.findOne(self._id);
      _.extend(self, bag);

      self._computations[computation._id] = computation;
    });
  };

  Bag.prototype.cleanup = function cleanupBag () {
    _.each(this._computations, function (computation) {
      computation.stop();
    });
  };

  return Bag;
})();
