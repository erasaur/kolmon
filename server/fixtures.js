if (Rooms.find().count() === 0) {
  Rooms.insert({
    name: 'Main Room',
    userIds: [],
    slots: 9001,
    map: 'map0.png',
    walls: [
      { x: 0, y: 0, w: 80, h: 56 },
      { x: 0, y: 57, w: 80, h: 288 },
      { x: 0, y: 305, w: 80, h: 104 }
    ]
  });
}
