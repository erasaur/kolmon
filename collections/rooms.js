Schemas.Room = new SimpleSchema({
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
  playerId: { // creator
    type: String
  },
  playerIds: { // users currently in room
    type: [String]
  },
  slots: {
    type: Number,
    defaultValue: 30
  }
});

Rooms = new Mongo.Collection('rooms');
Rooms.attachSchema(Schemas.Room);

