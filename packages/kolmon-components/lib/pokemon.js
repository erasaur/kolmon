KOL.Pokemon = (function () {
  function Pokemon (options) {

  }

  Pokemon.prototype.load = function loadPokemon (options) {

  };

  // automatically called by battle whenever appropriate.
  // updates the local object with newly-published data from db.
  Pokemon.prototype.update = function updatePokemon () {
    _.extend(this, Pokemon.findOne(this._id));
  };

  Pokemon.prototype.isUnableToMove = function getIsUnableToMove () {
    // check health/status effects
  };

  Pokemon.prototype.health = function getHealth () {

  };

  return Pokemon;
})();
