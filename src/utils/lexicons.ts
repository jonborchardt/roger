/**
 * Global lexicons for natural language parsing
 * Maps various word forms to normalized canonical forms
 */

import type { Lexicon } from '../types';

/**
 * Pronouns that can reference the lastFocus object
 */
export const PRONOUNS: Lexicon = {
  it: 'it',
  this: 'this',
  that: 'that',
  these: 'these',
  those: 'those',
  him: 'him',
  her: 'her',
  there: 'there',
  here: 'here',
};

/**
 * Named persons/characters in the game
 */
export const PERSONS: Lexicon = {
  roger: 'roger',
  wilco: 'roger',
  'roger-wilco': 'roger',
  rogerwilco: 'roger',
};

/**
 * Meta-game intents (inventory, help, etc.)
 */
export const INTENTS: Lexicon = {
  hi: 'greet',
  hello: 'greet',
  hey: 'greet',
  yo: 'greet',
  sup: 'greet',
  greetings: 'greet',
  hiya: 'greet',
  howdy: 'greet',

  thanks: 'thanks',
  thank: 'thanks',
  thankyou: 'thanks',
  thx: 'thanks',

  help: 'help',
  hint: 'help',
  clue: 'help',

  inventory: 'inventory',
  inv: 'inventory',
  items: 'inventory',
  bag: 'inventory',
  pockets: 'inventory',

  status: 'status',
  state: 'status',
  debug: 'status',

  score: 'score',
  points: 'score',

  qa: 'qa',

  what: 'ask',
  why: 'ask',
  who: 'ask',
  where: 'ask',
  when: 'ask',
  how: 'ask',
  tell: 'ask',
  explain: 'ask',
  describe: 'ask',

  feel: 'feel',
  scared: 'feel',
  afraid: 'feel',
  calm: 'feel',
  tired: 'feel',
  hungry: 'feel',
  thirsty: 'feel',
};

/**
 * Action verbs with normalized forms
 */
export const VERBS: Lexicon = {
  // Look/Examine
  look: 'look',
  examine: 'look',
  inspect: 'look',
  view: 'look',
  see: 'look',
  watch: 'look',
  peer: 'look',
  stare: 'look',
  glance: 'look',
  observe: 'look',
  check: 'look',
  study: 'look',

  // Smell
  smell: 'smell',
  sniff: 'smell',
  inhale: 'smell',
  breathe: 'smell',

  // Listen
  listen: 'listen',
  hear: 'listen',

  // Touch
  touch: 'touch',
  feel: 'touch',
  rub: 'touch',
  poke: 'touch',

  // Taste
  taste: 'taste',
  lick: 'taste',

  // Close
  close: 'close',
  shut: 'close',
  seal: 'close',

  // Open
  open: 'open',
  pry: 'open',
  force: 'open',
  unseal: 'open',
  unlock: 'open',
  unbolt: 'open',
  jimmy: 'open',

  // Take
  take: 'take',
  get: 'take',
  grab: 'take',
  pick: 'take',
  pocket: 'take',
  steal: 'take',
  acquire: 'take',
  obtain: 'take',

  // Use
  use: 'use',
  wear: 'use',
  apply: 'use',
  insert: 'use',
  plug: 'use',
  attach: 'use',
  fit: 'use',
  connect: 'use',
  place: 'use',
  put: 'use',

  // Move/Push/Pull
  push: 'move',
  pull: 'move',
  drag: 'move',
  shove: 'move',
  manipulate: 'move',
  turn: 'move',
  roll: 'move',
  lift: 'move',
  hoist: 'move',
  budge: 'move',
  move: 'move',

  // Start/Activate
  start: 'start',
  run: 'start',
  ignite: 'start',
  activate: 'start',
  enable: 'start',
  power: 'start',
  turnon: 'start',

  // Break
  break: 'break',
  smash: 'break',
  crack: 'break',
  shatter: 'break',
  destroy: 'break',

  // Climb
  climb: 'climb',
  scale: 'climb',
  ascend: 'climb',
  mount: 'climb',

  // Enter
  enter: 'enter',
  board: 'enter',
  getin: 'enter',
  goin: 'enter',

  // Talk
  talk: 'talk',
  ask: 'talk',
  speak: 'talk',
  say: 'talk',
  shout: 'talk',
  call: 'talk',
  yell: 'talk',

  // Search
  search: 'search',
  rummage: 'search',
  sift: 'search',
  dig: 'search',
  explore: 'search',

  // Scan
  scan: 'scan',
  analyze: 'scan',

  // Read
  read: 'read',
  translate: 'read',
  decode: 'read',

  // Press
  press: 'press',
  tap: 'press',
  hit: 'press',

  // Clean
  clean: 'clean',
  scrub: 'clean',
  wipe: 'clean',
  sweep: 'clean',

  // Approach
  approach: 'approach',
  walk: 'approach',
  go: 'approach',
  head: 'approach',

  // Throw
  throw: 'throw',
  toss: 'throw',
  hurl: 'throw',
  chuck: 'throw',

  // Kick
  kick: 'kick',

  // Jump
  jump: 'jump',
  hop: 'jump',
  leap: 'jump',

  // Wait
  wait: 'wait',
  rest: 'wait',
  pause: 'wait',
};

