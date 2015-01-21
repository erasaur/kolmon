if (Challenges.find().count() === 0) {
  Challenges._ensureIndex({ createdAt: 1 }, { expireAfterSeconds: 300 });
}

if (Rooms.find().count() === 0) {
  Rooms.insert({
    name: 'Main Room',
    userIds: [],
    slots: 9001,
    background: {
      'map0': { x: 0, y: 0 }
    },
    foreground: {
      'roof0': { x: 112, y: 88 }
    },
    walls: [
      { x: 0, y: 0, w: 80, h: 56 },
      { x: 0, y: 57, w: 80, h: 288 },
      { x: 0, y: 305, w: 80, h: 104 },
      { x: 112, y: 120, w: 80, h: 48 }
    ],
    wild: [{
      x: 416, y: 352, w: 64, h: 64,
      pokemon: [
        { id: 1, rate: 0.3 }
      ]
    }]
  });
}
