var constants = KOL.constants;
var Battles = KOL.Battles;
var Players = KOL.Players;
var Pokemon = KOL.Pokemon;

Meteor.methods({
  'stageMove': function (options) {
    if (!this.userId) return;
    check(options, { pokemonId: String, index: Number });
    check(options.index, Match.Where(function (index) {
      return 0 <= index && index < 4;
    }));

    var user = Meteor.user();
    var player = Players.findOne(user.playerId);
    var battle = Battles.findOne(player.battleId);

    if (!battle || battle.state === constants.BATTLE_STATE_EXECUTING) {
      throw new Meteor.Error('error', 'Battle is already executing moves');
    }

    if (!_.contains(battle.pokemonIds, options.pokemonId)) {
      throw new Meteor.Error('error', 'Pokemon is not in battle');
    }

    var pokemon = Pokemon.findOne(options.pokemonId);
    if (pokemon.userId !== user._id || !pokemon.moves[index]) {
      throw new Meteor.Error('error', 'Invalid move or pokemon');
    }

    var alreadyStaged = _.find(battle.moves, function (move) {
      return move.playerId === player._id;
    });
    if (alreadyStaged) {
      throw new Meteor.Error('error', 'Player has already staged a move');
    }

    var move = {
      playerId: player._id,
      pokemonId: options.pokemonId,
      index: options.index,
      completeIds: []
    };
    var modifier = { $push: { 'moves': move } };

    // if other player has already staged a move, set state to executing
    if (battle.moves.count === 1) {
      modifier.$set = { 'state': constants.BATTLE_STATE_EXECUTING };
    }

    Battles.update(battle._id, modifier);
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
  }
});
