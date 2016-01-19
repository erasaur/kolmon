var c = KOL.constants;
var Pokemon = KOL.Pokemon; // TODO fix namespace conflict

KOL.Pokemon = (function () {
  function Pokemon (options) {
    if (!this instanceof Pokemon) {
      return new Pokemon(options);
    }
    this.load(options);
  }

  Pokemon.prototype.load = function loadPokemon (options) {
    this._dep = new Tracker.Dependency();

    var pokemon = options;
    if (_.isString(options)) {
      pokemon = Pokemon.findOne(options);
    }

    // extend c.POKEMON document to get descriptions, etc.
    _.extend(this, pokemon, c.POKEMON[pokemon.id]);
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
    _.extend(this, Pokemon.findOne(this._id));
    this._dep.changed();
  };

  return Pokemon;
})();
