KOL.constants = {
  EPSILON: 1e-9,

  STATUS_PENDING: 0,
  STATUS_ACCEPTED: 1,
  STATUS_REJECTED: 2,

  TURN_SENDER: 50,
  TURN_RECEIVER: 51,

  CANVAS_WIDTH: 384,
  CANVAS_HEIGHT: 312,
  PX_PER_CELL: 16,

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

  DEFAULT_FILL_STYLE: '#000',
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

  // PORTAL_FILL_STYLE: 'rgba(225,0,0,0.5)',
  // WILD_FILL_STYLE: 'rgba(0,225,0,0.5)',
  // WALL_FILL_STYLE: 'rgba(0,0,225,0.5)',
  // UNIT_FILL_STYLE: 'rgba(0,0,0,1)',

  FILL_STYLE: {
    portal: 'rgba(225,0,0,0.5)',
    wild: 'rgba(0,225,0,0.5)',
    wall: 'rgba(0,0,225,0.5)'
  },

  STATE_MAP: 151,
  STATE_BATTLE: 152,
  STATE_LOADING: 153,

  TRANSITION_FADE_IN: 201,
  TRANSITION_FADE_OUT: 202,
  TRANSITION_NUM_FRAMES: 50, // number of frames to run transition

  BATTLE_WILD: 251,
  BATTLE_TRAINER: 252,

  OUTPUT_COMMAND: 301,
  OUTPUT_USER: 302,
  OUTPUT_SYSTEM: 303,

  MOVE_TIME: 450, // time in ms to travel one cell
  UPDATE_STEP: 20, // ms per update
  UPDATES_PER_CALL: 25, // throttle update calls to roughly half a second,

  CRON_CLEANUP_TIME: 1 // time between cleanups, in minutes
};
