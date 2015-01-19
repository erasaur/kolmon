Meteor.publish('currentUser', function () {
  if (!this.userId) return;

  return [
    Meteor.users.find(this.userId, { 
      fields: { 'profile': 1, 'stats': 1, 'game': 1 } 
    }),
    Challenges.find({ $or: [
      { 'sent.id': this.userId },
      { 'received.id': this.userId }
    ]})
  ];
});
