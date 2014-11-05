Meteor.publish('singleRoom', function (roomId) {
  return [
    Meteor.users.find({ 'game.roomId': roomId }, { 
      fields: { 'profile': 1, 'stats': 1 } 
    }),
    Rooms.find(roomId)
  ];
});