/**
 * Prepositions for spatial/relational parsing
 */
export const PREPOSITIONS: Lexicon = {
  in: 'in',
  into: 'in',
  inside: 'in',

  through: 'through',

  around: 'around',

  at: 'at',

  on: 'on',
  onto: 'on',
  upon: 'on',

  below: 'below',
  down: 'down',
  under: 'under',
  underneath: 'under',
  beneath: 'under',

  above: 'above',
  over: 'over',

  with: 'with',
  without: 'without',

  to: 'to',
  toward: 'to',
  towards: 'to',

  from: 'from',

  near: 'near',
  beside: 'near',
  by: 'near',

  behind: 'behind',

  between: 'between',
};

/**
 * Base adjectives (room-specific adjectives in room definitions)
 */
export const ADJECTIVES: Lexicon = {
  sealed: 'sealed',
  locked: 'locked',

  dark: 'dark',
  cold: 'cold',
  warm: 'warm',
  wet: 'wet',
  sticky: 'sticky',

  bright: 'bright',
  dim: 'dim',

  broken: 'broken',
  dead: 'dead',
  alive: 'alive',

  flicker: 'flicker',
  flickering: 'flicker',

  blue: 'blue',
  red: 'red',
  green: 'green',
  orange: 'orange',
  silver: 'silver',
  gold: 'gold',
  golden: 'gold',

  metallic: 'metallic',
  metal: 'metallic',

  industrial: 'industrial',
  abandoned: 'abandoned',
  futuristic: 'futuristic',

  small: 'small',
  large: 'large',
  big: 'large',

  open: 'open',
};

/**
 * Base nouns (room-specific nouns in room definitions)
 */
export const NOUNS: Lexicon = {
  // General environment
  area: 'area',
  room: 'area',
  bay: 'area',
  space: 'area',
  place: 'area',

  air: 'air',
  atmosphere: 'air',

  // Structures
  wall: 'wall',
  walls: 'wall',

  ceiling: 'ceiling',
  roof: 'ceiling',

  lights: 'lights',
  light: 'lights',
  lighting: 'lights',

  shadows: 'shadows',
  shadow: 'shadows',

  deck: 'deck',
  floor: 'deck',
  ground: 'deck',

  // Materials/debris
  slime: 'slime',
  goo: 'slime',
  gunk: 'slime',

  rust: 'rust',

  debris: 'debris',
  rubble: 'rubble',
  rocks: 'rubble',
  stones: 'rubble',

  pipes: 'pipes',
  pipe: 'pipes',

  vents: 'vents',
  vent: 'vents',

  cables: 'cables',
  cable: 'cables',
  wires: 'cables',
  wiring: 'cables',

  // Sensory
  hum: 'hum',
  humming: 'hum',
  buzz: 'hum',
  buzzing: 'hum',

  sound: 'sound',
  sounds: 'sound',
  noise: 'sound',

  smell: 'smell',
  odor: 'smell',
  scent: 'smell',

  ozone: 'ozone',

  // Legacy items (from original scene)
  door: 'door',
  window: 'window',
  pod: 'pod',
  cryo: 'cryo',
  cryopod: 'cryo',
  controls: 'controls',
  motivator: 'motivator',
  warpmotivator: 'motivator',
  plug: 'plug',
};
