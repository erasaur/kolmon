var constants = KOL.constants;
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
  };

  Battle.prototype.init = function initBattle (options) {
    var c = constants;

    // use local collection to store output
    this._outputCollection = new Mongo.Collection('battle-output');

    this._battle = options.battle;
    this._player = options.player;
    this._ownPokemon = _.map(this._player.teamIds, function (id) {
      return new Pokemon(id);
    });

    this._enemy = options.enemy;
    this._enemyPokemon = _.map(this._enemy.teamIds, function (id) {
      return new Pokemon(id);
    });

    this._ownCurrent = this._ownPokemon[0];
    this._enemyCurrent = this._enemyPokemon[0];

    this._ownDep.changed();
    this._enemyDep.changed();

    // rendering config -------------------------------
    
    this._cursor = { // keep track of cursor state
      main: c.BATTLE_CURSOR_FIGHT,
      team: {
        index: 0, // current index within the list of pokemon
        length: 6
      },
      bag: {
        tab: c.BAG_TAB_ITEMS, // current tab within the bag
        index: 0 // current index within the tab
      },
      prompt: {
        index: 0,
        length: 0
      }
    };
    this._view = c.BATTLE_VIEW_MAIN;

    this._cursorMap = {};
    this._cursorMap[c.BATTLE_CURSOR_BAG][c.KEY_LEFT] = c.BATTLE_CURSOR_FIGHT;
    this._cursorMap[c.BATTLE_CURSOR_RUN][c.KEY_LEFT] = c.BATTLE_CURSOR_TEAM;
    this._cursorMap[c.BATTLE_CURSOR_FIGHT][c.KEY_RIGHT] = c.BATTLE_CURSOR_BAG;
    this._cursorMap[c.BATTLE_CURSOR_TEAM][c.KEY_RIGHT] = c.BATTLE_CURSOR_RUN;

    this.render();
  };

  // this render function need only be called once per battle to render initial
  // elements. animations (e.g for swapping pokemon or for attacking) should
  // be handled separately.
  Battle.prototype.render = function renderBattle () {
    // render bg, ui, pokemon
    this._battleRenderer.render();
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

  Battle.prototype.keydownMain = function onBattleKeydownMain (key) {
    if (key == constants.KEY_ENTER) {
      switch (this._cursor.main) {
        case constants.BATTLE_CURSOR_FIGHT:
          break;
        case constants.BATTLE_CURSOR_BAG:
          break;
        case constants.BATTLE_CURSOR_TEAM:
          break;
        case constants.BATTLE_CURSOR_RUN:
          break;
      }
    } else {
      var cursor = this._cursorMap[this._cursor.main][key];
      if (cursor) {
        this._cursor.main = cursor;
      }
    }
  };

  Battle.prototype.keydownTeam = function onBattleKeydownTeam (key) {
    if (key == constants.KEY_ENTER) {
      // render text: 'switch into battle?'
      // display YES/NO prompt 
      // register prompt callback
    } else {
      var current = this._cursor.team.index;
      var len = this._cursor.team.length;
      var newIndex;

      switch (key) {
        case constants.KEY_LEFT:
          newIndex = Math.max(current - len/2, 0);
          break;
        case constants.KEY_RIGHT:
          newIndex = Math.min(current + len/2, len-1);
          break;
      }
      this._cursor.team.index = newIndex; 
    }
  };

  Battle.prototype.keydownBag = function onBattleKeydownBag (key) {
    switch (key) {
      case constants.KEY_ENTER:
        break;
      case constants.KEY_LEFT:
         
        break;
    }
  };

  Battle.prototype.keydownPrompt = function onBattleKeydownPrompt (event) {
    var current = this._cursor.prompt.index;
    var len = this._cursor.prompt.length;
    var newIndex;

    switch (key) {
      case constants.KEY_ENTER:
        break;
      case constants.KEY_UP:
        newIndex = Math.max(current - 1, 0); 
        break;
      case constants.KEY_DOWN:
        newIndex = Math.min(current + 1, len-1);
        break;
    }
    this._cursor.prompt.index = newIndex;
  };

  Battle.prototype.prompt = function prompt (options) {
    this._cursor.prompt.index = 0; // reset prompt index
    this._battleRenderer.renderPrompt(_.pluck(options, 'text'));
    this._view = constants.BATTLE_VIEW_PROMPT;
  };

  Battle.prototype.keydown = function onBattleKeydown (event) {
    var key = event.keyCode || event.which;

    // disable inputs if battle state not pending
    if (this._state !== constants.BATTLE_STATE_PENDING) return;

    // this._keyMap = {
    //   [constants.BATTLE_VIEW_MAIN]: this.keydownMain,
    //   [constants.BATTLE_VIEW_TEAM]: this.keydownTeam,
    //   [constants.BATTLE_VIEW_BAG]: this.keydownBag,
    //   [constants.BATTLE_VIEW_PROMPT]: this.keydownPrompt
    // };
    // this._keyMap[this._view](key);

    switch (this._view) {
      case constants.BATTLE_VIEW_MAIN:
        this.keydownMain(key); break;
      case constants.BATTLE_VIEW_TEAM:
        this.keydownTeam(key); break;
      case constants.BATTLE_VIEW_BAG:
        this.keydownBag(key); break;
      case constants.BATTLE_VIEW_PROMPT:
        this.keydownPrompt(key); break;
    }
  };

  // stage a move to be executed when both players have staged a move.
  // allows us to calculate pokemon/move speeds to determine which goes first.
  Battle.prototype.stageMove = function stageMove (options) {
    if (this._state === constants.BATTLE_STATE_PENDING) {
      // playerId, pokemonId, (move) index
      Meteor.call('stageMove', options);
    }
  };

  Battle.prototype.execMoves = function execMoves () {
    this._battle = Battles.findOne(this._battle._id);

    // if both moves have already been executed, do nothing
    // if both moves have not been executed, process both in order, executing the 'faster' one first
    // otherwise, find the move that has yet to be executed and execute that
    //TODO account for status effects, etc.

    //TODO call update on the pokemon affected by each move
  };

  Battle.prototype.useMove = function useMove (move, local) {
    if (this._state !== constants.BATTLE_STATE_EXECUTING) return;

    var self = this;
    var pokemon;

    if (move.playerId === self._player._id) {
      pokemon = self._ownCurrent;
    } else {
      pokemon = self._enemyCurrent;
    }

    //TODO run damage calculations
    
    // run animations, change health bars, etc.
    self._battleRenderer.useMove(move, function () {
      // update move to acknowledge that we have executed it
      if (local) {
        Meteor.call('moveComplete', move.playerId);
      }
      // run other move now, if we haven't already
      self.execMoves();
    });
  };

  Battle.prototype.useItem = function useItem (item) {

  };

  Battle.prototype.runAway = function runAway () {

  };

  Battle.prototype.switchPokemon = function switchPokemon (player, index) {
    var pokemon;
    var switchOwn = player._id === this._player._id;
    if (switchOwn) {
      pokemon = this._ownPokemon;
    } else {
      pokemon = this._enemyPokemon;
    }

    if (pokemon[index] && pokemon[index].health() > 0) {
      if (switchOwn) {
        this._ownCurrent = pokemon[index];
        this._ownDep.changed();
      } else {
        this._enemyCurrent = pokemon[index];
        this._enemyDep.changed();
      }
    } else {
      this.output({
        type: constants.OUTPUT_SYSTEM,
        message: pokemon[index].name() + ' has already fainted!'
      });
    }
  };

  // Battle.prototype.update = function updateBattle (dt, now) {
  //   // re-render ui elements (e.g health, statuses, bag screen, etc)
  //   this._battleRenderer.update();
  // };

  // run this method reactively with an autorun instead of in update.
  // this way we only fetch updates when we need to (i.e changing state)
  Battle.prototype.fetchState = function fetchState () {
    this._state = Battles.findOne(this._battle._id, {
      fields: { 'state': 1 } // listen for changes on state only
    });

    switch (this._state) {
      case constants.BATTLE_STATE_EXECUTING:
        this.execMoves();
        break;
      // case constants.BATTLE_STATE_PENDING:
      //   break;
    }
  };

  Battle.prototype.fetchPokemon = function fetchPokemon () {
    var poke = this._battle.pokemon;
    var ownIds = _.pluck(poke[this._player._id], 'id');
    var enemyIds = _.pluck(poke[this._enemy._id], 'id');
    var pokemon = Pokemon.find({ '_id': { $in: _.union(ownIds, enemyIds) } });

    // call fetchUpdate on each pokemon
  };

  Battle.prototype.fetch = function fetchBattle () {
    this._battle = Battles.findOne(this._battle._id);
    // update current pokemon
  };

  return Battle;
})();
