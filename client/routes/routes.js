Router.configure({
  layoutTemplate: 'layout',
  notFoundTemplate: 'notFound'
});

Router.plugin('loading', { loadingTemplate: 'loading' })
Router.plugin('dataNotFound', { dataNotFoundTemplate: 'notFound' });

Router.onBeforeAction(function () {
  if (!Meteor.loggingIn() && !Meteor.user())
    this.render('home');

}, {except: ['home']});

Router.onBeforeAction(function () {
  if (Meteor.user()) {
    if (!!Session.get('currentRoom'))
      this.render('game');
    else 
      this.render('rooms');
  }

}, {only: ['home']});

Router.route('/', {
  name: 'home'
});
Router.route('/rooms', {
  // waitOn: function () {
  //   return Meteor.subscribe('rooms');
  // }
});
Router.route('/rooms/:_id', {
  name: 'game',
  // waitOn: function () {
  //   return Meteor.subscribe('room', this.params._id); // players (filtered by online), entities, etc
  // },
  data: function () {
    Session.set('currentRoom', this.params._id);
    //return Rooms.findOne(this.params._id);
  }
});