var Battles = KOL.Battles;
var Players = KOL.Players;

Meteor.methods({
  'endBattle': function (battleId) {
    check(battleId, String);

    var battle = Battles.findOne(battleId);
    if (!battle || battle.state !== c.BATTLE_STATE_END) {
      throw new Meteor.Error('error', 'Invalid battle state');
    }

    var loserId = _.findKey(battle.active, function (index, playerId) {
      return index === -1;
    });
    if (!loserId) {
      throw new Meteor.Error('error', 'Invalid battle state');
    }

    var modifier = {};
    modifier['active.' + loserId] = -1;
    modifier['state'] = c.BATTLE_STATE_END;

    Battles.update(battle._id, modifier);
    Players.update({ '_id': { $in: battle.playerIds } }, { $unset: { 'battleId': '' } });
  },
  'forfeitBattle': function () {
    var user = Meteor.user();
    var player = Players.findOne(user.playerId);
    var battle = Battles.findOne(player.battleId);

    if (!battle || battle.state !== c.BATTLE_STATE_PENDING) {
      throw new Meteor.Error('error', 'Invalid battle state');
    }

    var modifier = {};
    modifier['active.' + user.playerId] = -1;
    modifier['state'] = c.BATTLE_STATE_END;

    Battles.update(battle._id, modifier);
    Players.update({ '_id': { $in: battle.playerIds } }, { $unset: { 'battleId': '' } });
  }
});
