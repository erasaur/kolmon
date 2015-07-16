var helpers = KOL.helpers;
var constants = KOL.constants;

var World = KOL.World;
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
  this.world = new World();
});

Template.map.onRendered(function () {
  var self = this;
  var fgCanvas = self.find('#canvas-foreground');
  var bgCanvas = self.find('#canvas-background');
  var playerCanvas = self.find('#canvas-players');

  var fgContext = fgCanvas.getContext('2d');
  var bgContext = bgCanvas.getContext('2d');
  var playerContext = playerCanvas.getContext('2d');

  var userId = Meteor.userId();
  var params = helpers.get.currentParams();

  self.autorun(function (computation) {
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

      self.world.load({ worldId: world._id, map: map, player: player });
      self.player = self.world.player();
      computation.stop();
    }
  });
});

Template.map.helpers({
  canvasWidth: constants.CANVAS_WIDTH,
  canvasHeight: constants.CANVAS_HEIGHT,
  nearbyPlayers: function () {
    var template = Template.instance();
    return template.world.nearbyPlayers();
  },
  challenging: function () {
    var template = Template.instance();
    return template.player && template.player.challenging();
  }
});

Template.map.events({
  'click .js-challenge-send': function (event, template) {
    template.player.sendChallenge(this._id);
  }
});

Template.map.onDestroyed(function () {
  this.world.stop();
});
