var constants = KOL.constants;
var Maps = KOL.Maps;
var Worlds = KOL.Worlds;
var Players = KOL.Players;

Meteor.startup(function () {
  constants.MOVES = JSON.parse(Assets.getText('moves.json'));
  constants.POKEMON = JSON.parse(Assets.getText('pokemon.json'));
  constants.TYPES = JSON.parse(Assets.getText('types.json'));

  // clear all players

  // if (Challenges.find().count() === 0) {
  //   Challenges._ensureIndex({ createdAt: 1 }, { expireAfterSeconds: 300 });
  // }

  if (Worlds.find().count() === 0) {
    var world = {
      createdAt: new Date(),
      name: 'Main World',
      userId: 'test',
      userIds: [],
      slots: 9001
    };
    var worldId = Worlds.insert(world);

    var map = {
      createdAt: new Date(),
      name: 'Some other town',
      worldId: worldId,
      startingPosition: {
        'default': { x: 240, y: 48 }
      },
      background: {
        'map0': { x: 0, y: 0 }
      },
      foreground: {
        'roof0': { x: 64, y: 49 },
        'roof0': { x: 240, y: 49 },
        'roof1': { x: 80, y: 177 }
      },
      wild: [],
      portals: [],
      walls: [
        // top left
        { x: 0, y: 0, w: 64, h: 48 },

        // left edge
        { x: 0, y: 48, w: 32, h: 224 },

        // bottom left
        { x: 0, y: 272, w: 64, h: 40 },

        // bottom edge
        { x: 64, y: 312, w: 224, h: 8 },

        // bottom right
        { x: 288, y: 272, w: 96, h: 40 },
        { x: 320, y: 280, w: 64, h: 32 },

        // right edge
        { x: 352, y: 48, w: 32, h: 192 },

        // top right
        { x: 320, y: 0, w: 64, h: 48 },

        // top edge
        { x: 224, y: 0, w: 96, h: 16 },
        { x: 64, y: 0, w: 128, h: 16 },

        // house 0
        { x: 64, y: 80, w: 80, h: 48 },
        // house 0 sign
        { x: 104, y: 112, w: 16, h: 16 },

        // house 1
        { x: 240, y: 80, w: 80, h: 48 },
        // house 1 sign
        { x: 224, y: 112, w: 16, h: 16 },

        // house 2
        { x: 80, y: 192, w: 110, h: 65 },
        // house 2 sign
        { x: 128, y: 256, w: 16, h: 16 },

        // sign 3
        { x: 272, y: 192, w: 16, h: 16 }
      ]
    };
    var mapId = Maps.insert(map);

    var map_north = {
      createdAt: new Date(),
      name: 'Some northern town',
      worldId: worldId,
      startingPosition: {
        'default': { x: 240, y: 42 }
      },
      foreground: {},
      background: {
        'map0': { x: 0, y: 0 }
      },
      wild: [],
      walls: [],
      portals: [
        { mapId: mapId, enterAt: constants.DIR_UP, x: 192, y: 0, w: 32, h: 16 }
      ]
    };
    var mapId_north = Maps.insert(map_north);

    Maps.update(mapId, { $set: {
      'portals': [{
        mapId: mapId_north, enterAt: constants.DIR_UP, x: 192, y: 0, w: 32, h: 16
      }]
    }});
    Worlds.update(worldId, {
      $set: { 'mapIds': [ mapId, mapId_north ], 'defaultMapId': mapId }
    });

    // create user & player
    var userId = Accounts.createUser({
      username: 'test',
      password: 'asdfasdf'
    });
  }
});
