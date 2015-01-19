Meteor.publish('singleRoom', function (roomId) {
  if (!this.userId) return this.ready();

  return [
    Meteor.users.find({ 'game.roomId': roomId, 'status.online': true }, {
      fields: { 'username': 1, 'game': 1 }
    }),
    Rooms.find(roomId),
    Challenges.find({ $or: [
      { 'sender.id': this.userId },
      { 'receiver.id': this.userId }
    ]})
  ];
});
