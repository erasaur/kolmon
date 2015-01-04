if (Rooms.find().count() === 0) {
  Rooms.insert({ name: 'Main Room', userIds: [], slots: 9001, map: 'map0.png' });
}
