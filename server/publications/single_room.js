Meteor.publish('singleRoom', function (roomId) {
  return [
    Meteor.users.find({ 'game.roomId': roomId, 'status.online': true }, { 
      fields: { 'game': 1 } 
    }),
    Rooms.find(roomId)
  ];
});