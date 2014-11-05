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

Router.route('/', {
  name: 'landing'
});
Router.route('/rooms', {
  // waitOn: function () {
  //   return Meteor.subscribe('rooms');
  // }
});
Router.route('/rooms/:_id', {
  name: 'room',
  // waitOn: function () {
  //   return Meteor.subscribe('room', this.params._id); // players (filtered by online), entities, etc
  // },
  data: function () {
    Session.set('currentRoom', this.params._id);
    return Rooms.findOne(this.params._id);
  }
});