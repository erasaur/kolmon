if (Rooms.find().count() === 0) {
  Rooms.insert({name: 'Main Room', playerCount: 0});
}