KOL.constants = {
  STATUS_PENDING: 0,
  STATUS_ACCEPTED: 1,
  STATUS_REJECTED: 2,

  TURN_SENDER: 50,
  TURN_RECEIVER: 51,

  CANVAS_WIDTH: 384,
  CANVAS_HEIGHT: 312,
  PX_PER_CELL: 16,

  PLAYER_WIDTH: 16,
  PLAYER_HEIGHT: 66,
  PLAYER_NUM_FRAMES: 3, // number of frames in walking animation

  get CENTER_X () {
    return Math.floor(this.CANVAS_WIDTH / (2 * this.PX_PER_CELL)) * this.PX_PER_CELL;
  },
  get CENTER_Y () {
    return Math.floor(this.CANVAS_HEIGHT / (2 * this.PX_PER_CELL)) * this.PX_PER_CELL;
  },

  // MOVES: JSON.parse(Assets.getText('moves.json')),
  // POKEMON: JSON.parse(Assets.getText('pokemon.json')),
  // TYPES: JSON.parse(Assets.getText('types.json')),

  DEFAULT_LINE_WIDTH: 1,
  DEFAULT_FONT: '12px sans-serif',
  DEFAULT_TEXT_ALIGN: 'center',

  // DEFAULT_WORLD_ID: 'world1',
  // DEFAULT_MAP_ID: 'map1',
  DEFAULT_PLAYER_SRC: '/player.png',

  DIR_UP: 101,
  DIR_LEFT: 102,
  DIR_RIGHT: 103,
  DIR_DOWN: 104,

  STATE_MAP: 151,
  STATE_TR_MAP: 152,
  STATE_BATTLE: 153,
  STATE_TR_BATTLE: 154,

  MOVE_TIME: 500, // time in ms to travel one cell
  UPDATE_STEP: 20, // ms per update
  UPDATES_PER_CALL: 25 // throttle update calls to roughly half a second
};
