function calcReward (turns) {
  var base = [ 1000, 200 ]; // [ win, lose ]
  var limit = Math.floor(Math.sqrt(base[0]/base[1]));
  var offset = Math.min(Math.max(Math.log(turns), 1), limit);

  // winner gets more for fewer turns, and loser
  // gets less with fewer turns (but, still gets some!)
  return [ base[0]/offset, base[1]*offset ];
}

function endBattle (turns, won) {
  var user = Meteor.user();
  var opponent = user && user.game.opponent;

  var money = calcReward(turns);

  Meteor.users.update(user._id, { 
    $set: { 'game.inBattle': false, 'game.opponent': null },
    $inc: { 'stats.battleCount': 1, 'stats.pokedollars': won ? money[0] : money[1] }
  });
  Meteor.users.update(opponent._id, {
    $set: { 'game.inBattle': false, 'game.opponent': null },
    $inc: { 'stats.battleCount': 1, 'stats.pokedollars': won ? money[1] : money[0] }
  });
}

Meteor.methods({
  initBattle: function () {
    // XXX for now, just restore all the HP/PP
  },
  execCommand: function (command) {
    check(command, String); // XXX make sure it's a valid command..

    var user = Meteor.user();
    var opponent = user && user.game.opponent;
    if (!user || !opponent) return;

    // command: 
    var 
    var target 

    var pokemon = _.find(user.pokemon, function (pokemon) {
      return pokemon.hp > 0;
    });

    if (!pokemon) endBattle(false);

    // XXX miss rate, effects (confusion, burn, etc.)

    

    if (user.team
  },
});
