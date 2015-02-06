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

function parseCommand (command) {
  // pikachu :tackle bulbasaur
  var command = command.trim(); // XXX clean input
  if (!command) return;

  // beginning of string or following a space (excludes :commands)
  var names = /(?:^|\s+)([a-z]+)/ig.exec(command);
  var commands = command.match(/\B:\w+/i); // asdf:asdf fails, but :asdf succeeds

  return {
    receiver: names[0], // poke being commanded
    target: names[1], // target of attack -- might be empty
    move: commands[0] // move
  };
}

Meteor.methods({
  initBattle: function () {
    // XXX for now, just restore all the HP/PP
  },
  execCommand: function (command) {
    command = parseCommand(command);
    check(command, {
      move: Match.Where(function (move) {
        check(move, String);
        // XXX make sure it's a valid command..
      }),
      target: String
    });

    var user = Meteor.user();
    var opponent = user && user.game.opponent;
    if (!user || !opponent) return;

    var pokemon = _.find(user.team, function (pokemon) {
      return pokemon.hp > 0;
    });

    if (!pokemon) endBattle(false); // lost already

    // check PP
    var move = pokemon.moves[command.move];
    var actualMove = Moves.findOne({ 'name': move.id }); // XXX naming...
    if (!move)
      throw new Meteor.Error('invalid-move', i18n.t('invalid_move'));
    else if (move.pp <= 0)
      throw new Meteor.Error('no-pp', i18n.t('no_pp'));

    // XXX miss rate, effects (confusion, burn, etc.)
    // XXX STAB, super effective, not effective, no effect
    var target = _.find(opponent.team, function (pokemon) {
      return pokemon.name === command.target;
    });
    if (!target || target.hp <= 0)
      throw new Meteor.Error('invalid-target', i18n.t('invalid_target'));

    var newHP = target.hp -= actualMove.power; // XXX calculate the damage
    // XXX does meteor support projections yet?
    Meteor.users.update({ '_id': opponent.id, 'team.name': target }, {
      $set: { 'team.$.hp': newHP }
    });
  },
});
