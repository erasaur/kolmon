Router.configure({
  layoutTemplate: 'layout',
  notFoundTemplate: 'notFound',
  waitOn: function () {
    return Meteor.subscribe('currentUser');
  }
});

Router.plugin('loading', { loadingTemplate: 'loading' });
Router.plugin('dataNotFound', { dataNotFoundTemplate: 'notFound' });

Router.onBeforeAction(function () {
  if (!Meteor.userId()) {
    this.redirect('landing');
  }
  this.next();
}, { except: ['landing'] });

Router.route('/landing', {
  name: 'landing'
});


Router.route('/', {
  name: 'worlds',
  waitOn: function () {
    return Meteor.subscribe('worldList'); // TODO: limit
  },
  data: function () {
    return { worlds: KOL.Worlds.find() };
  }
});

// Router.route('/pc', {
//   waitOn: function () {
//     return Meteor.subscribe('pokemonList');
//   },
//   data: function () {
//     var userId = Meteor.userId();
//     return { pokemon: Pokemon.find({ userId: userId }) };
//   }
// });

Router.route('/worlds/:_id', {
  name: 'world',
  waitOn: function () {
    // TODO: players (filtered by online), entities, etc
    return Meteor.subscribe('singleWorld', this.params._id);
  }
});


Router.route('/map-edit', {
  name: 'mapEditAllMaps',
  waitOn: function() {
    return Meteor.subscribe('worldList');
  },
  data: function () {
    return { worlds: KOL.Worlds.find() };
  }
})


Router.route('/map-edit/:_id', {
  name: 'mapEdit',
  waitOn: function() {
    return Meteor.subscribe('singleWorld', this.params._id);
  }
});

Router.route('/battle', {
  name: 'battle'
});
