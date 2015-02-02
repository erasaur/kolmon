Template.battle.created = function () {
  this.battle = new Battle(this);
};

Template.battle.destroyed = function () {
  this.battle && this.battle.destroy();
  this.battle = null;
};

Template.battle.helpers({
  myTurn: function () {
    var instance = Template.instance();
    var battle = instance.battle;
    var user = Meteor.user();
    return battle.myTurn(user);
});

Template.battle.events({
  'submit #command': function (event, template) {
    template.battle.execCommand(event.target.text);
  },
  'click #forfeit': function (event, template) {
    template.battle.forfeit();
  }
});

Battle = function (template) {
  this.template = template;
  this.turns = 0;
  this.opponent = template.data.opponent;
};

Battle.prototype = {
  constructor: Battle,

  hasTurn: function (user) {
    return user && user.game && user.game.myTurn;
  },

  execCommand: function (command) {
    this.turns++;
    if (this.hasTurn(Meteor.user())) {
      Meteor.call('execCommand', command); // turn over
    }
  },

  forfeit: function () {
    Meteor.call('forfeit');
  },
  
  destroy: function () {
    // XXX
  }
};
