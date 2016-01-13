KOL.Pokemon = (function () {
  function Pokemon (options) {
    if (!this instanceof Pokemon) {
      return new Pokemon(options);
    }
    this.load(options);
  }

  Pokemon.prototype.load = function loadPokemon (options) {
    this._computations = {};
    this._dep = new Tracker.Dependency();
  };

  Pokemon.prototype.isUnableToMove = function getIsUnableToMove () {
    // check health/status effects
  };

  Pokemon.prototype.speed = function getMoveTime () {
    // if unableToMove, then return some negative value.
  };

  Pokemon.prototype.health = function getHealth () {
    this._dep.depend();
    return this.stats.health;
  };

  Pokemon.prototype.fetch = function fetchPokemon () {
    var self = this;
    Tracker.autorun(function (computation) {
      _.extend(this, Pokemon.findOne(this._id));
      self._dep.changed();
      self._computations[computation._id] = computation;
    });
  };

  // TODO inheriting methods from base class
  Pokemon.prototype.cleanup = function cleanupBattle () {
    _.each(this._computations, function (computation) {
      computation.stop();
    });
  };

  return Pokemon;
})();
