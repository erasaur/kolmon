// methods for executing battle commands

var c = KOL.constants;
var Battles = KOL.Battles;
var Players = KOL.Players;

// TODO move this into battle model "common" interface, since client simulations
// have a use for this.
//
// return the adjusted `startTime` for a move, accounting for factors
// such as status effects, speed, etc.
var commandPriority = function getCommandPriority (command) {
  if (command.type === c.BATTLE_COMMAND_SWITCH) {
    return c.PRIORITY['switch'];
  }
  else if (command.type === c.BATTLE_COMMAND_RUN) {
    return c.PRIORITY['run'];
  }
  else if (command.type === c.BATTLE_COMMAND_ITEM) {
    return c.PRIORITY['item'];
  }
  else { // is a move
    return c.PRIORITY['moves'][command.moveId] || 0; // 0 by default
  }
};

var execMove = function execMove (player, battle, command) {
  var playerId = player._id;
  var enemyId = battle.playerIds[0];
  if (enemyId === playerId) {
    enemyId = battle.playerIds[1];
  }

  var ownPokemon = battle.pokemon[playerId];
  var enemyPokemon = battle.pokemon[enemyId];

  // var ownCurrent = Pokemon.findOne(ownPokemon[battle.active[playerId]]);
  var enemyCurrent = Pokemon.findOne(enemyPokemon[battle.active[enemyId]]);
  var move = c.MOVES[command.moveId];

  // TODO critical, super (in)effective, status effects, immunities (e.g
  // normal -> dark, levitate, etc), accuracy, pp, normal/special att/def,
  // level, environment, etc.
  enemyCurrent.stats.health = enemyCurrent.stats.health - move.power;

  if (enemyCurrent.stats.health <= 0) {
    // attempt to set next pokemon as active
    var team = Pokemon.find({ '_id': { $in: enemyPokemon } });

    // attempt to find a non-active pokemon to take over
    var nextActive = _.findIndex(team, function (p) {
      return p.id !== enemyCurrent._id && p.stats.health > 0;
    });
    var modifier = {};

    if (nextActive !== -1) { // has next pokemon
      modifier['active.' + enemyId] = nextActive;
    } else { // enemy loses
      modifier['active.' + enemyId] = -1;
      modifier['state'] = c.BATTLE_STATE_ENDING;
    }
    Battles.update(battle._id, { $set: modifier });
  } else {
    Pokemon.update(enemyId, { 
      $set: { 'stats.health': enemyCurrent.stats.health } 
    });
  }
};

var execItem = function execItem (item) {
  // TODO
};

var execSwitch = function execSwitch (switch) {
  // TODO check health of pokemon to make sure switch is valid
};

var execCommand = function execCommand (command) {
  switch (command.type) {
    case c.BATTLE_COMMAND_MOVE:
      execMove(command); break;
    case c.BATTLE_COMMAND_ITEM:
      execItem(command); break;
    case c.BATTLE_COMMAND_SWITCH:
      execSwitch(command); break;
  }
};

// for simplicity, execute both moves at once,
// processing in order of higher priority first.
var execCommands = function execCommands (player, battle) {
  var unprocessed = [];

  _.each(battle.stage, function (command) {
    if (!_.contains(move.completeIds, player._id)) {
      command.completeIds.push(player._id);
      unprocessed.push(command);
    }
  });

  // nothing to do here, so return
  if (!unprocessed.length) return;

  // arbitrarily assign to first and second
  var first = unprocessed[0];
  var second = unprocessed[1];

  if (second) { // calculate priorities to see which one is actually first
    var firstPriority = commandPriority(first);
    var secondPriority = commandPriority(second);

    if (firstPriority === secondPriority) {
      var firstIndex = battle.active[first.playerId];
      var secondIndex = battle.active[second.playerId];
      var firstPokemon = battle.pokemon[first.playerId][firstIndex];
      var secondPokemon = battle.pokemon[second.playerId][secondIndex];

      // if second pokemon has faster speed, it should go first
      if (secondPokemon.speed() > firstPokemon.speed()) {
        first = second;
      }
    }
    else if (secondPriority > firstPriority) {
      first = second;
    }
  }

  // exec in order of priority
  execCommand(first);
  execCommand(second);

  return [ first, second ];
};

Meteor.methods({
  'execCommands': function () {
    if (!this.userId) return;

    var user = Meteor.user();
    var player = Players.findOne(user.playerId);
    var battle = Battles.findOne(player.battleId);

    if (!battle || battle.state !== constants.BATTLE_STATE_EXECUTING) {
      throw new Meteor.Error('error', 'Invalid battle state');
    }

    var staged = battle.stage;
    if (staged.length !== battle.playerIds.length) {
      throw new Meteor.Error('error', 'Not all players have staged yet');
    }

    // exec staged commands and update battle doc completeIds
    var commands = execCommands(player, battle);

    // update battle doc state
    battle.state = c.BATTLE_STATE_PENDING;

    // save changes
    Battles.update(battle._id, { $set: battle });

    return commands;
  },
  'endBattle': function () {
    // TODO
    //
    // return the username of the player whose active is not -1 (the winner)
  }
});
