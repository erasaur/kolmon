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

    //TODO load bg images
  };

  Battle.prototype.init = function initBattle (options) {
    this._battle = options.battle;

    this._player = options.player;
    this._ownPokemon = _.map(this._player.teamIds, function (id) {
      return new Pokemon(id);
    });

    if (options.type === constants.BATTLE_TRAINER) {
      this._enemy = options.enemy;
      this._enemyPokemon = _.map(this._enemy.teamIds, function (id) {
        return new Pokemon(id);
      });
    } else {
      this._enemyPokemon = new Pokemon(options.enemy);
    }

    this._ownCurrent = this._ownPokemon[0];
    this._enemyCurrent = this._enemyPokemon[0];

    this._ownDep.changed();
    this._enemyDep.changed();

    // queue of commands
    this._ownQueue = [];
    this._enemyQueue = [];

    this.render();
  };

  // this render function need only be called once per battle to render initial
  // elements. animations (e.g for swapping pokemon or for attacking) should
  // be handled separately.
  Battle.prototype.render = function renderBattle () {
    //TODO render bg, ui
    //TODO render pokemon
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

  // events -------------------------------------------

  Battle.prototype.output = function output (type, message) {
    //TODO output to panel with different colored text depending on type
    console.log('output of type [' + type + ']: ' + message);
  };

  Battle.prototype.parseCommand = function parseCommand (command) {
    //TODO
  };

  Battle.prototype.switchPokemon = function switchPokemon (player, index) {
    var pokemon;
    if (player._id === this._player._id) {
      pokemon = this._ownPokemon;
    } else {
      pokemon = this._enemyPokemon;
    }
    this._status = constants.STATE_SWITCH_POKEMON;

    if (pokemon[index] && pokemon[index].health() > 0) {
      // switch
    } else {
      this.output('error', 'unable to switch pokemon');
    }
  };

  Battle.prototype.execCommand = function executeCommand (command, local) {
    this._executing = true;

    //TODO switching pokemon & animating
    //TODO using potions
    //TODO use pokeballs

    //TODO critical hit, evasion, status effects, etc.
    //TODO animations
    //TODO damage calculations, fainting, pokemon switching/losing

    if (local) { // propagate to global
      Meteor.call('battleExecCommand', command);
    }
  };

  Battle.prototype.moveDone = function moveComplete () {
    this._executing = false;
    this.processQueue(); // run next move
  };

  Battle.prototype.moveTime = function getMoveTime (move, pokemon) {
    if (!move || pokemon.isUnableToMove()) {
      return -1;
    }
    var base = constants.MAX_POKEMON_BASE_SPEED / pokemon.speed;
    return Math.round(base * constants.BATTLE_SPEED_WEIGHT + move.startTime);
  };

  Battle.prototype.update = function updateBattle (event, lastUpdate) {
    switch (this._state) {
      case constants.STATE_EXEC_MOVE:
        // run animation
        break;
      // case constants.STATE_SWITCH_POKEMON: break; // noop
    }
  };

  // checks that the move has not yet been encountered before
  Battle.prototype.moveIsNew = function moveIsNew (move) {
    var ownNewest = _.last(this._ownQueue);
    var enemyNewest = _.last(this._enemyQueue);
    return (!ownNewest || move.startTime > ownNewest.startTime) &&
           (!enemyNewest || move.startTime > enemyNewest.startTime);
  };

  // run this method reactively with an autorun instead of in update.
  // this way we only fetch updates when we need to (i.e there's a new move)
  Battle.prototype.fetchQueue = function fetchQueue () {
    // if battling a trainer, update local queue with enemy commands
    this._battle = Battles.findOne(this._battle, {
      fields: { 'moveQueue': 1 } // only listen on changes to moveQueue
    });

    _.each(this._battle.moveQueue, function (move) {
      if (!this.moveIsNew(move)) return;

      if (move.playerId === this._player._id) {
        this._ownQueue.push(move);
      } else {
        this._enemyQueue.push(move);
      }
    });
  };

  Battle.prototype.processQueue = function processQueue () {
    if (this._executing || // already executing a command
       !this._ownQueue.length && !this._enemyQueue.length) { // none pending
      return;
    }

    // execute the oldest command between the two queues
    var ownOldest = this._ownQueue[0];
    var enemyOldest = this._enemyQueue[0];

    var ownTime = this.moveTime(ownOldest, this._ownCurrent);
    var enemyTime = this.moveTime(enemyOldest, this._enemyCurrent);
    var chooseOwn; // boolean to decide whether we should process our own move

    if (ownTime !== enemyTime) {
      if (ownTime < 0) { // own pokemon is unable to move (e.g paralyzed)
        chooseOwn = false;
      } else if (enemyTime < 0) { // enemy is unable to move
        chooseOwn = true;
      } else {
        chooseOwn = ownTime < enemyTime; // choose older one
      }
    } 
    // handle unlikely case that both move times are equal
    else {
      if (ownTime < 0) return; // both own and enemy are unable to move
      chooseOwn = Math.random() < 0.5; // choose randomly
    }

    if (chooseOwn) {
      this._ownQueue.shift();
      this.execCommand(ownOldest, true);
    } else {
      this._enemyQueue.shift();
      this.execCommand(enemyOldest, false);
    }
  };

  return Battle;
})();
