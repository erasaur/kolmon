// methods for staging commands

var constants = KOL.constants;
var Battles = KOL.Battles;
var Players = KOL.Players;
var Bags = KOL.Bags;
var Pokemon = KOL.Pokemon;

var stageSwitch = function stageSwitch (user, player, battle, options) {
  var team = battle.pokemon[player._id];
  var pokemonId = team[options.teamIndex];
  if (!_.contains(team, options.pokemonId)) {
    throw new Meteor.Error('error', 'Invalid pokemon selected!');
  }

  var pokemon = Pokemon.findOne(pokemonId);
  if (!pokemon.stats.health) {
    throw new Meteor.Error('error', 'Pokemon has already fainted!');
  }

  return { pokemonId: options.pokemonId };
};

// var stageItem = function stageItem (user, player, battle, options) {
//   var bag = Bags.findOne(user.bagId);
//   var bagTab = ['items','balls'][options.tabIndex]; // TODO use bag model here
//   if (!bag || !bagTab) {
//     throw new Meteor.Error('error', 'Invalid bag selected!');
//   }

//   var item = bag[bagTab][options.index];
//   if (!item) {
//     throw new Meteor.Error('error', 'Invalid item selected!');
//   }

//   return { itemId: item._id };
// };

var stageItem = function stageItem (user, player, battle, options) {
  var bag = Bags.findOne(user.bagId);
  var item = _.find(bag.items, function (item) {
    return item.id === options.itemId && item.count > 0;
  });
  if (!item || !c.ITEMS[item.id]) {
    throw new Meteor.Error('error', 'Invalid item selected!');
  }

  return { itemId: item.id };
};

var stageMove = function stageMove (user, player, battle, options) {
  var fightIndex = options.fightIndex;

  if (!(0 <= fightIndex && fightIndex < 4)) {
    throw new Meteor.Error('error', 'Invalid move selected!');
  }

  var team = battle.pokemon[player._id];
  var activeIndex = battle.active[player._id];
  var current = team[activeIndex];
  if (!current) {
    throw new Meteor.Error('error', 'Invalid pokemon selected!');
  }

  var pokemon = Pokemon.findOne(current.id);
  var move = pokemon.moves[fightIndex];
  if (!move || !c.MOVES[move.id]) {
    throw new Meteor.Error('error', 'Invalid move selected!');
  }

  return { moveId: move.id };
};

Meteor.methods({
  'stageCommand': function (options) {
    if (!this.userId) return;
    check(options, Match.ObjectIncluding({
      playerId: String,
      type: Number
    }));

    var user = Meteor.user();
    var player = Players.findOne(user.playerId);
    var battle = Battles.findOne(player.battleId);

    // initial checks ---------------------------------

    if (!battle || battle.state === constants.BATTLE_STATE_EXECUTING) {
      throw new Meteor.Error('error', 'Already executing staged commands');
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
    // if other players have already staged moves, set state to executing
    if (battle.stage.length === battle.playerIds.length - 1) {
      modifier.$set = { 'state': constants.BATTLE_STATE_EXECUTING };
    }

    Battles.update(battle._id, modifier);
  }
});
