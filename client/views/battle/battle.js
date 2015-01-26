var nextPokemon = function (user) {
  return user && _.find(user.team, function (pokemon) {
    return pokemon.hp > 0;
  });
};

// XXX separate package, handle pub/sub to a battle collection
// with all the turns, separate Battle class, etc
Template.battle.helpers({
  currentPokemon: function () {
    return nextPokemon(Meteor.user());
  },
  opponentPokemon: function () {
    return nextPokemon(this);
  }
});

