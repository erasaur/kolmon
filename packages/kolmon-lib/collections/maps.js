var helpers = KOL.helpers;
var schemas = KOL.schemas;

schemas.Map = new SimpleSchema({
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
  worldId: {
    type: String
  },
  startingPosition: { // starting position for new players
    type: Object,
    blackbox: true

    // example:
    // defaultPosition: {
    //   north: { x: 123, y: 0 }, // if entering from north side
    //   west: { x: 0, y: 123 }, // if entering from west side
    //   // might not have an east or south entrance, for example
    //   default: { x: 123, y: 123 } // if not entering the map from a direction. this one's required
    // }
  },
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
    // ]
  },
  portals: {
    type: [Object],
    optional: true,
    blackbox: true

    // example:
    // portals: [
    //   { x: 240, y: 0, w: 32, h: 16 },
    // ]
  },
  wild: {
    type: [Object],
    optional: true,
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

var Maps = KOL.Maps = new Mongo.Collection('maps');
Maps.attachSchema(schemas.Map);
Maps.deny(helpers.denyAll);
