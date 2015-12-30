var Pokemon = KOL.Pokemon;

Meteor.publish('pokemon', function (pokeIds) {
  check(pokeIds, [String]);

  if (!this.userId) return this.ready();

  return Pokemon.find({ '_id': { $in: pokeIds } });
});
