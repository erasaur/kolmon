var schemas = KOL.schemas;

schemas.Move = new SimpleSchema({
  id: {
    type: String // id of the move
  },
  pp: {
    type: Number,
    min: 0,
    // defaultValue:  // XXX depends on move
  },
});

schemas.Pokemon = new SimpleSchema({
  _id: {
    type: String,
    optional: true
  },
  name: { // nickname of pokemon
    type: String,
    optional: true,
    // regEx: SimpleSchema.RegEx.Name
  },
  id: { // id of pokemon
    type: String
  },
  userId: { // owner of pokemon
    type: String
  },
  level: {
    type: Number,
    min: 1
  },
  stats: {
    type: Object,
    blackbox: true

    // stats: {
    //   health: 100,
    //   speed: 150,
    //   attack: 200,
    //   spAttack: 230,
    //   defense: 150,
    //   spDefense: 200
    // }
  },
  moves: { // XXX limit what moves based on poke
    type: [schemas.Move]
  },
  status: {
    type: String,
    // allowedValues: STATUS_TYPES // faint, paralysis, burn, confusion, etc.
  }
  // XXX nature, gender, item, color, etc.
});

var Pokemon = KOL.Pokemon = new Mongo.Collection('pokemon');
// Pokemon.attachSchema(schemas.Pokemon);
