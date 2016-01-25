var c = KOL.constants;
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
  },
  'exitBattle': function () {
    var user = Meteor.user();
    var player = Players.findOne(user.playerId);
    var battle = Battles.findOne(player.battleId);

    if (!battle || battle.state !== c.BATTLE_STATE_END) {
      throw new Meteor.Error('error', 'Invalid battle state');
    }

    if (!_.contains(battle.playerIds, player._id)) {
      throw new Meteor.Error('error', 'Already left battle');
    }

    // if both players have already left, remove battle doc
    if (battle.playerIds.length <= 1) {
      Battles.remove(battle._id);
    } else {
      Battles.update(battle._id, { 
        $pull: { 'playerIds': player._id }
      });
    }

    Players.update(player._id, {
      $unset: { 'battleId': '' }
    });
  }
});
