Router.configure({
  layoutTemplate: 'layout',
  notFoundTemplate: 'notFound',
  waitOn: function () {
    return Meteor.subscribe('currentUser');
  }
});

Router.plugin('loading', { loadingTemplate: 'loading' })
Router.plugin('dataNotFound', { dataNotFoundTemplate: 'notFound' });

Router.onBeforeAction(function () {
  if (!Meteor.userId())
    this.redirect('landing');
  this.next();
}, { except: ['landing'] });

Router.onBeforeAction(function () {
  if (Meteor.userId()) {
    var room = Session.get('currentRoom');
    if (room)
      this.redirect('room', { _id: room });
    else
      this.redirect('rooms');
  }
  this.next();
}, { only: ['landing'] });

Router.route('/', {
  name: 'landing'
});

Router.route('/guide');
Router.route('/rankings');
Router.route('/community');
Router.route('/shop');
Router.route('/support');

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
  onRun: function () {
    Session.set('currentRoom', this.params._id);
    this.next();
  },
  data: function () {
    return {
      room: Rooms.findOne(this.params._id),
      player: Games.findOne({ userId: this.userId })
    };
  },
  onStop: function () {
    Session.set('currentRoom');
    Meteor.call('leaveRoom', Meteor.userId(), this.params._id);
  }
});
