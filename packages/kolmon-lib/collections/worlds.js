var helpers = KOL.helpers;
var schemas = KOL.schemas;

schemas.World = new SimpleSchema({
  _id: {
    type: String,
    optional: true
  },
  createdAt: {
    type: Date
  },
  name: {
    type: String
  },
  userId: { // creator
    type: String
  },
  userIds: { // users currently in world
    type: [String]
  },
  slots: {
    type: Number,
    defaultValue: 30
  },
  maps: { // maps in this world
    type: [Object],
    optional: true,
    blackbox: true

    // example:
    // maps: [
    //   { id: 'asdf', north: 'asdf1', west: 'asdf2' },
    //   { id: 'wow', south: 'asdf' },
    // ]
  },
  defaultMapId: { // the 'starting' map for new players entering the world
    type: String,
    optional: true
  }
});

var Worlds = KOL.Worlds = new Mongo.Collection('worlds');
Worlds.attachSchema(schemas.World);
Worlds.deny(helpers.denyAll);
