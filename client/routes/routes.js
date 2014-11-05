Router.configure({
  layoutTemplate: 'layout',
  notFoundTemplate: 'notFound'
});

Router.plugin('loading', { loadingTemplate: 'loading' })
Router.plugin('dataNotFound', { dataNotFoundTemplate: 'notFound' });

Router.onBeforeAction(function () {
  if (!Meteor.loggingIn() && !Meteor.user())
    this.redirect('landing');
  else
    this.next();

}, { except: ['landing'] });

Router.onBeforeAction(function () {
  if (Meteor.user()) {
    var room = Session.get('currentRoom');
    if (room)
      this.redirect('room', { _id: room });
    else 
      this.redirect('rooms');
  }
  else 
    this.next();

}, { only: ['landing'] });

Meteor.subscribe('currentUser');

Router.route('/', {
  name: 'landing'
});
Router.route('/rooms', {
  waitOn: function () {
    return Meteor.subscribe('allRooms'); // TODO: limit
  }
});
Router.route('/rooms/:_id', {
  name: 'room',
  waitOn: function () {
    // TODO: players (filtered by online), entities, etc
    return Meteor.subscribe('singleRoom', this.params._id); 
  },
  data: function () {
    Session.set('currentRoom', this.params._id);
    Meteor.call('enterRoom', this.params._id);

    return Rooms.findOne(this.params._id);
  },
  onStop: function () {
    stop(); // stop the game
    Session.set('currentRoom');
    Meteor.call('leaveRoom', this.params._id);
  }
});