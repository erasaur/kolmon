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

var execMove = function execMove (battle, command) {
  if (battle.state === c.BATTLE_STATE_END) return battle;

  var playerAId = command.playerId;
  var playerBId = battle.playerIds[0];
  if (playerBId === playerAId) {
    playerBId = battle.playerIds[1];
  }

  var playerAPokemon = battle.pokemon[playerAId];
  var playerBPokemon = battle.pokemon[playerBId];

  // var playerACurrent = Pokemon.findOne(playerAPokemon[battle.active[playerAId]]);
  var playerBCurrent = Pokemon.findOne(playerBPokemon[battle.active[playerBId]]);
  var move = c.MOVES[command.moveId];

  // TODO critical, super (in)effective, status effects, immunities (e.g
  // normal -> dark, levitate, etc), accuracy, pp, normal/special att/def,
  // level, environment, etc.
  playerBCurrent.stats.health = Math.max(0, playerBCurrent.stats.health - move.power);

  if (playerBCurrent.stats.health <= 0) {
    // attempt to set next pokemon as active
    var team = Pokemon.find({ '_id': { $in: playerBPokemon } });

    // attempt to find a non-active pokemon to take over
    var nextActive = _.findIndex(team, function (p) {
      return p.id !== playerBCurrent._id && p.stats.health > 0;
    });

    battle.active[playerBId] = nextActive;
    battle.state = c.BATTLE_STATE_END;
  }

  Pokemon.update(playerBCurrent._id, {
    $set: { 'stats.health': playerBCurrent.stats.health }
  });

  return battle;
};

var execItem = function execItem (command, battle) {
  // TODO
  var item = c.ITEMS[command.itemId];

};

var execSwitch = function execSwitch (command, battle) {
  // TODO check health of pokemon to make sure switch is valid
};

var execCommand = function execCommand (command, battle) {
  switch (command.type) {
    case c.BATTLE_COMMAND_MOVE:
      execMove(command, battle); break;
    case c.BATTLE_COMMAND_ITEM:
      execItem(command, battle); break;
    case c.BATTLE_COMMAND_SWITCH:
      execSwitch(command, battle); break;
  }
};

// for simplicity, execute both moves at once,
// processing in order of higher priority first.
var execCommands = function execCommands (battle) {
  var unprocessed = _.filter(battle.stage, function (command) {
    return !command.completeIds.length;
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
  battle = execCommand(first, battle);
  battle = execCommand(second, battle);
  battle.stage = [ first, second ];

  return battle;
};

Meteor.methods({
  'execCommands': function (battleId) {
    check(battleId, String);
    if (!this.userId) return;

    var user = Meteor.user();
    var battle = Battles.findOne(battleId);

    if (!battle || battle.state !== c.BATTLE_STATE_EXECUTING) {
      throw new Meteor.Error('error', 'Invalid battle state');
    }

    var staged = battle.stage;
    if (staged.length !== battle.playerIds.length) {
      throw new Meteor.Error('error', 'Not all players have staged yet');
    }

    // by default, state should be pending after commands have been
    // executed, except when one player loses (in which case, state
    // becomes c.BATTLE_STATE_END)
    battle.state = c.BATTLE_STATE_PENDING;

    // exec staged commands, update battle doc:
    // - update completeIds
    // - update battle state (e.g if one player loses)
    // - update battle stage
    battle = execCommands(battle);
    Battles.update(battle._id, { $set: battle });

    if (battle.state === c.BATTLE_STATE_END) {
      Meteor.call('endBattle', battleId);
    }
  },
  'endExec': function () {
    if (!this.userId) return;

    var user = Meteor.user();
    var player = Players.findOne(user.playerId);
    var battle = Battles.findOne(player.battleId);

    if (!battle || battle.state !== c.BATTLE_STATE_EXECUTING) {
      throw new Meteor.Error('error', 'Invalid battle state');
    }

    // check whether both players have completed executing
    var isComplete = true;
    _.each(battle.stage, function (command) {
      if (!_.contains(command.completeIds, player._id)) {
        command.completeIds.push(player._id);
      }
      if (command.completeIds.length !== battle.playerIds.length) {
        isComplete = false;
      }
    });

    var modifier = {};
    if (isComplete) {
      // both players complete, unset stage
      modifier['$unset'] = { 'stage': '' };
    } else {
      modifier['$set'] = { 'stage': battle.stage };
    }
    Battles.update(battle._id, modifier);
  }
});
