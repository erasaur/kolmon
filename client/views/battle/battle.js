var constants = KOL.constants;

Template.battle.helpers({
  canvasWidth: constants.CANVAS_WIDTH,
  canvasHeight: constants.CANVAS_HEIGHT,
  enemyPokes: function() {
    return KOL.Pokemon.find({index: 167, side: "front"}); 
  },
  myPokes: function() {
    // TODO: change i to index of lead pokemon of currentUser
    var i = Math.floor(Math.random() * 100); 
    return KOL.Pokemon.find({index: i, side: "back"});
  }
});

Template.battle.onRendered(function() {
  var bgCanvas = document.getElementById("canvas-background"),
  bgContext = bgCanvas.getContext("2d");

  var background = new Image();
  background.src = "http://i.imgur.com/53aqSY5.png";

  background.onload = function(){
    bgContext.scale(0.3, 0.3);
    bgContext.drawImage(background, 0, 0);  
  };

});
