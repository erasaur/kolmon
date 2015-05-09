var helpers = KOL.helpers;
var constants = KOL.constants;
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

  // XXX eventually we should move these to
  // a separate map schema, if we want to have
  // multiple maps per world
  background: {
    type: Object,
    blackbox: true

    // example (keys are image filenames, values are coordinates):
    // background: {
    //   'map0': { x: 0, y: 0 },
    // }
  },
  foreground: {
    type: Object,
    blackbox: true

    // example:
    // foreground: {
    //   'roof0': { x: 112, y: 88 },
    //   'roof1': { x: 252, y: 88 },
    // }
  },
  walls: {
    type: [Object],
    blackbox: true

    // example:
    // walls: [
    //   { x: 0, y: 0, w: 80, h: 56 },
    //   { x: 0, y: 57, w: 80, h: 288 },
    //   { x: 0, y: 305, w: 80, h: 104 },
    //   { x: 112, y: 120, w: 80, h: 48 }
    // ],
  },
  wild: {
    type: [Object],
    blackbox: true

    // example:
    // wild: [{
    //   x: 416, y: 352, w: 64, h: 64, // coordinates of wild area
    //   pokemon: [                    // array of potential encounters
    //     { id: 1, rate: 0.3 }
    //   ]
    // }]
  }
});

var Worlds = KOL.Worlds = new Mongo.Collection('worlds');
Worlds.attachSchema(schemas.World);
Worlds.deny(helpers.denyAll);

// World.prototype.enterNextMap = function (direction) {
//   // if no map in that direction, don't do anything
//   // if there is a map in that direction, check if there is a wall
//   // if no wall, set position of player to left edge
// };
