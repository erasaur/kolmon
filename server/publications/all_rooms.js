Meteor.publish('allRooms', function () {
  return Rooms.find();
});