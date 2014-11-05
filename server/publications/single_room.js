Meteor.publish('singleRoom', function (roomId) {
  return [
    Meteor.users.find({ 'game.roomId': roomId, 'status.online': true }, { 
      fields: { 'profile': 1, 'stats': 1 } 
    }),
    Rooms.find(roomId)
  ];
});