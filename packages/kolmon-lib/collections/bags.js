var schemas = KOL.schemas;

schemas.Bag = new SimpleSchema({
  _id: {
    type: String,
    optional: true
  },
  userId: {
    type: String
  },
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

var Bags = KOL.Bags = new Mongo.Collection('bags');
Bags.attachSchema(schemas.Bag);
