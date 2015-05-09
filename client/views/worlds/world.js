var helpers = KOL.helpers;
var constants = KOL.constants;

var Map = KOL.Map;
var Game = KOL.Game;
var Player = KOL.Player;

var Players = KOL.Players;

// world ---------------------------------------------

Template.world.onRendered(function () {
  var controller = helpers.get.currentController();
  Meteor.call('enterWorld', controller.state.get('currentWorld'));
});

Template.world.onDestroyed(function () {
  this.game.stop();
  Meteor.call('leaveWorld');
});

// map -----------------------------------------------

Template.map.onCreated(function () {
  this.game = new Game();
});

Template.map.onRendered(function () {
  var data = this.data;
  var fgCanvas = this.find('#canvas-foreground');
  var bgCanvas = this.find('#canvas-background');
  var playerCanvas = this.find('#canvas-players');

  var fgContext = fgCanvas.getContext('2d');
  var bgContext = bgCanvas.getContext('2d');
  var playerContext = playerCanvas.getContext('2d');

  // init map
  var mapOptions = {
    bgContext: bgContext,
    fgContext: fgContext,
    playerContext: playerContext,
    background: data.world.background,
    foreground: data.world.foreground,
    walls: data.world.walls
  };

  // init player
  var playerOptions = {
    id: data.player._id,
    username: data.player.username,
    context: playerContext
  };

  this.game.load({
    worldId: data.world._id,
    map: new Map(mapOptions, function () { this.renderBg().renderFg(); }),
    player: new Player(playerOptions)
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
  this.game.stop('main');
});
