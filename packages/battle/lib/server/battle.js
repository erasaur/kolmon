var Pokemon = (function () {

  function Pokemon (pokemon) {
    var pokemon = _.isString(pokemon) ? Pokemon.findOne(pokemon) : pokemon;
    _.extend(this, pokemon);
    this._moves = Moves.find({ '_id': { $in: _.pluck(this.moves, 'id') } });
  }

  Pokemon.prototype = {

    constructor: Pokemon,

    // XXX miss rate, effects (confusion, burn, etc.)
    // XXX STAB, super effective, not effective, no effect
    execMove: function (moveName, target) {
      var move = _.find(this._moves, function (move, index) {
        return move.name === moveName;
      });
      var moveInfo = move && Moves.findOne(move.id);

      if (_.isUndefined(moveInfo))
        throw new Meteor.Error('invalid-move', i18n.t('invalid_move'));
      if (move.pp <= 0)
        throw new Meteor.Error('no-pp', i18n.t('no_pp'));

      var newHP = target.hp - moveInfo.power; // XXX calculate the damage

      // XXX does meteor support projections yet?
      Pokemon.update({ '_id': target._id }, {
        $set: { 'team.$.hp': newHP }
      });
      Pokemon.update({ '_id': this._id, 'moves.id': move._id }, {
        $inc: { 'moves.$.pp': -1 }
      });
    }

  };

  return Pokemon;

})();

Meteor.methods({
  initBattle: function () {
    // XXX for now, just restore all the HP/PP
  },
  execCommand: function (command) {
    command = parseCommand(command);
    check(command, {
      move: Match.Where(function (move) {
        check(move, String); // XXX make sure it's a valid command
      }),
      target: String
    });

    var user = Meteor.user();
    var opponent = user && user.game.opponent;
    if (!user || !opponent || !hasTurn(user)) return; // not our turn yet

    var team = Pokemon.find({ '_id': { $in: user.teamIds } });
    var pokemon = _.find(team, function (pokemon) {
      return pokemon.hp > 0;
    });
    if (!pokemon) endBattle(false); // lost already

    var oteam = Pokemon.find({ '_id': { $in: opponent.teamIds } });
    var target = _.find(oteam, function (target) {
      return target.name === command.target;
    });
    if (!target || target.hp <= 0)
      throw new Meteor.Error('invalid-target', i18n.t('invalid_target'));

    var pokemon = new Pokemon(pokemon);
    pokemon.execMove(command.move, target);
  },
});

