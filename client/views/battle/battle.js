Template.battle.helpers({
  enemyPokes: function() {
    return KOL.Pokemon.find({index: 877}); 
  },
  myPokes: function() {
    var i = Math.floor(Math.random() * 1290);
    return KOL.Pokemon.find({index: i});

  }
});
