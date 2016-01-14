var c = KOL.constants;
var Pokemon = KOL.Pokemon;

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
    
    var pokemon = this._battle.pokemon;
    // TODO store pokemon in object with pokemonId's as keys rather
    // than storing an array of pokemon objects
    this._ownPokemon = _.map(pokemon[this._player._id], function (pokemon) {
      return new Pokemon(pokemon.id);
    });
    this._enemyPokemon = _.map(pokemon[this._enemy._id], function (pokemon) {
      return new Pokemon(pokemon.id);
    });
    this._pokemon = _.union(this._ownPokemon, this._enemyPokemon);

    this._ownCurrent = this._ownPokemon[0];
    this._enemyCurrent = this._enemyPokemon[0];

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
        this._battleRenderer.renderPokemon(pokemon);
        break;
      case c.BATTLE_VIEW_ITEM:
        var item = this._bag.getItem(this._cursor.bag.index);
        this._battleRenderer.renderItem(item);
        break;
    }
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
          this.runFromBattle(); break;
      }
    } else {
      this.moveCursor(key, this._cursor.main);
    }
  };

  Battle.prototype.keydownFight = function onBattleKeydownFight (key) {
    if (key === c.KEY_ENTER) {
      // this.useMove(this._cursor.fight
    }
    else if (key === c.KEY_ESCAPE) { // analogous to "b" button
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
          },
          text: 'SWITCH', callback: function () { // switch selected poke in
            self.stageCommand({
              type: c.BATTLE_COMMAND_SWITCH,
              playerId: self._player._id,
              pokemonId: self._ownPokemon[self._cursor.team.index]
            });
            self.render(); // re-render view to exit prompt
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
            self.useItem();
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
    else if (_.contains([c.KEY_LEFT, c.KEY_RIGHT])){
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

  // battle methods -----------------------------------

  // stage a move to be executed once both players have staged a move.
  // allows us to calculate pokemon/move speeds to determine which goes first.
  Battle.prototype.stageCommand = function stageCommand (options) {
    if (this._state === c.BATTLE_STATE_PENDING) {
      this._state = c.BATTLE_STATE_STAGING;
      // playerId, type, pokemonId (if using a move or switching), moveIndex 
      // (if using a move), itemId (if using an item)
      Meteor.call('stageCommand', options);
    }
  };

  // return the adjusted `startTime` for a move, accounting for factors
  // such as status effects, speed, etc.
  Battle.prototype.commandPriority = function getCommandPriority (command) {
    // TODO lookup priority of command based on priority table
    // if both players are using same move, and priority for move is
    // the same, then calculate speed of respective pokemon
    
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

  Battle.prototype.execMoves = function execMoves () {
    var self = this;
    self._battle = Battles.findOne(self._battle._id);

    // if both moves have already been executed, do nothing
    // if both moves have not been executed, process both in order, executing 
    // the one with higher priority first.
    // otherwise, find the move that has yet to be executed and execute that
    var unprocessed = _.filter(self._battle.stage, function (move) {
      return !_.contains(move.completeIds, self._player._id);
    });

    if (unprocessed.length) {
      var first = unprocessed[0];
      var second = unprocessed[1];

      if (second) { // calculate priorities to see which one is actually first
        var firstPriority = self.movePriority(first);
        var secondPriority = self.movePriority(second);

        if (firstPriority === secondPriority) {
          var firstPokemon = self._ownCurrent;
          var secondPokemon = self._enemyCurrent;

          if (first.playerId !== self._player._id) {
            firstPokemon = self._enemyCurrent;
            secondPokemon = self._ownCurrent;
          }
          
          // if second pokemon has faster speed, it should go first
          if (secondPokemon.speed() > firstPokemon.speed()) {
            first = second;
          }
        } 
        else if (secondPriority > firstPriority) {
          first = second;
        }
      }
    }

    //TODO call method to update the pokemon affected by each move
  };

  Battle.prototype.useMove = function useMove (move) {
    if (this._state !== c.BATTLE_STATE_EXECUTING) return;

    var self = this;
    var pokemon;

    if (move.playerId === self._player._id) {
      pokemon = self._ownCurrent;
    } else {
      pokemon = self._enemyCurrent;
    }

    //TODO run damage calculations
    
    // run animations, change health bars, etc.
    self._battleRenderer.renderMove(move, function () {
      // update move to acknowledge that we have executed it
      Meteor.call('moveComplete', move.playerId);
      // run other move now, if we haven't already
      self.execMoves();
    });
  };

  Battle.prototype.useItem = function useItem (item) {
    this.renderText('Sorry, items are pretty much unusable right now.');
  };

  Battle.prototype.runFromBattle = function runFromBattle () {
    var self = this; 
    self.prompt({
      text: 'Are you sure you want to forfeit?',
      options: [{ 
        text: 'YES', callback: function () { // end battle with a loss
          self.endBattle({
            victorId: self._enemy._id,
            message: 'You have forfeited...'
          });
          self.switchView(self._prevView); // exit prompt view
        }
      }, { 
        text: 'NO', callback: function () {
          self.switchView(self._prevView); // exit prompt view
        }
      }]
    });
  };

  Battle.prototype.switchPokemon = function switchPokemon (player, index) {
    var options = {
      playerId: player._id,
      index: index // index of pokemon in team
    };
    Meteor.call('switchPokemon', options, function (error, result) {
      if (_.isString(error.reason)) this.renderText(error);
      else this.renderText('Error while switching pokemon!');
    });
  };

  Battle.prototype.fetchCurrent = function fetchCurrent () {
    var self = this;
    Tracker.autorun(function (computation) {
      var battle = Battles.findOne(self._battle._id, {
        fields: { 'pokemon': 1 } 
      });

      var activeIndex;
      var isOwnTeam;
      var pokemon;
      _.each(battle.pokemon, function (team, playerId) {
        // get active pokemon in the team
        activeIndex = _.findIndex(team, function (p) { return p.active });
        isOwnTeam = (playerId === self._player._id);

        // no active, team must have been eliminated so end game
        if (activeIndex === -1) {
          player = isOwnTeam ? self._player : self._enemy;
          self.endBattle({
            victorId: player._id,
            message: player.username + ' is the victor!'
          });
          return false; // quit the loop
        } 
        // otherwise, update the active pokemon in the team
        else {
          if (isOwnTeam) {
            self._ownCurrent = self._ownPokemon[activeIndex];
            self._ownDep.changed();
          } else {
            self._enemyCurrent = self._enemyPokemon[activeIndex];
            self._enemyDep.changed();
          }
        }
      });

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
          self.execMoves();
          break;
      }

      // store computation so we can stop it later
      self._computations[computation._id] = computation;
    });
  };

  Battle.prototype.endBattle = function endBattle (options) {
    this._state = c.BATTLE_STATE_END;
    this.renderText('Loading...');
    this.cleanup();

    Meteor.call('endBattle', options.victorId, function (error, result) {
      this.renderText(options.message);
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
