var schemas = KOL.schemas;

schemas.Bag = new SimpleSchema({
  _id: {
    type: String,
    optional: true
  },
  userId: {
    type: String
  },
  money: {
    type: Number,
    min: 0,
    defaultValue: 0
  },
  items: {
    type: [Object],
    defaultValue: []

    // items: [
    //   { id: 'abc', count: 1 }
    // ]
  },
  balls: {
    type: [Object],
    defaultValue: [],

    // items: [
    //   { id: 'abc', count: 1 }
    // ]
  }
});

var Bags = KOL.Bags = new Mongo.Collection('bags');
Bags.attachSchema(schemas.Bag);
