if (Rooms.find().count() === 0) {
  Rooms.insert({
    name: 'Main Room',
    userIds: [],
    slots: 9001,
    background: [
      { src: 'map0.png', x: 0, y: 0 }
    ],
    foreground: [
      { src: 'roof0.png', x: 112, y: 88 }
    ],
    walls: [
      { x: 0, y: 0, w: 80, h: 56 },
      { x: 0, y: 57, w: 80, h: 288 },
      { x: 0, y: 305, w: 80, h: 104 },
      { x: 112, y: 120, w: 80, h: 48 }
    ]
  });
}
