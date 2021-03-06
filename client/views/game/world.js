var helpers = KOL.helpers;
var constants = KOL.constants;

var Game = KOL.Game;
var World = KOL.World;
var Worlds = KOL.Worlds;
var Players = KOL.Players;

// game -----------------------------------------------

Template.world.onCreated(function () {
  this.game = new Game();
});

Template.world.onRendered(function () {
  var params = helpers.get.currentParams();
  Meteor.call('enterWorld', params._id);

  var self = this;
  var fgCanvas = self.find('#canvas-foreground');
  var bgCanvas = self.find('#canvas-background');
  var playerCanvas = self.find('#canvas-players');
  var transitionCanvas = self.find('#canvas-transition');

  var fgContext = fgCanvas.getContext('2d');
  var bgContext = bgCanvas.getContext('2d');
  var playerContext = playerCanvas.getContext('2d');
  var transitionContext = transitionCanvas.getContext('2d');

  var user = Meteor.user();
  var params = helpers.get.currentParams();

  self.autorun(function (computation) {
    var world = Worlds.findOne(params._id);
    var player = Players.findOne({ '_id': user.playerId, 'worldId': world._id });

    if (player && world) {
      self.game.load({
        world: world,
        player: player,
        bgContext: bgContext,
        fgContext: fgContext,
        playerContext: playerContext,
        transitionContext: transitionContext
      });
      self.world = self.game.world();
      computation.stop();
    }
  });

  // fetch new documents as we change maps in game
  self.autorun(function (computation) {
    var subscription;
    var mapId = self.game.fetchMapId();

    if (_.isString(mapId)) {
      subscription = self.subscribe('singleMap', mapId);

      //TODO display loading indicator
      if (subscription.ready()) {
        self.game.fetchedMap();
      }
    }
  });
});

Template.world.helpers({
  canvasWidth: constants.CANVAS_WIDTH,
  canvasHeight: constants.CANVAS_HEIGHT,
  sidebar: function () {
    var template = Template.instance();
    var state;

    switch (template.game.state()) {
      case constants.STATE_BATTLE:
        state = 'battle'; break;
      default:
        state = 'map'; break;
    }
    return state;
  },
  world: function () {
    var template = Template.instance();
    return template.game.world();
  }
});

Template.world.onDestroyed(function () {
  this.game.stop();
  Meteor.call('leaveWorld');
});

// world ----------------------------------------------

Template.world.events({
  'click .js-challenge-send': function (event, template) {
    this.sendChallenge(this._id);
  }
});
