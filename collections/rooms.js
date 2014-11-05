Rooms = new Mongo.Collection('rooms');

Meteor.methods({
  addUser: function (roomId, userId) {
    Rooms.update(roomId, { $addToSet: { 'userIds': userId } });
  },
  removeUser: function (roomId, userId) {
    Rooms.update(roomId, { $pull: { 'userIds': userId } });
  }
});