var Users = KOL.Users;

Meteor.publish('currentUser', function () {
  if (!this.userId) return this.ready();

  return Users.find(this.userId, {
    fields: { 'profile': 1, 'stats': 1, 'playerId': 1 }
  });
});

// Meteor.publish('pokemonList', function () {
//   if (!this.userId) return this.ready();

//   return Pokemon.find({ userId: this.userId }, {
//     fields: { 'name': 1 }
//   });
// });

// Meteor.publish('singlePokemon', function (pokemonId) {
//   check(pokemonId, String);

//   if (!this.userId) return this.ready();

//   var pokemon = Pokemon.findOne(pokemonId, { fields: { 'userId': 1 } });
//   if (pokemon.userId !== this.userId)
//     return this.ready();

//   return Pokemon.find(pokemonId);
// });
