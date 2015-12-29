Template.battle.helpers({
  enemyPokes: function() {
    return KOL.Pokemon.find({index: 877, side: "front"}); 
  },
  myPokes: function() {
    // TODO: change i to index of lead pokemon of currentUser
    var i = Math.floor(Math.random() * 100); 
    return KOL.Pokemon.find({index: i, side: "back"});
  }
});
