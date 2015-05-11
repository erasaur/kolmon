var helpers = KOL.helpers;
var constants = KOL.constants;

var Game = KOL.Game;
var Worlds = KOL.Worlds;
var Players = KOL.Players;

// world ---------------------------------------------

Template.world.onRendered(function () {
  var params = helpers.get.currentParams();
  Meteor.call('enterWorld', params._id);
});

Template.world.onDestroyed(function () {
  Meteor.call('leaveWorld');
});

// map -----------------------------------------------

Template.map.onCreated(function () {
  this.game = new Game();
});

Template.map.onRendered(function () {
  var self = this;
  var fgCanvas = this.find('#canvas-foreground');
  var bgCanvas = this.find('#canvas-background');
  var playerCanvas = this.find('#canvas-players');

  var fgContext = fgCanvas.getContext('2d');
  var bgContext = bgCanvas.getContext('2d');
  var playerContext = playerCanvas.getContext('2d');

  var userId = Meteor.userId();
  var params = helpers.get.currentParams();

  this.autorun(function (computation) {
    var world = Worlds.findOne(params._id);
    var player = Players.findOne({ userId: userId });

    if (player && world) {
      var map = {
        bgContext: bgContext,
        fgContext: fgContext,
        playerContext: playerContext,
        background: world.background,
        foreground: world.foreground,
        walls: world.walls
      };

      self.game.load({ worldId: world._id, map: map, player: player });
      computation.stop();
    }
  });
});

Template.map.helpers({
  canvasWidth: constants.CANVAS_WIDTH,
  canvasHeight: constants.CANVAS_HEIGHT,
  nearbyPlayers: function () {
    var template = Template.instance();
    return template.game.nearbyPlayers();
  }
});

Template.map.onDestroyed(function () {
  this.game.stop();
});
