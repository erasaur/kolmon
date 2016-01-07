KOL.constants = {

  // config -------------------------------------------

  CANVAS_WIDTH: 384,
  CANVAS_HEIGHT: 312,
  PX_PER_CELL: 16,

  PLAYER_HEIGHT: 66,
  PLAYER_NUM_FRAMES: 3, // number of frames in walking animation

  DEFAULT_FILL_STYLE: '#000',
  DEFAULT_LINE_WIDTH: 1,
  DEFAULT_FONT: '12px sans-serif',
  DEFAULT_TEXT_ALIGN: 'center',

  // DEFAULT_WORLD_ID: 'world1',
  // DEFAULT_MAP_ID: 'map1',
  DEFAULT_PLAYER_SRC: '/player.png',

  MOVE_TIME: 450, // time in ms to travel one cell
  UPDATE_STEP: 20, // ms per update
  UPDATES_PER_CALL: 25, // throttle update calls to roughly half a second,

  CRON_CLEANUP_TIME: 1 // time between cleanups, in minutes

  FILL_STYLE: {
    portal: 'rgba(225,0,0,0.5)',
    wild: 'rgba(0,225,0,0.5)',
    wall: 'rgba(0,0,225,0.5)'
  },

  EPSILON: 1e-9,

  // constants ----------------------------------------

  KEY_ENTER: 13,
  KEY_LEFT: 37,
  KEY_UP: 38,
  KEY_RIGHT: 39,
  KEY_DOWN: 40,

  TURN_SENDER: 50,
  TURN_RECEIVER: 51,

  DIR_UP: 101,
  DIR_LEFT: 102,
  DIR_RIGHT: 103,
  DIR_DOWN: 104,

  STATE_MAP: 151,
  STATE_BATTLE: 152,
  STATE_LOADING: 153,

  TRANSITION_FADE_IN: 201,
  TRANSITION_FADE_OUT: 202,
  TRANSITION_NUM_FRAMES: 50, // number of frames to run transition

  BATTLE_WILD: 251,
  BATTLE_TRAINER: 252,
  BATTLE_STATE_PENDING: 261,
  BATTLE_STATE_EXECUTING: 262,
  BATTLE_VIEW_MAIN: 271, // main battle view
  BATTLE_VIEW_TEAM: 272, // team list view
  BATTLE_VIEW_BAG: 273, // bag view

  OUTPUT_COMMAND: 301,
  OUTPUT_USER: 302,
  OUTPUT_SYSTEM: 303,

  // battle rendering
  BATTLE_CURSOR_FIGHT: 0,
  BATTLE_CURSOR_BAG: 1,
  BATTLE_CURSOR_POKEMON: 2,
  BATTLE_CURSOR_RUN: 3,
  BAG_TAB_ITEMS: 0,
  BAG_TAB_POKE_BALLS: 1

};
