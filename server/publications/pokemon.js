var Pokemon = KOL.Pokemon;

Meteor.publish('pokemonList', function () {
  return Pokemon.find();
});
