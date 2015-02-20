Schemas.Bag = new SimpleSchema({
  pokedollars: {
    type: Number,
    defaultValue: 0
  },
  items: {
    type: [String],
    defaultValue: []
  },
  balls: {
    type: [String],
    defaultValue: []
  },
  keyItems: {
    type: [String],
    defaultValue: []
  },
  machines: { // tm/hm
    type: [String],
    defaultValue: []
  }
});

Bags = new Mongo.Collection('bags');
Bags.attachSchema(Schemas.Bag);
