var constants = KOL.constants;
var Battles = KOL.Battles;
var Players = KOL.Players;
var Pokemon = KOL.Pokemon;

var stageSwitch = function stageSwitch (user, player, battle, options) {
  if (!_.contains(battle.pokemonIds, options.pokemonId)) {
    throw new Meteor.Error('error', 'Pokemon is not in battle');
  }

  var pokemon = Pokemon.findOne(options.pokemonId);
  if (pokemon.health
};

var stageMove = function stageMove (user, player, battle, options) {
  if (!(0 <= options.moveIndex && options.moveIndex < 4)) {
    throw new Meteor.Error('error', 'Invalid move selected');
  }
  if (!_.contains(battle.pokemonIds, options.pokemonId)) {
    throw new Meteor.Error('error', 'Pokemon is not in battle');
  }

  var pokemon = Pokemon.findOne(options.pokemonId);
  var index = options.moveIndex;

  if (pokemon.userId !== user._id || !pokemon.moves[index]) {
    throw new Meteor.Error('error', 'Invalid move or pokemon');
  }

  var move = {
    playerId: options.playerId,
    type: options.type,
    pokemonId: options.pokemonId,
    index: options.moveIndex,
    completeIds: []
  };

  return { $push: { 'stage': move } };
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

    var modifier;
    if (options.type === c.BATTLE_STAGE_SWITCH) {
      modifier = stageSwitch(user, player, battle, options);
    }
    else if (options.type === c.BATTLE_STAGE_ITEM) {
      modifier = stageItem(user, player, battle, options);
    }
    else if (options.type === c.BATTLE_STAGE_MOVE) {
      modifier = stageMove(user, player, battle, options);
    }

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
      modifier = { $set: { 'moves': battle.moves } };
    }
    Battles.update(battle._id, modifier);
  },
  'endBattle': function () {
    // TODO
  }
});
