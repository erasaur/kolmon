var c = KOL.constants;
var Pokemon = KOL.Pokemon;
var BattleRenderer = KOL.BattleRenderer;

KOL.Battle = (function () {
  function Battle (options) {
    if (!this instanceof Battle) {
      return new Battle(options);
    }

    this._ownDep = new Tracker.Dependency();
    this._enemyDep = new Tracker.Dependency();
    if (options) this.load(options);
  }

  Battle.prototype.load = function loadBattle (options) {
    this._renderers = options.renderers;
    this._battleRenderer = new BattleRenderer({
      renderers: this._renderers
    });
    this._game = options.game;
  };

  Battle.prototype.init = function initBattle (options) {
    // reset current computations
    this._computations = {};

    // use local collection to store output
    this._outputCollection = new Mongo.Collection('battle-output');

    this._battle = options.battle;
    this._player = options.player;
    this._enemy = options.enemy;

    // setup bag --------------------------------------

    this._bag = new Bag(options.bag);

    // setup pokemon ----------------------------------
    
    var battle = this._battle;
    var pokemon = battle.pokemon;
    // TODO store pokemon in object with pokemonId's as keys rather
    // than storing an array of pokemon objects
    this._ownPokemon = _.map(pokemon[this._player._id], function (id) {
      return new Pokemon(id);
    });
    this._enemyPokemon = _.map(pokemon[this._enemy._id], function (id) {
      return new Pokemon(id);
    });
    this._pokemon = _.union(this._ownPokemon, this._enemyPokemon);

    this._ownCurrent = this._ownPokemon[battle.active[this._player._id]];
    this._enemyCurrent = this._enemyPokemon[battle.active[this._enemy._id]];

    this._ownDep.changed();
    this._enemyDep.changed();

    // rendering config -------------------------------
    
    this._cursor = { // keep track of cursor state
      main: {
        index: 0,
        length: 4 // fight, bag, team, run
      },
      fight: {
        index: 0,
        length: 4 // 4 possible moves
      },
      team: {
        index: 0, // current index within the list of pokemon
        length: c.MAX_TEAM_SIZE
      },
      bagTab: { // current tab within the bag
        index: 0,
        length: c.MAX_BAG_TABS
      },
      bag: {
        index: 0 // current index within the tab
      },
      prompt: {
        index: 0,
        length: 0
      }
    };
    this._view = c.BATTLE_VIEW_MAIN;
    this._state = c.BATTLE_STATE_PENDING; // allow inputs
    this._prompt; // temporarily store prompt options and their callbacks

    // initial render
    this.render();
  };

  Battle.prototype.render = function renderBattle () {
    switch (this._view) {
      case c.BATTLE_VIEW_MAIN:
        this._battleRenderer.renderMain(this._cursor.main); 
        break;
      case c.BATTLE_VIEW_BAG:
        this._battleRenderer.renderBag(this._cursor.bagTab, this._cursor.bag); 
        break;
      case c.BATTLE_VIEW_TEAM:
        this._battleRenderer.renderTeam(this._cursor.team); 
        break;
      case c.BATTLE_VIEW_POKEMON:
        var pokemon = this._ownPokemon[this._cursor.team.index];
        this._battleRenderer.renderPokemonInfo(pokemon);
        break;
      case c.BATTLE_VIEW_ITEM:
        var item = this._bag.getItem(this._cursor.bag.index);
        this._battleRenderer.renderItemInfo(item);
        break;
    }
  };

  Battle.prototype.renderCommand = function renderCommand (command, cb) {
    switch (command.type) {
      case c.BATTLE_COMMAND_MOVE:
        this._battleRenderer.renderMove(command, cb); break;
      case c.BATTLE_COMMAND_ITEM:
        this._battleRenderer.renderItem(command, cb); break;
      case c.BATTLE_COMMAND_SWITCH:
        this._battleRenderer.renderSwitch(command, cb); break;
    }
    this.fetchPokemon(command.playerId); // fetch updates for specific player

    // render battle text
    var message = this.commandMessage(command);
    this._battleRenderer.renderText(message);
  };

  // getters ------------------------------------------

  Battle.prototype.enemyCurrent = function getEnemyCurrent () {
    this._enemyDep.depend();
    return this._enemyCurrent;
  };

  Battle.prototype.enemyPokemon = function getEnemyPokemon () {
    this._enemyDep.depend();
    return this._enemyPokemon;
  };

  Battle.prototype.ownCurrent = function getOwnCurrent () {
    this._ownDep.depend();
    return this._ownCurrent;
  };

  Battle.prototype.ownPokemon = function getOwnPokemon () {
    this._ownDep.depend();
    return this._ownPokemon;
  };

  Battle.prototype.outputList = function getOutputList () {
    return this._outputCollection.find();
  };

  // events -------------------------------------------

  Battle.prototype.output = function output (options) {
    //TODO output to panel with different colored text depending on type
    this._outputCollection.insert({ 
      createdAt: Date.now(),
      createdBy: options.player,
      type: options.type,
      message: options.message
    });
  };

  Battle.prototype.switchView = function switchView (view) {
    this._view = view;
    this.render(); // re-render view
  };

  Battle.prototype.moveCursor = function moveCursor (key, cursor) {
    switch (key) {
      case c.KEY_UP:
        cursor.index--;
      case c.KEY_DOWN:
        cursor.index++;
    }
    // only process left and right key if we're in a fixed-length menu
    // in which case, right and left keys jump half the length
    if (cursor.length) { 
      switch (key) {
        case c.KEY_LEFT:
          cursor.index -= Math.floor(cursor.length / 2);
        case c.KEY_RIGHT:
          cursor.index += Math.floor(cursor.length / 2);
      }
      cursor.index = Math.min(cursor.index, cursor.length - 1);
    }
    // return new cursor index bounded by [0, length)
    return Math.max(cursor.index, 0);
  };

  Battle.prototype.prompt = function prompt (options) {
    this._cursor.prompt.index = 0; // reset prompt index
    this._battleRenderer.renderPrompt(_.keys(options, 'text'));
    this._prompt = options;
  };

  Battle.prototype.keydownMain = function onBattleKeydownMain (key) {
    if (key === c.KEY_ENTER) {
      // render the appropriate view based on cursor
      switch (this._cursor.main) {
        case 0: // fight
          this.switchView(c.BATTLE_VIEW_FIGHT); break;
        case 1: // team
          this.switchView(c.BATTLE_VIEW_TEAM); break;
        case 2: // bag
          this.switchView(c.BATTLE_VIEW_BAG); break;
        case 3: // run
          this.execRun(); break;
      }
    } else {
      this.moveCursor(key, this._cursor.main);
    }
  };

  Battle.prototype.keydownFight = function onBattleKeydownFight (key) {
    if (key === c.KEY_ENTER) {
      this.stageMove();
    } else if (key === c.KEY_ESCAPE) { // analogous to "b" button
      this.switchView(c.BATTLE_VIEW_MAIN);
    } else {
      this.moveCursor(key, this._cursor.fight);
    }
  };

  Battle.prototype.keydownTeam = function onBattleKeydownTeam (key) {
    if (key === c.KEY_ENTER) {
      var self = this;
      self.prompt({
        options: [{ 
          text: 'INFO', callback: function () {
            self.switchView(c.BATTLE_VIEW_POKEMON);
          }
        }, {
          text: 'SWITCH', callback: function () { // switch selected poke in
            self.stageSwitch();
            self.render(); // re-render view to exit prompt
          }
        }, { 
          text: 'CANCEL', callback: function () {
            self.render(); // re-render view to exit prompt
          }
        }]
      });
    } else if (key === c.KEY_ESCAPE) { // analogous to "b" button
      this.switchView(c.BATTLE_VIEW_MAIN);
    }
  };

  Battle.prototype.keydownBag = function onBattleKeydownBag (key) {
    if (key === c.KEY_ENTER) {
      var self = this;
      self.prompt({
        options: [{ 
          text: 'INFO', callback: function () {
            self.switchView(c.BATTLE_VIEW_ITEM);
          }
        }, { 
          text: 'USE', callback: function () {
            self.stageItem();
          }
        }, {
          text: 'CANCEL', callback: function () {
            self.render(); // re-render view to exit prompt
          }
        }]
      });
    }
    else if (key === c.KEY_ESCAPE) { // analogous to "b" button
      this.switchView(c.BATTLE_VIEW_MAIN);
    }
    // move up and down within the current tab
    else if (_.contains([c.KEY_UP, c.KEY_DOWN], key)) {
      this.moveCursor(key, this._cursor.bag);
    } 
    // move to left and right tabs
    else if (_.contains([c.KEY_LEFT, c.KEY_RIGHT], key)){
      this._bag.switchTab(this._cursor.bagTab.index);
      this.moveCursor(key, this._cursor.bagTab);
    }
  };

  Battle.prototype.keydownPrompt = function onBattleKeydownPrompt (event) {
    if (key === c.KEY_ENTER || key === c.KEY_ESCAPE) {
      // run callback for prompt
      this._prompt[this._cursor.prompt.index].callback();
      this._prompt = null;
    } else if (_.contains([c.KEY_UP, c.KEY_DOWN], key)) {
      this.moveCursor(key, this._cursor.prompt); 
    }
  };

  Battle.prototype.keydown = function onBattleKeydown (event) {
    var key = event.keyCode || event.which;

    // disable inputs if battle state not pending
    if (this._state !== c.BATTLE_STATE_PENDING) return;

    // if game ended, any key returns the user to map
    else if (this._state === c.BATTLE_STATE_END) {
      this._game.endBattle();
    }

    // if viewing a prompt, handle prompt first
    else if (this._prompt) {
      this.keydownPrompt(key);
    }

    // otherwise process keydown as usual
    else {
      switch (this._view) {
        case c.BATTLE_VIEW_MAIN:
          this.keydownMain(key); break;
        case c.BATTLE_VIEW_FIGHT:
          this.keydownFight(key); break;
        case c.BATTLE_VIEW_TEAM:
          this.keydownTeam(key); break;
        case c.BATTLE_VIEW_BAG:
          this.keydownBag(key); break;
      }
    }
  };

  // commands -----------------------------------------

  // stage a move
  Battle.prototype.stageMove = function stageMove () {
    this.stageCommand({
      type: c.BATTLE_COMMAND_MOVE,
      fightIndex: this._cursor.fight.index
    });
  };

  // stage a switch
  Battle.prototype.stageSwitch = function stageSwitch () {
    this.stageCommand({
      type: c.BATTLE_COMMAND_SWITCH,
      teamIndex: this._cursor.team.index
    });
  };

  // stage a item
  Battle.prototype.stageItem = function stageItem () {
    this.stageCommand({
      type: c.BATTLE_COMMAND_ITEM,
      itemId: this._bag.getItem(this._cursor.bag.index)
    });
  };

  // stage a command to be executed once both players have staged a move.
  // allows us to calculate pokemon/move speeds to determine which goes first.
  Battle.prototype.stageCommand = function stageCommand (options) {
    if (this._state === c.BATTLE_STATE_PENDING) {
      this._state = c.BATTLE_STATE_STAGING;
      // type, pokemonId (if switching), fightIndex 
      // (if using a move), itemId (if using an item)
      Meteor.call('stageCommand', options);
    }
  };

  Battle.prototype.commandMessage = function getCommandMessage (command) {
    var isOwn = command.playerId === this._player._id;
    var message;

    switch (command.type) {
      case c.BATTLE_COMMAND_MOVE: // need to get pokemon name and move name
        var pokemon = isOwn ? this._enemyCurrent : this._ownCurrent;
        var move = c.MOVES[command.moveId];
        message = pokemon.name() + ' used ' + move.name + '!';
        break;
      case c.BATTLE_COMMAND_ITEM: // just need to get item name
        var player = isOwn ? this._player : this._enemy;
        var item = c.ITEMS[command.itemId];
        message = player.username + ' used ' + item.name + '!';
        break;
      case c.BATTLE_COMMAND_SWITCH:
        var player = isOwn ? this._player : this._enemy;
        var pokemon = c.POKEMON[command.pokemonId];
        message = player.username + ' switched in ' + pokemon.name + '!';
        break;
    }
    return message;
  };

  // execute the next staged command
  Battle.prototype.execCommands = function execCommands () {
    var self = this;
    if (self._state !== c.BATTLE_STATE_EXECUTING) return;

    // fetch updated staged commands
    var battle = Battles.findOne(self._battle._id, { 
      fields: { 'stage': 1 }
    });
    self._stage = battle.stage;

    // commands are ordered now
    var first = self._stage[0];
    var second = self._stage[1];
    
    self.renderCommand(first, function () {
      self.renderCommand(second, function () {
        Meteor.call('endExec');
      });
    });
  };

  Battle.prototype.execRun = function execRun () {
    var self = this;
    self.prompt({
      text: 'Are you sure you want to forfeit?',
      options: [{ 
        text: 'YES', callback: function () { // end battle with a loss
          self._battleRenderer.renderText('Loading...');
          Meteor.call('forfeit', self.endBattle);
          self.switchView(self._prevView); // exit prompt view
        }
      }, { 
        text: 'NO', callback: function () {
          self.switchView(self._prevView); // exit prompt view
        }
      }]
    });
  };

  // fetching updates ---------------------------------

  Battle.prototype.fetchPokemon = function fetchPokemon (playerId) {
    var pokemon;
    if (playerId) {
      pokemon = playerId === this._player._id ? this._ownPokemon : this._enemyPokemon;
    } else {
      pokemon = this._pokemon;
    }
    _.each(pokemon, function (p) { p.fetch(); });
  };

  Battle.prototype.fetchCurrent = function fetchCurrent () {
    var self = this;
    Tracker.autorun(function (computation) {
      var battle = Battles.findOne(self._battle._id, {
        fields: { 'pokemon': 1 } 
      });

      var ownActive = battle.active[self._player._id];
      var enemyActive = battle.active[self._enemy._id];

      self._ownCurrent = self._ownPokemon[ownActive];
      self._enemyCurrent = self._enemyPokemon[enemyActive];
      self._ownDep.changed();
      self._enemyDep.changed();

      // store computation so we can stop it later
      self._computations[computation._id] = computation;
    });
  };

  // run this method reactively with an autorun instead of in update.
  // this way we only fetch updates when we need to (i.e changing state)
  Battle.prototype.fetchState = function fetchState () {
    var self = this;
    Tracker.autorun(function (computation) {
      var battle = Battles.findOne(self._battle._id, {
        fields: { 'state': 1 } // listen for changes on state only
      });
      self._state = battle.state;

      switch (self._state) {
        case c.BATTLE_STATE_EXECUTING:
          self.execCommands(); break;
        case c.BATTLE_STATE_ENDING:
          self.endBattle(); break;
      }

      // store computation so we can stop it later
      self._computations[computation._id] = computation;
    });
  };

  Battle.prototype.endBattle = function endBattle () {
    var self = this;
    self._state = c.BATTLE_STATE_ENDING;
    self.cleanup();

    Meteor.call('endBattle', function (error, result) {
      self.renderText(result + ' is the victor!');
      self._state = c.BATTLE_STATE_END;
    });
  };

  // TODO inheriting methods from base class
  Battle.prototype.cleanup = function cleanupBattle () {
    _.each(this._computations, function (computation) {
      computation.stop();
    });

    _.each(this._pokemon, function (pokemon) {
      pokemon.cleanup();
    });
  };

  return Battle;
})();
