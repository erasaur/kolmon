Schemas.Move = new SimpleSchema({
  id: {
    type: String // id of the move
  },
  pp: {
    type: Number,
    min: 0,
    // defaultValue:  // XXX depends on move
  },
});

Schemas.Pokemon = new SimpleSchema({
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
    type: [Schemas.Move]
  },
  status: {
    type: String,
    // allowedValues: STATUS_TYPES // paralysis, burn, confusion, etc.
  }
  // XXX nature, gender, item, color, etc.
});

Pokemon = new Mongo.Collection('pokemon');
Pokemon.attachSchema(Schemas.Pokemon);
