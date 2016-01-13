var constants = KOL.constants;
var Battles = KOL.Battles;
var Players = KOL.Players;
var Pokemon = KOL.Pokemon;

var stageSwitch = function stageSwitch (user, player, battle, options) {
  if (!_.contains(user.pokemonIds, options.pokemonId)) {
    throw new Meteor.Error('error', 'Invalid pokemon selected!');
  }

  var pokemon = Pokemon.findOne(options.pokemonId);
  if (!pokemon.stats.health) {
    throw new Meteor.Error('error', 'Pokemon has already fainted!');
  }

  return { pokemonId: options.pokemonId };
};

var stageItem = function stageItem (user, player, battle, options) {
  var bag = Bags.findOne(user.bagId);
  var item = _.find(bag.items, function (item) {
    return item.id === options.itemId && item.count > 0;
  });
  if (!item) {
    throw new Meteor.Error('error', 'Invalid item selected!');
  }

  return { itemId: options.itemId };
};

var stageMove = function stageMove (user, player, battle, options) {
  var moveIndex = options.moveIndex;
  var pokemonId = options.pokemonId;

  if (!(0 <= moveIndex && moveIndex < 4)) {
    throw new Meteor.Error('error', 'Invalid move selected!');
  }

  var team = battle.pokemon[player._id];
  var current = _.find(team, function (p) { return p.active; });
  if (!current ||
      current.id !== pokemonId ||
      !_.contains(user.pokemonIds, pokemonId)) {
    throw new Meteor.Error('error', 'Invalid pokemon selected!');
  }

  var pokemon = Pokemon.findOne(pokemonId);
  var index = options.moveIndex;

  if (!pokemon.moves[index]) {
    throw new Meteor.Error('error', 'Invalid move selected!');
  }

  return {
    pokemonId: options.pokemonId,
    moveId: pokemon.moves[index].id
  };
};

Meteor.methods({
  'stageCommand': function (options) {
    if (!this.userId) return;
    check(options, Match.ObjectIncluding({
      playerId: String,
      pokemonId: String,
      type: Number
    }));

    var user = Meteor.user();
    var player = Players.findOne(user.playerId);
    var battle = Battles.findOne(player.battleId);

    // initial checks ---------------------------------

    if (!battle || battle.state === constants.BATTLE_STATE_EXECUTING) {
      throw new Meteor.Error('error', 'Battle is already executing staged commands');
    }

    var alreadyStaged = _.find(battle.stage, function (command) {
      return command.playerId === player._id;
    });
    if (alreadyStaged) {
      throw new Meteor.Error('error', 'Player has already staged a command');
    }

    // stage the command ------------------------------

    var command;
    if (options.type === c.BATTLE_COMMAND_SWITCH) {
      command = stageSwitch(user, player, battle, options);
    }
    else if (options.type === c.BATTLE_COMMAND_ITEM) {
      command = stageItem(user, player, battle, options);
    }
    else if (options.type === c.BATTLE_COMMAND_MOVE) {
      command = stageMove(user, player, battle, options);
    }

    _.defaults(command, {
      playerId: player._id,
      type: options.type,
      completeIds: []
    });

    var modifier = { $push: { 'stage': command } };
    // if other player has already staged a move, set state to executing
    if (battle.stage.length) {
      modifier.$set = { 'state': constants.BATTLE_STATE_EXECUTING };
    }

    Battles.update(battle._id, modifier);
  },
  'switchPokemon': function (options) {
    check(options, {
      playerId: String,
      index: Number
    });
    // TODO check health of pokemon to make sure switch is valid
    // return appropriate error otherwise
  },
  'moveComplete': function (playerId) {
    if (!this.userId) return;
    check(playerId, String);

    var user = Meteor.user();
    var player = Players.findOne(user.playerId);
    var battle = Battles.findOne(player.battleId);

    if (!battle || battle.state !== constants.BATTLE_STATE_EXECUTING) {
      throw new Meteor.Error('error', 'Battle not currently executing moves');
    }

    _.each(battle.moves, function (move) {
      if (move.playerId === playerId) {
        // acknowledge that we have executed playerId's move locally
        move.completeIds.push(playerId);
      }
    });

    var moves = battle.moves;
    var movesComplete = _.every(function (moves) {
      return _.difference(moves.completeIds, battle.playerIds).length === 0;
    });

    var modifier;
    if (movesComplete) {
      modifier = {
        $set: { 'state': constants.BATTLE_STATE_PENDING, 'moves': [] }
      };
    } else {
      modifier = {
        $set: { 'moves': battle.moves }
      };
    }
    Battles.update(battle._id, modifier);
  },
  'endBattle': function () {
    // TODO
  }
});
