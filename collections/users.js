var Schema = {};

Schema.UserStats = new SimpleSchema({
  battleCount: {
    type: Number
  },
  pokedollars: {
    type: Number
  }
});

Schema.UserProfile = new SimpleSchema({
  name: {
    type: String,
    optional: true
  },
  avatar: {
    type: String,
    optional: true
  }
});

Schema.UserGame = new SimpleSchema({
  roomId: {
    type: String,
    defaultValue: 0
  },
  position: {
    type: Schema.UserPosition
  },
  direction: { // 0 - static, 1 - up, 2 - left, 3 - right, 4 - bottom
    type: Number
  },
  inBattle: {
    type: Boolean
  },
  opponent: {
    type: Object,
    optional: true
  },
  'opponent.username': {
    type: String
  },
  'opponent.id': {
    type: String
  },
  hasTurn: { // currently executing the turn
    type: Boolean
  },
  // timeLeft: { // time left for turn
  //   type: Number,
  //   decimal: true
  // }
});

Schema.UserBag = new SimpleSchema({
  items: {
    type: [String]
  },
  balls: {
    type: [String]
  },
  keyItems: {
    type: [String]
  },
  machines: { // tm/hm
    type: [String]
  }
});

Schema.Move = new SimpleSchema({
  _id: {
    type: String,
    optional: true
  },
  name: {
    type: String
  },
  power: {
    type: Number,
    min: 10,
    max: 250 // XXX is this correct??
  },
  accuracy: {
    type: Number
  },
  type: {
    type: Number,
    // allowedValues: MOVE_TYPES // fire, water, grass, etc.
  }
});

// XXX horrible naming..
Schema.PokemonMove = new SimpleSchema({
  id: {
    type: String // _id of the move
  },
  name: {
    type: String
  },
  pp: {
    type: Number,
    min: 0,
    // defaultValue:  // XXX depends on move
  },
});

// maps each pokemon to its possible movelist
Schema.MoveLists = new SimpleSchema({
  _id: {
    type: String
  },
  pokemon: {
    type: String
  },
  moves: {
    type: [String]
  }
});

// evo = findOne({ pokemon: myPoke })
// myPokeLvl >= evo.levels[i] && myPoke !== evo.pokemon[i+1] ? evolve(myPoke)
// Schema.Evolutions = new SimpleSchema({
//   _id: {
//     type: String
//   },
    // pokemon: [String] // charmander, charmeleon, charizard
    // levels: [String] // 16, 36
// });

Schema.CanonicalPokemon = new SimpleSchema({
  _id: {
    type: String
  },
  // type: { // XXX move to separate schema
  //   type: Number,
  //   // allowedValues: POKEMON_TYPES
  // },
  // XXX other base stats
});

Schema.Pokemon = new SimpleSchema({
  _id: {
    type: String,
    optional: true
  },
  name: {
    type: String,
    optional: true,
    // regEx: SimpleSchema.RegEx.Name
  },
  id: {
    type: String // _id of pokemon
  },
  trainerId: { // owner of pokemon
    type: String
  },
  level: {
    type: Number,
    min: 1
  },
  hp: {
    type: Number,
    min: 0
  },
  moves: { // XXX limit what moves based on poke
    type: [Schema.PokemonMove]
  },
  status: {
    type: String,
    // allowedValues: STATUS_TYPES // paralysis, burn, confusion, etc.
  }
  // XXX nature, gender, item, color, etc.
});

// Pokemon = new Mongo.Collection('pokemon');

Schema.User = new SimpleSchema({
  _id: {
    type: String,
    optional: true
  },
  createdAt: {
    type: Date,
    optional: true
  },
  username: {
    type: String,
    regEx: /^[a-z0-9A-Z_]{3,15}$/
  },
  emails: {
    type: [Object],
    optional: true
  },
  'emails.$.address': {
    type: String,
    regEx: SimpleSchema.RegEx.Email
  },
  'emails.$.verified': {
    type: Boolean
  },
  profile: { // public and editable
    type: Schema.UserProfile,
    optional: true
  },
  services: {
    type: Object,
    blackbox: true
  },
  stats: {
    type: Schema.UserStats
  },
  bag: {
    type: Schema.UserBag
  },
  // pokemon: { // all pokemon (PC)
  //   type: [String]
  // },
  teamIds: {
    type: [String],
    max: 4
  },
  game: { // XXX move to separate collection. every move sends entire user doc & invalidates all functions depending on user
    type: Schema.UserGame
  },
  status: { // for user-status
    type: Object,
    blackbox: true,
    optional: true
  }
});

// Meteor.users.attachSchema(Schema.User);

Meteor.users.allow({
  update: function (userId, user) {
    return true;
    // return userId === user._id;
  },
  remove: function (userId, user) {
    return true;
    // return userId === user._id;
  }
});

Meteor.methods({
  setPosition: function (position) {
    var userId = Meteor.userId();
    if (!userId) return;

    Meteor.users.update(userId, {
      $set: { 'game.position': position, 'game.direction': 0 }
    });
  },
  setDirection: function (direction, startTime) {
    var userId = Meteor.userId();
    if (!userId) return;

    Meteor.users.update(userId, {
      $set: {
        'game.direction': direction,
        'game.startTime': startTime
      }
    });
  }
});
