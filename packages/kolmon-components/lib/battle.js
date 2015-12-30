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

  Battle.prototype.parseCommand = function parseCommand (command) {
    //TODO
  };

  Battle.prototype.execMove = function executeMove (local) {
    this._executingMove = true;

    //TODO critical hit, evasion, status effects, etc.
    //TODO animations
    //TODO damage calculations
  };

  Battle.prototype.moveDone = function moveComplete () {
    this._executingMove = false;
    this.processQueue(); // run next move
  };

  Battle.prototype.moveTime = function getMoveTime (move, pokemon) {
    var base = constants.MAX_POKEMON_BASE_SPEED / pokemon.speed
    return ~~(0.5 + (base * constants.BATTLE_SPEED_WEIGHT));
  };

  Battle.prototype.update = function updateBattle (event, lastUpdate) {
    switch (this._state) {
      case constants.STATE_EXEC_MOVE:
        // run animation
        break;
      case constants.STATE_SWITCH_POKEMON:
        // run animation, disable inputs
        break;
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
  Battle.prototype.updateQueue = function updateQueue () {
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
    if (this._executingMove || // already executing a move
       !this._ownQueue.length || // no pending moves to execute
       !this._enemyQueue.length) return;

    // execute the oldest command between the two queues
    var ownOldest = this._ownQueue[0];
    var enemyOldest = this._enemyQueue[0];

    //TODO handle status effects

    var ownTime = this.moveTime(ownOldest, this._ownCurrent);
    var enemyTime = this.moveTime(enemyOldest, this._enemyCurrent);
    var chooseOwn; // boolean to decide whether we should process our own move

    // handle unlikely case that both move times are equal
    if (ownTime === enemyTime) {
      chooseOwn = Math.random() < 0.5; // choose randomly
    } else {
      chooseOwn = ownTime < enemyTime;
    }

    if (chooseOwn) {
      this._ownQueue.shift();
      this.execMove(ownOldest);
    } else {
      this._enemyQueue.shift();
      this.execMove(enemyOldest);
    }
  };

  return Battle;
})();
