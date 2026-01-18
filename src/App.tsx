import React, { useEffect, useRef } from 'react';
import {
  Application,
  Assets,
  Circle,
  Container,
  Graphics,
  Sprite,
  Text,
} from 'pixi.js';

/**
 * SINGLE-FILE APP
 * - Press green dot: starts recording + live transcript
 * - Press red dot: stops recording, runs transcript through deterministic rule engine, speaks the response (full)
 * - Cyan dot: speaks the last computed response again (not the transcript)
 *
 * No AI. String in -> rules -> string out.
 *
 * Quick test ideas (a lot more below):
 * - look around
 * - look at archway
 * - read symbols
 * - take cylinder
 * - use cylinder on panel
 * - search rubble
 * - inventory
 * - who is roger
 */

const bgTexture = await Assets.load('/roger/scene2.png');

/* =========================
 * Recorder types
 * ========================= */

type RecordingState = 'idle' | 'recording' | 'recorded';

type RecorderController = {
  start: () => Promise<void>;
  stop: () => void;
  speakLastResponse: () => void;
  getState: () => RecordingState;
  destroy: () => void;
};

function isSpeechRecognitionSupported(): boolean {
  const w = window as unknown as {
    SpeechRecognition?: typeof SpeechRecognition;
    webkitSpeechRecognition?: typeof SpeechRecognition;
  };
  return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
}

function createSpeechRecognition(): SpeechRecognition | null {
  const w = window as unknown as {
    SpeechRecognition?: typeof SpeechRecognition;
    webkitSpeechRecognition?: typeof SpeechRecognition;
  };

  const ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
  if (!ctor) {
    return null;
  }

  return new ctor();
}

function speak(text: string) {
  if (!('speechSynthesis' in window)) {
    alert('Text-to-speech is not supported in this browser.');
    return;
  }

  const trimmed = text.trim();
  if (!trimmed) {
    alert('No text to speak yet.');
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(trimmed);
  utterance.rate = 0.95;
  utterance.pitch = 1;
  utterance.volume = 1;

  window.speechSynthesis.speak(utterance);
}

function makeDot(radius: number, color: number) {
  const dot = new Graphics();
  dot.circle(0, 0, radius);
  dot.fill(color);

  dot.eventMode = 'static';
  dot.cursor = 'pointer';
  dot.hitArea = new Circle(0, 0, radius);

  return dot;
}

function repaintDot(dot: Graphics, radius: number, color: number) {
  dot.clear();
  dot.circle(0, 0, radius);
  dot.fill(color);
}

/* =========================
 * Deterministic rule engine
 * ========================= */

type Context = {
  global186?: boolean;
  global200?: boolean;

  inventory?: Set<string>;
  knowledge?: Set<string>;
  lastFocus?: string | null;

  // Simple counters so responses can vary deterministically.
  counters?: Record<string, number>;
};

type SceneFlags = {
  podDoorSealed?: boolean;
  lightsWorking?: boolean;
  slimePresent?: boolean;
  ambientHum?: boolean;
  wallsSweaty?: boolean;
  playerBruised?: boolean;

  lightsFlickering?: boolean;
  archwayOpen?: boolean;
  wallHasSymbols?: boolean;
  wallHasStains?: boolean;
  floorHasRubble?: boolean;
  leftMachinePowered?: boolean;
  blueGlowActive?: boolean;

  hasRedDisc?: boolean;
  hasBlueCrate?: boolean;
  hasSilverCylinder?: boolean;

  // Soft progression toggles
  panelUnlocked?: boolean;
  machineRepaired?: boolean;
  archwaySafe?: boolean;
};

type MatchResult =
  | { kind: 'reply'; text: string; ruleId: string }
  | { kind: 'pass'; reason: string; ruleId: string }
  | { kind: 'none' };

type Rule = {
  id: string;
  priority: number;
  when?: (ctx: Context, flags: SceneFlags) => boolean;
  match: (p: Parse, raw: string, ctx: Context, flags: SceneFlags) => boolean;
  action: (
    p: Parse,
    raw: string,
    ctx: Context,
    flags: SceneFlags,
  ) => MatchResult;
};

type Parse = {
  rawWords: string[];
  intents: Set<string>;
  verbs: Set<string>;
  nouns: Set<string>;
  adjs: Set<string>;
  preps: Set<string>;
  targets: Set<string>;
  question: boolean;
  person: Set<string>;
  pronouns: Set<string>;
  all: Set<string>;
};

function respondToCommand(
  input: string,
  ctx: Context = {},
  flags: SceneFlags = {},
): MatchResult {
  const raw = (input ?? '').trim();
  if (!raw) {
    return reply(
      'system.empty',
      'Say something. The bay is not going to narrate itself.',
    );
  }

  hydrateState(ctx, flags);
  const p = parse(raw, ctx);

  for (const rule of rulesSorted) {
    if (rule.when && !rule.when(ctx, flags)) continue;
    if (!rule.match(p, raw, ctx, flags)) continue;
    const out = rule.action(p, raw, ctx, flags);
    if (out.kind === 'reply') {
      bump(ctx, rule.id);
    }
    return out;
  }

  return fallbackReply(p, raw, ctx, flags);
}

function hydrateState(ctx: Context, flags: SceneFlags) {
  ctx.inventory ??= new Set<string>();
  ctx.knowledge ??= new Set<string>();
  ctx.counters ??= {};

  // Defaults that match your screenshot description.
  if (flags.lightsWorking === undefined) flags.lightsWorking = true;
  if (flags.lightsFlickering === undefined) flags.lightsFlickering = true;
  if (flags.slimePresent === undefined) flags.slimePresent = true;
  if (flags.ambientHum === undefined) flags.ambientHum = true;

  if (flags.archwayOpen === undefined) flags.archwayOpen = true;
  if (flags.wallHasSymbols === undefined) flags.wallHasSymbols = true;
  if (flags.wallHasStains === undefined) flags.wallHasStains = true;
  if (flags.floorHasRubble === undefined) flags.floorHasRubble = true;
  if (flags.leftMachinePowered === undefined) flags.leftMachinePowered = true;
  if (flags.blueGlowActive === undefined) flags.blueGlowActive = true;

  if (flags.hasRedDisc === undefined) flags.hasRedDisc = true;
  if (flags.hasBlueCrate === undefined) flags.hasBlueCrate = true;
  if (flags.hasSilverCylinder === undefined) flags.hasSilverCylinder = true;

  if (flags.panelUnlocked === undefined) flags.panelUnlocked = false;
  if (flags.machineRepaired === undefined) flags.machineRepaired = false;
  if (flags.archwaySafe === undefined) flags.archwaySafe = false;
}

function bump(ctx: Context, key: string): number {
  const c = ctx.counters ?? {};
  const next = (c[key] ?? 0) + 1;
  c[key] = next;
  ctx.counters = c;
  return next;
}

function seen(ctx: Context, key: string): number {
  return ctx.counters?.[key] ?? 0;
}

function parse(input: string, ctx: Context): Parse {
  const raw = input.toLowerCase().trim();

  const rawWords = raw
    .replace(/[^a-z0-9\-_\s?]/g, ' ')
    .split(/\s+/g)
    .filter(Boolean);

  const verbs = new Set<string>();
  const nouns = new Set<string>();
  const adjs = new Set<string>();
  const preps = new Set<string>();
  const intents = new Set<string>();
  const person = new Set<string>();
  const pronouns = new Set<string>();

  const question = isQuestionish(raw, rawWords);

  for (const w0 of rawWords) {
    const w = normalizeWord(w0);

    const pr = pronounLex[w];
    if (pr) {
      pronouns.add(pr);
      continue;
    }

    const pers = personLex[w];
    if (pers) {
      person.add(pers);
      continue;
    }

    const intent = intentLex[w];
    if (intent) {
      intents.add(intent);
      continue;
    }

    const v = verbLex[w];
    if (v) {
      verbs.add(v);
      continue;
    }

    const prep = prepLex[w];
    if (prep) {
      preps.add(prep);
      continue;
    }

    const n = nounLex[w];
    if (n) {
      nouns.add(n);
      continue;
    }

    const a = adjLex[w];
    if (a) {
      adjs.add(a);
      continue;
    }

    adjs.add(w);
  }

  if (!intents.size) {
    if (question) intents.add('ask');
  }

  if (!intents.has('ask') && question) intents.add('ask');

  // Infer intents from verbs.
  if (hasAny(verbs, 'look')) intents.add('look');
  if (hasAny(verbs, 'smell')) intents.add('smell');
  if (hasAny(verbs, 'listen')) intents.add('listen');
  if (hasAny(verbs, 'touch')) intents.add('touch');
  if (hasAny(verbs, 'taste')) intents.add('taste');
  if (hasAny(verbs, 'take')) intents.add('take');
  if (hasAny(verbs, 'use')) intents.add('use');
  if (hasAny(verbs, 'move')) intents.add('move');
  if (hasAny(verbs, 'open')) intents.add('open');
  if (hasAny(verbs, 'break')) intents.add('break');
  if (hasAny(verbs, 'start')) intents.add('start');
  if (hasAny(verbs, 'talk')) intents.add('talk');
  if (hasAny(verbs, 'search')) intents.add('search');
  if (hasAny(verbs, 'scan')) intents.add('scan');
  if (hasAny(verbs, 'read')) intents.add('read');
  if (hasAny(verbs, 'press')) intents.add('press');
  if (hasAny(verbs, 'clean')) intents.add('clean');
  if (hasAny(verbs, 'approach')) intents.add('approach');
  if (hasAny(verbs, 'enter')) intents.add('enter');
  if (hasAny(verbs, 'throw')) intents.add('throw');
  if (hasAny(verbs, 'kick')) intents.add('kick');
  if (hasAny(verbs, 'jump')) intents.add('jump');
  if (hasAny(verbs, 'wait')) intents.add('wait');

  // Pronoun resolution: if they say "it/that/this/him" and no explicit noun, use lastFocus.
  const resolved = resolvePronouns(nouns, pronouns, ctx);
  for (const n of resolved) nouns.add(n);

  const targets = new Set<string>([...nouns, ...person]);
  const all = new Set<string>([
    ...rawWords.map(normalizeWord),
    ...intents,
    ...verbs,
    ...nouns,
    ...adjs,
    ...preps,
    ...person,
    ...pronouns,
  ]);

  return {
    rawWords,
    intents,
    verbs,
    nouns,
    adjs,
    preps,
    targets,
    question,
    person,
    pronouns,
    all,
  };
}

function resolvePronouns(
  nouns: Set<string>,
  pronouns: Set<string>,
  ctx: Context,
): Set<string> {
  const out = new Set<string>();

  if (nouns.size > 0) return out;
  if (!pronouns.size) return out;

  const focus = ctx.lastFocus ?? null;
  if (!focus) return out;

  // Only resolve for object-ish pronouns.
  if (pronouns.has('it') || pronouns.has('that') || pronouns.has('this')) {
    out.add(focus);
  }

  // Person pronouns.
  if (pronouns.has('him') && focus === 'roger') out.add('roger');
  if (pronouns.has('her')) return out;

  return out;
}

function isQuestionish(raw: string, rawWords: string[]): boolean {
  if (raw.includes('?')) return true;
  if (rawWords.length === 0) return false;
  const first = normalizeWord(rawWords[0]);
  return hasAny(
    new Set([first]),
    'what',
    'why',
    'how',
    'where',
    'who',
    'when',
    'tell',
    'explain',
    'describe',
    'can',
    'should',
    'is',
    'are',
    'do',
    'does',
  );
}

function normalizeWord(w: string): string {
  const x = w.trim().toLowerCase();
  if (x === 'turnon') return 'turnon';
  if (x === 'getin') return 'getin';
  if (x === 'goin') return 'goin';
  if (x === 'escapepod') return 'escapepod';
  if (x === 'warpmotivator') return 'warpmotivator';
  if (x === 'junkbay') return 'junkbay';
  if (x === 'roger') return 'roger';
  if (x === 'wilco') return 'roger';
  if (x === 'rogerwilco') return 'roger';
  if (x === 'scene2') return 'scene';
  return x;
}

function hasAny(set: Set<string>, ...items: string[]): boolean {
  for (const it of items) if (set.has(it)) return true;
  return false;
}

/* =========================
 * Lexicons
 * ========================= */

const pronounLex: Record<string, string> = {
  it: 'it',
  this: 'this',
  that: 'that',
  these: 'this',
  those: 'that',
  him: 'him',
  her: 'her',
  there: 'there',
  here: 'here',
};

const personLex: Record<string, string> = {
  roger: 'roger',
  wilco: 'roger',
  'roger-wilco': 'roger',
  roger_wilco: 'roger',
};

const intentLex: Record<string, string> = {
  hi: 'greet',
  hello: 'greet',
  hey: 'greet',
  yo: 'greet',
  sup: 'greet',
  thanks: 'thanks',
  thank: 'thanks',
  help: 'help',

  inventory: 'inventory',
  inv: 'inventory',
  bag: 'inventory',
  pockets: 'inventory',

  status: 'status',
  state: 'status',
  debug: 'status',

  score: 'score',
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

  // Feelings, still deterministic.
  feel: 'feel',
  scared: 'feel',
  afraid: 'feel',
  calm: 'feel',
  tired: 'feel',
  hungry: 'feel',
  thirsty: 'feel',
};

const verbLex: Record<string, string> = {
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

  smell: 'smell',
  sniff: 'smell',
  inhale: 'smell',
  breathe: 'smell',

  listen: 'listen',
  hear: 'listen',

  touch: 'touch',
  feel: 'touch',
  rub: 'touch',
  poke: 'touch',

  taste: 'taste',
  lick: 'taste',

  close: 'close',
  shut: 'close',
  seal: 'close',

  open: 'open',
  pry: 'open',
  force: 'open',
  unseal: 'open',
  unlock: 'open',
  unbolt: 'open',
  jimmy: 'open',

  take: 'take',
  get: 'take',
  grab: 'take',
  pick: 'take',
  pocket: 'take',
  steal: 'take',

  use: 'use',
  wear: 'use',
  apply: 'use',
  insert: 'use',
  plug: 'use',
  attach: 'use',
  fit: 'use',

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

  start: 'start',
  run: 'start',
  ignite: 'start',
  activate: 'start',
  enable: 'start',
  power: 'start',
  turnon: 'start',

  break: 'break',
  smash: 'break',
  crack: 'break',
  shatter: 'break',

  climb: 'climb',
  scale: 'climb',
  ascend: 'climb',
  mount: 'climb',

  enter: 'enter',
  board: 'enter',
  getin: 'enter',
  goin: 'enter',

  talk: 'talk',
  ask: 'talk',
  speak: 'talk',
  say: 'talk',
  shout: 'talk',
  call: 'talk',

  search: 'search',
  rummage: 'search',
  sift: 'search',
  dig: 'search',

  scan: 'scan',
  analyze: 'scan',

  read: 'read',
  translate: 'read',
  decode: 'read',

  press: 'press',
  tap: 'press',
  hit: 'press',

  clean: 'clean',
  scrub: 'clean',
  wipe: 'clean',
  sweep: 'clean',

  approach: 'approach',
  walk: 'approach',
  go: 'approach',

  throw: 'throw',
  toss: 'throw',
  hurl: 'throw',

  kick: 'kick',

  jump: 'jump',
  hop: 'jump',

  wait: 'wait',
  rest: 'wait',
  pause: 'wait',
};

const prepLex: Record<string, string> = {
  in: 'in',
  into: 'in',
  inside: 'in',
  through: 'through',
  thru: 'through',
  around: 'around',
  at: 'at',
  on: 'at',
  below: 'below',
  down: 'below',
  under: 'below',
  above: 'above',
  over: 'above',
  with: 'with',
  to: 'to',
  from: 'from',
  near: 'near',
  behind: 'behind',
  between: 'between',
};

const nounLex: Record<string, string> = {
  // Base room-ish nouns
  area: 'area',
  room: 'area',
  bay: 'area',
  junkbay: 'area',
  'junk-bay': 'area',
  junk_bay: 'area',
  scene: 'area',

  air: 'air',
  atmosphere: 'air',

  wall: 'walls',
  walls: 'walls',
  ceiling: 'ceiling',
  light: 'lights',
  lights: 'lights',
  lamp: 'lights',
  grid: 'lights',
  ceilinglights: 'lights',

  shadow: 'shadows',
  shadows: 'shadows',

  slime: 'slime',
  goo: 'slime',
  ooze: 'slime',
  puddle: 'slime',

  rust: 'rust',
  corrosion: 'rust',

  debris: 'debris',
  scrap: 'debris',
  chunks: 'debris',
  metal: 'debris',
  fragments: 'debris',
  shards: 'debris',

  deck: 'deck',
  floor: 'deck',
  ground: 'deck',

  rubble: 'rubble',
  dirt: 'rubble',
  dust: 'rubble',
  grit: 'rubble',

  pipes: 'pipes',
  pipe: 'pipes',
  vents: 'vents',
  vent: 'vents',
  cables: 'cables',
  cable: 'cables',
  wire: 'cables',
  wires: 'cables',
  conduit: 'cables',
  conduits: 'cables',

  hum: 'soundSource',
  sound: 'soundSource',
  vibration: 'soundSource',
  buzz: 'soundSource',

  smell: 'smellSource',
  odor: 'smellSource',
  ozone: 'ozone',

  // From your screenshot description
  archway: 'archway',
  doorway: 'archway',
  gate: 'archway',
  passage: 'archway',
  corridor: 'archway',
  hall: 'archway',

  pillar: 'pillar',
  column: 'pillar',
  support: 'pillar',

  stains: 'stains',
  stain: 'stains',
  smear: 'stains',
  mark: 'stains',
  marks: 'stains',

  symbols: 'symbols',
  symbol: 'symbols',
  glyphs: 'symbols',
  glyph: 'symbols',
  code: 'symbols',
  writing: 'symbols',
  language: 'symbols',

  machine: 'machine',
  structure: 'machine',
  rig: 'machine',
  unit: 'machine',

  panel: 'panel',
  panels: 'panel',
  display: 'panel',
  screen: 'panel',
  console: 'panel',

  glow: 'glow',
  glowing: 'glow',
  lightbox: 'glow',
  indicator: 'glow',

  disc: 'redDisc',
  ring: 'redDisc',
  circle: 'redDisc',
  wheel: 'redDisc',
  reddisc: 'redDisc',
  'red-disc': 'redDisc',
  red_disc: 'redDisc',

  crate: 'blueCrate',
  box: 'blueCrate',
  bluebox: 'blueCrate',
  bluecrate: 'blueCrate',
  'blue-box': 'blueCrate',
  'blue-crate': 'blueCrate',

  cylinder: 'silverCylinder',
  canister: 'silverCylinder',
  tube: 'silverCylinder',
  cartridge: 'silverCylinder',
  capsule: 'silverCylinder',
  silvercylinder: 'silverCylinder',

  tab: 'metalTab',
  latch: 'metalTab',
  adapter: 'metalTab',
  notch: 'metalTab',

  // Legacy-ish nouns still supported
  door: 'door',
  hatch: 'door',
  window: 'pane',
  pane: 'pane',
  glass: 'pane',
  porthole: 'pane',

  pod: 'pod',
  escapepod: 'pod',
  'escape-pod': 'pod',
  escape_pod: 'pod',

  cryo: 'cryo',
  cryogenic: 'cryo',
  chamber: 'cryo',

  controls: 'controls',
  buttons: 'controls',
  lever: 'controls',

  motivator: 'motivator',
  artifact: 'motivator',
  device: 'motivator',
  warp: 'motivator',

  plug: 'plug',
  connector: 'plug',
  socket: 'plug',
  prongs: 'plug',
};

const adjLex: Record<string, string> = {
  sealed: 'sealed',
  locked: 'locked',
  dark: 'dark',
  black: 'dark',
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
  metallic: 'metallic',
  industrial: 'industrial',
  abandoned: 'abandoned',
  futuristic: 'futuristic',
};

/* =========================
 * Replies
 * ========================= */

const replies = {
  greet: 'You are alone in a junk bay. The greeting is noted anyway.',
  thanks: 'You are welcome. The bay remains unimpressed.',
  help:
    'Try: look, examine, search, scan, read, smell, listen, touch, take, use, press, clean, open, enter, talk, inventory. ' +
    'Ask about the archway, the machine, the symbols, the stains, the red disc, the blue box, or Roger.',
  statusPrefix: 'Status:',
  inventoryEmpty: 'You have nothing. Not even dignity. Just pockets.',
  inventoryPrefix: 'Inventory:',
  empty:
    'Say something. The bay is dark-blue, industrial, and stubbornly uninterested in your silence.',

  lookAreaA:
    'A dark-blue industrial bay. Rubble and metal fragments on the floor. A red disc, a blue box with a cylinder on it, ' +
    'a powered machine on the left with a blue glow, and an archway on the right that leads somewhere worse.',
  lookAreaB:
    'You are in a gritty junk bay with blue walls and a cold ceiling grid. Stains and symbols mark the back wall. ' +
    'Scrap and rubble underfoot. An archway to the right. A powered machine to the left.',
  lookWalls:
    'The walls are blue and worn, lined horizontally like a cheap attempt at order. Stains and old scuffs argue with that.',
  lookCeiling:
    'Ceiling lights in a grid. Pipes and conduits threaded above like bad veins. The light is cold and unhelpful.',
  lookLightsWorking:
    'The ceiling grid lights hold steady. Just enough illumination to make the mess feel intentional.',
  lookLightsDead:
    'The lights are too dim to trust. The bay gives you silhouettes and doubt.',
  lookLightsFlicker:
    'The ceiling grid lights flicker with a tired rhythm. The room never gets fully dark, but it keeps threatening.',
  lookShadows:
    'Shadows pool under scrap and along the edges of the archway. Nothing moves, but you still watch them.',
  lookDeck:
    'The floor is a mix of grit and metal, like someone paved a disaster with welded plates.',
  lookRubble:
    'Grit, fragments, and small sharp lies. The kind of ground that punishes bare hands and rewards persistence.',
  lookDebris:
    'Broken components and scrap metal. Some pieces look like they were once important. Now they are just geometry.',
  lookPipes:
    'Old pipes. They look pressurized in the way a bad mood is pressurized.',
  lookVents:
    'Vents clogged with dust and industrial lint. Air still moves, reluctantly.',
  lookCables:
    'Loose cables snake around the edges. They look like they were unplugged in a hurry.',
  lookStains:
    'Green and orange stains streak the wall like chemical bruises. They are old enough to be part of the decor.',
  lookSymbols:
    'The wall markings look like compressed technical notes and warnings. Not decorative. More like triage.',
  lookPillar:
    'A central pillar divides the back wall. Practical, boring, and probably full of conduits.',
  lookArchway:
    'A blue archway frames a darker passage beyond. It looks like the only honest exit in the room.',
  lookMachine:
    'On the left, a bulky machine with multiple panels. A blue square glows in its center. A side coupling ' +
    'looks like it expects a cartridge and a latch.',
  lookPanel:
    'A wall panel sits flush with the plating. It has seams, faint scuffs, and the vibe of a system that punishes guessing.',
  lookGlow:
    'The blue glow is steady. It says power exists. It does not promise cooperation.',
  lookRedDisc:
    'A red circular component lies on the floor. Heavy-looking, precise-looking, and exactly the wrong color to ignore.',
  lookBlueCrate:
    'A blue square object sits among the rubble. Its casing is scuffed, but its edges are too clean to be pure trash.',
  lookSilverCylinder:
    'A silver cylinder rests on the blue box like a cartridge. It looks like it belongs in a socket.',
  lookSlimePresent:
    'A slick smear of grime glistens on the floor. It looks harmless until you imagine its hobbies.',
  lookSlimeAbsent:
    'No slime jumps out at you, but the bay still manages to feel dirty on principle.',

  smellMetal:
    'Cold metal, old dust, and stale machinery. The bay smells like work that never ends.',
  smellOzone:
    'Under the metal stink is a hint of ozone, like electrics warming dust.',
  listenHum:
    'A distant low hum and the faint tick of stressed lights. Big systems are running somewhere, for their own reasons.',
  listenQuiet:
    'Quiet enough that your breathing sounds loud. You do not like that.',
  touchColdMetal:
    'Cold metal. It steals heat from your fingers like it has been waiting.',
  touchRubble:
    'Grit and sharp fragments. You can feel how easy it would be to bleed for no reward.',
  touchPanel:
    'Cool and slightly tacky with grime. It feels like it has been hit in panic before.',
  touchSlime:
    'Slick, unpleasant, and instantly regrettable. You now know too much about it.',
  tasteNo: 'No. Absolutely not.',
  waitA: 'You wait. The bay waits back. Neither of you improves.',
  waitB:
    'You pause. The hum continues. Whatever comes next is still your problem.',
  jump: 'You jump. Gravity accepts this with a shrug. Nothing improves.',
  kickAir: 'You kick at the air. The air wins by not caring.',

  pressPanelDead:
    'You press around the panel seams. Nothing changes. Either it is locked out, or it is waiting for a condition.',
  pressPanelBeep:
    'A dull beep. Not a welcome, more like an acknowledgment that you exist.',
  readSymbolsFail:
    'You try to read the symbols. They are technical, compressed, and meant for someone trained and caffeinated.',
  readSymbolsSuccess:
    'You piece together a gist: power routing, a magnetic coupling note, and a service passage hint pointing through the archway.',
  scanMachine:
    'Powered, stable, missing at least one part. The coupling is the weak point. The glow is the only friendly liar here.',
  cleanWall:
    'You wipe at the stains. They smear, the color remains. You have improved nothing, just redistributed it.',
  cleanFloor:
    'You sweep aside grit with your foot. You uncover more grit. The bay is committed to itself.',

  takeRedDisc:
    'You pick up the red disc. It is heavier than it looks. You now have a very practical argument.',
  takeCylinder:
    'You take the silver cylinder. It clicks loose with suspicious ease.',
  takeBlueCrate:
    'You try to lift the blue box. It does not move. Bolted down or just hateful.',
  takeNothing:
    'You find nothing you can reasonably take without starting a new and worse problem.',
  searchFoundTab:
    'You sift through rubble and find a small metal tab with a notch, like it belongs to a latch mechanism. You keep it.',
  searchNothing:
    'You rummage and find grit, shards, and regret. Nothing useful.',
  throwDisc:
    'You throw the red disc. It clatters loudly, rolls, and stops against debris. Nothing attacks you. Yet.',
  kickRubble:
    'You kick rubble. It scatters and reveals nothing you wanted. The bay stays consistent.',

  useCylinderOnPanel:
    'You seat the cylinder against the panel edge. It chirps, and the blue glow steadies. Something just changed.',
  useCylinderOnMachineFail:
    'You try fitting the cylinder into the machine coupling. Close, but not right. It needs a latch or adapter.',
  useTabOnMachineSuccess:
    'You fit the metal tab into the coupling as a latch. The cylinder seats cleanly. The machine hum deepens and the glow steadies.',
  useTabMissing: 'You do not have anything latch-like to make that work.',
  useNothing:
    'You try, but nothing here cooperates. The bay is not impressed by initiative.',

  approachArchway:
    'You move toward the archway. Air beyond is cooler, and the lighting is worse. That is usually how progress feels.',
  enterArchwayBlocked:
    'You step toward the archway, then stop. The darkness beyond reads as trap. You can still go, but it will not be smart.',
  enterArchwaySafe:
    'You pass through the archway, following the service passage hint. The darkness does not immediately punish you. Progress.',
  talkGeneral: 'You talk. The bay listens with all the empathy of scrap metal.',
  talkRogerUnavailable:
    'Roger is not available for conversation right now. If he wakes up, it will probably be because something has already gone wrong.',

  rogerWho:
    'Roger Wilco is a Xenonian space janitor who keeps stumbling into crises he is not trained for, and keeps surviving anyway.',
  rogerPattern:
    'He survives by moving, scavenging, and improvising. He slips through gaps, sabotages what matters, and runs before anyone notices.',
  rogerStatusNow:
    'Right now he is alone in an escape pod, asleep in a cryogenic chamber, drifting until something finds him. Nobody is coming with a parade.',
  rogerPastArcada:
    'He was a low-ranking custodian on a research ship when invaders seized it and stole a catastrophic device. He escaped seconds before the ship was destroyed.',
  rogerPastKerona:
    'He crash-landed on a barren world, got hunted, and scraped together tools and transport by taking desperate jobs and making them work.',
  rogerPastVohaul:
    'He was abducted as punishment for interfering with a previous plot. He escaped a labor-planet disaster, infiltrated a base, and ended the threat by sabotaging life support.',
  rogerMood:
    'Roger is not a confident hero. He is persistent, anxious, and stubbornly alive. Courage shows up when panic stops being useful.',
};

/* =========================
 * Rules
 * ========================= */

function isQa(raw: string): boolean {
  if (/\bqa\b/i.test(raw)) return true;
  if (/\bq\s*\/?\s*a\b/i.test(raw)) return true;
  if (/\bqa[-_\s]?o[-_\s]?matic\b/i.test(raw)) return true;
  return false;
}

function reply(ruleId: string, text: string): MatchResult {
  return { kind: 'reply', text, ruleId };
}

function pickTarget(p: Parse): string | null {
  const order = [
    'archway',
    'machine',
    'panel',
    'glow',
    'symbols',
    'stains',
    'pillar',
    'redDisc',
    'blueCrate',
    'silverCylinder',
    'metalTab',
    'slime',
    'rubble',
    'debris',
    'deck',
    'walls',
    'ceiling',
    'lights',
    'shadows',
    'pipes',
    'vents',
    'cables',
    'air',
    'area',
    'pod',
    'door',
    'pane',
    'controls',
    'cryo',
    'motivator',
    'plug',
  ];
  for (const t of order) if (p.nouns.has(t)) return t;
  if (p.person.has('roger')) return 'roger';
  return null;
}

function renderTarget(t: string): string {
  if (t === 'roger') return 'Roger Wilco';
  if (t === 'redDisc') return 'the red disc';
  if (t === 'blueCrate') return 'the blue box';
  if (t === 'silverCylinder') return 'the silver cylinder';
  if (t === 'metalTab') return 'the metal tab';
  return `the ${t}`;
}

const rules: Rule[] = [
  // QA passthrough (kept)
  {
    id: 'qa.entry',
    priority: 3000,
    match: (_p, raw) => isQa(raw),
    action: (_p, _raw, ctx) => {
      if (!ctx.global200) {
        return {
          kind: 'pass',
          reason: 'QA disabled, allow other handlers',
          ruleId: 'qa.entry',
        };
      }
      return reply(
        'qa.entry',
        'QA is not wired to a menu here. Say "help" for commands.',
      );
    },
  },

  // Social
  {
    id: 'social.greet',
    priority: 2900,
    match: (p) => p.intents.has('greet'),
    action: () => reply('social.greet', replies.greet),
  },
  {
    id: 'social.thanks',
    priority: 2890,
    match: (p) => p.intents.has('thanks'),
    action: () => reply('social.thanks', replies.thanks),
  },
  {
    id: 'system.help',
    priority: 2880,
    match: (p) => p.intents.has('help'),
    action: () => reply('system.help', replies.help),
  },

  // Inventory / status
  {
    id: 'system.inventory',
    priority: 2870,
    match: (p) => p.intents.has('inventory'),
    action: (_p, _raw, ctx) => {
      const inv = ctx.inventory ?? new Set<string>();
      if (inv.size === 0)
        return reply('system.inventory', replies.inventoryEmpty);
      const items = [...inv.values()].sort();
      return reply(
        'system.inventory',
        `${replies.inventoryPrefix} ${items.join(', ')}`,
      );
    },
  },
  {
    id: 'system.status',
    priority: 2860,
    match: (p) => p.intents.has('status'),
    action: (_p, _raw, ctx, flags) => {
      const parts: string[] = [];
      parts.push(flags.lightsWorking ? 'lights: on' : 'lights: dim');
      if (flags.lightsFlickering) parts.push('lights: flicker');
      parts.push(flags.ambientHum ? 'hum: yes' : 'hum: no');
      parts.push(flags.slimePresent ? 'slime: yes' : 'slime: no');
      parts.push(flags.archwayOpen ? 'archway: open' : 'archway: closed');
      parts.push(flags.archwaySafe ? 'archway: safer' : 'archway: risky');
      parts.push(flags.panelUnlocked ? 'panel: responsive' : 'panel: stubborn');
      parts.push(
        flags.machineRepaired ? 'machine: latched' : 'machine: missing latch',
      );
      parts.push(`focus: ${ctx.lastFocus ?? 'none'}`);
      return reply(
        'system.status',
        `${replies.statusPrefix} ${parts.join(', ')}`,
      );
    },
  },

  // Where am I
  {
    id: 'scene.askWhere',
    priority: 2850,
    match: (p) =>
      p.intents.has('ask') && (p.all.has('where') || p.pronouns.has('here')),
    action: (_p, _raw, ctx) => {
      ctx.lastFocus = 'area';
      return reply(
        'scene.askWhere',
        pickVariant(ctx, 'lookArea', [replies.lookAreaA, replies.lookAreaB]),
      );
    },
  },

  // LOOK: high-level
  {
    id: 'scene.lookAround',
    priority: 2000,
    match: (p) =>
      p.intents.has('look') &&
      (p.nouns.has('area') || p.preps.has('around') || p.pronouns.has('here')),
    action: (_p, _raw, ctx) => {
      ctx.lastFocus = 'area';
      return reply(
        'scene.lookAround',
        pickVariant(ctx, 'lookArea', [replies.lookAreaA, replies.lookAreaB]),
      );
    },
  },

  // LOOK: scene elements
  {
    id: 'scene.lookWalls',
    priority: 1990,
    match: (p) => p.intents.has('look') && p.nouns.has('walls'),
    action: (_p, _raw, ctx) => {
      ctx.lastFocus = 'walls';
      return reply('scene.lookWalls', replies.lookWalls);
    },
  },
  {
    id: 'scene.lookCeiling',
    priority: 1989,
    match: (p) => p.intents.has('look') && p.nouns.has('ceiling'),
    action: (_p, _raw, ctx) => {
      ctx.lastFocus = 'ceiling';
      return reply('scene.lookCeiling', replies.lookCeiling);
    },
  },
  {
    id: 'scene.lookLightsFlicker',
    priority: 1988,
    match: (p) =>
      p.intents.has('look') && p.nouns.has('lights') && p.adjs.has('flicker'),
    action: (_p, _raw, ctx, flags) => {
      ctx.lastFocus = 'lights';
      return reply(
        scene.lookLightsFlicker,
        flags.lightsFlickering
          ? replies.lookLightsFlicker
          : flags.lightsWorking
            ? replies.lookLightsWorking
            : replies.lookLightsDead,
      );
    },
  },
  {
    id: 'scene.lookLights',
    priority: 1987,
    match: (p) => p.intents.has('look') && p.nouns.has('lights'),
    action: (_p, _raw, ctx, flags) => {
      ctx.lastFocus = 'lights';
      return reply(
        'scene.lookLights',
        flags.lightsWorking
          ? replies.lookLightsWorking
          : replies.lookLightsDead,
      );
    },
  },
  {
    id: 'scene.lookShadows',
    priority: 1986,
    match: (p) => p.intents.has('look') && p.nouns.has('shadows'),
    action: (_p, _raw, ctx) => {
      ctx.lastFocus = 'shadows';
      return reply('scene.lookShadows', replies.lookShadows);
    },
  },
  {
    id: 'scene.lookDeck',
    priority: 1985,
    match: (p) => p.intents.has('look') && p.nouns.has('deck'),
    action: (_p, _raw, ctx) => {
      ctx.lastFocus = 'deck';
      return reply('scene.lookDeck', replies.lookDeck);
    },
  },
  {
    id: 'scene.lookRubble',
    priority: 1984,
    match: (p) => p.intents.has('look') && p.nouns.has('rubble'),
    action: (_p, _raw, ctx) => {
      ctx.lastFocus = 'rubble';
      return reply('scene.lookRubble', replies.lookRubble);
    },
  },
  {
    id: 'scene.lookDebris',
    priority: 1983,
    match: (p) => p.intents.has('look') && p.nouns.has('debris'),
    action: (_p, _raw, ctx) => {
      ctx.lastFocus = 'debris';
      return reply('scene.lookDebris', replies.lookDebris);
    },
  },
  {
    id: 'scene.lookPipes',
    priority: 1982,
    match: (p) => p.intents.has('look') && p.nouns.has('pipes'),
    action: (_p, _raw, ctx) => {
      ctx.lastFocus = 'pipes';
      return reply('scene.lookPipes', replies.lookPipes);
    },
  },
  {
    id: 'scene.lookVents',
    priority: 1981,
    match: (p) => p.intents.has('look') && p.nouns.has('vents'),
    action: (_p, _raw, ctx) => {
      ctx.lastFocus = 'vents';
      return reply('scene.lookVents', replies.lookVents);
    },
  },
  {
    id: 'scene.lookCables',
    priority: 1980,
    match: (p) => p.intents.has('look') && p.nouns.has('cables'),
    action: (_p, _raw, ctx) => {
      ctx.lastFocus = 'cables';
      return reply('scene.lookCables', replies.lookCables);
    },
  },
  {
    id: 'scene.lookStains',
    priority: 1979,
    match: (p) => p.intents.has('look') && p.nouns.has('stains'),
    action: (_p, _raw, ctx, flags) => {
      ctx.lastFocus = 'stains';
      if (!flags.wallHasStains)
        return reply(
          'scene.lookStains',
          'You do not see stains anymore. That is suspicious.',
        );
      return reply('scene.lookStains', replies.lookStains);
    },
  },
  {
    id: 'scene.lookSymbols',
    priority: 1978,
    match: (p) => p.intents.has('look') && p.nouns.has('symbols'),
    action: (_p, _raw, ctx, flags) => {
      ctx.lastFocus = 'symbols';
      if (!flags.wallHasSymbols)
        return reply('scene.lookSymbols', 'No markings worth calling symbols.');
      return reply('scene.lookSymbols', replies.lookSymbols);
    },
  },
  {
    id: 'scene.lookPillar',
    priority: 1977,
    match: (p) => p.intents.has('look') && p.nouns.has('pillar'),
    action: (_p, _raw, ctx) => {
      ctx.lastFocus = 'pillar';
      return reply('scene.lookPillar', replies.lookPillar);
    },
  },
  {
    id: 'scene.lookArchway',
    priority: 1976,
    match: (p) => p.intents.has('look') && p.nouns.has('archway'),
    action: (_p, _raw, ctx) => {
      ctx.lastFocus = 'archway';
      return reply('scene.lookArchway', replies.lookArchway);
    },
  },
  {
    id: 'scene.lookMachine',
    priority: 1975,
    match: (p) => p.intents.has('look') && p.nouns.has('machine'),
    action: (_p, _raw, ctx) => {
      ctx.lastFocus = 'machine';
      return reply('scene.lookMachine', replies.lookMachine);
    },
  },
  {
    id: 'scene.lookPanel',
    priority: 1974,
    match: (p) =>
      p.intents.has('look') &&
      (p.nouns.has('panel') || p.nouns.has('controls')),
    action: (_p, _raw, ctx) => {
      ctx.lastFocus = 'panel';
      return reply('scene.lookPanel', replies.lookPanel);
    },
  },
  {
    id: 'scene.lookGlow',
    priority: 1973,
    match: (p) => p.intents.has('look') && p.nouns.has('glow'),
    action: (_p, _raw, ctx) => {
      ctx.lastFocus = 'glow';
      return reply('scene.lookGlow', replies.lookGlow);
    },
  },
  {
    id: 'scene.lookRedDisc',
    priority: 1972,
    match: (p) => p.intents.has('look') && p.nouns.has('redDisc'),
    action: (_p, _raw, ctx, flags) => {
      ctx.lastFocus = 'redDisc';
      if (!flags.hasRedDisc && !(ctx.inventory?.has('red disc') ?? false)) {
        return reply(
          'scene.lookRedDisc',
          'You do not see the red disc anymore.',
        );
      }
      return reply('scene.lookRedDisc', replies.lookRedDisc);
    },
  },
  {
    id: 'scene.lookBlueCrate',
    priority: 1971,
    match: (p) => p.intents.has('look') && p.nouns.has('blueCrate'),
    action: (_p, _raw, ctx, flags) => {
      ctx.lastFocus = 'blueCrate';
      if (!flags.hasBlueCrate)
        return reply(
          'scene.lookBlueCrate',
          'You do not see the blue box anymore.',
        );
      return reply('scene.lookBlueCrate', replies.lookBlueCrate);
    },
  },
  {
    id: 'scene.lookSilverCylinder',
    priority: 1970,
    match: (p) => p.intents.has('look') && p.nouns.has('silverCylinder'),
    action: (_p, _raw, ctx, flags) => {
      ctx.lastFocus = 'silverCylinder';
      if (
        !flags.hasSilverCylinder &&
        !(ctx.inventory?.has('silver cylinder') ?? false)
      ) {
        return reply(
          'scene.lookSilverCylinder',
          'You do not see the silver cylinder anymore.',
        );
      }
      return reply('scene.lookSilverCylinder', replies.lookSilverCylinder);
    },
  },
  {
    id: 'scene.lookSlime',
    priority: 1969,
    match: (p) => p.intents.has('look') && p.nouns.has('slime'),
    action: (_p, _raw, ctx, flags) => {
      ctx.lastFocus = 'slime';
      return reply(
        'scene.lookSlime',
        flags.slimePresent ? replies.lookSlimePresent : replies.lookSlimeAbsent,
      );
    },
  },

  // SMELL / LISTEN / TOUCH / TASTE
  {
    id: 'scene.smellOzone',
    priority: 1890,
    match: (p) =>
      p.intents.has('smell') &&
      (p.nouns.has('ozone') || p.all.has('electric') || p.all.has('burnt')),
    action: (_p, _raw, ctx) => {
      ctx.lastFocus = 'air';
      return reply('scene.smellOzone', replies.smellOzone);
    },
  },
  {
    id: 'scene.smellGeneral',
    priority: 1889,
    match: (p) => p.intents.has('smell'),
    action: (_p, _raw, ctx) => {
      ctx.lastFocus = 'air';
      return reply('scene.smellGeneral', replies.smellMetal);
    },
  },
  {
    id: 'scene.listen',
    priority: 1888,
    match: (p) => p.intents.has('listen') || p.nouns.has('soundSource'),
    action: (_p, _raw, ctx, flags) => {
      ctx.lastFocus = 'soundSource';
      return reply(
        'scene.listen',
        flags.ambientHum ? replies.listenHum : replies.listenQuiet,
      );
    },
  },
  {
    id: 'scene.touchSlime',
    priority: 1887,
    match: (p) => p.intents.has('touch') && p.nouns.has('slime'),
    action: (_p, _raw, ctx) => {
      ctx.lastFocus = 'slime';
      return reply('scene.touchSlime', replies.touchSlime);
    },
  },
  {
    id: 'scene.touchRubble',
    priority: 1886,
    match: (p) => p.intents.has('touch') && p.nouns.has('rubble'),
    action: (_p, _raw, ctx) => {
      ctx.lastFocus = 'rubble';
      return reply('scene.touchRubble', replies.touchRubble);
    },
  },
  {
    id: 'scene.touchPanel',
    priority: 1885,
    match: (p) =>
      p.intents.has('touch') &&
      (p.nouns.has('panel') || p.nouns.has('controls')),
    action: (_p, _raw, ctx) => {
      ctx.lastFocus = 'panel';
      return reply('scene.touchPanel', replies.touchPanel);
    },
  },
  {
    id: 'scene.touchGeneral',
    priority: 1884,
    match: (p) => p.intents.has('touch'),
    action: (_p, _raw, ctx) => {
      ctx.lastFocus = pickTarget(_p) ?? ctx.lastFocus ?? 'deck';
      return reply('scene.touchGeneral', replies.touchColdMetal);
    },
  },
  {
    id: 'scene.taste',
    priority: 1883,
    match: (p) => p.intents.has('taste'),
    action: () => reply('scene.taste', replies.tasteNo),
  },

  // WAIT / JUMP / KICK / THROW
  {
    id: 'scene.wait',
    priority: 1875,
    match: (p) => p.intents.has('wait'),
    action: (_p, _raw, ctx) =>
      reply(
        'scene.wait',
        pickVariant(ctx, 'wait', [replies.waitA, replies.waitB]),
      ),
  },
  {
    id: 'scene.jump',
    priority: 1874,
    match: (p) => p.intents.has('jump'),
    action: () => reply('scene.jump', replies.jump),
  },
  {
    id: 'scene.kickRubble',
    priority: 1873,
    match: (p) =>
      p.intents.has('kick') &&
      (p.nouns.has('rubble') || p.nouns.has('debris') || p.nouns.has('deck')),
    action: () => reply('scene.kickRubble', replies.kickRubble),
  },
  {
    id: 'scene.kickGeneral',
    priority: 1872,
    match: (p) => p.intents.has('kick'),
    action: () => reply('scene.kickGeneral', replies.kickAir),
  },
  {
    id: 'scene.throwDisc',
    priority: 1871,
    match: (p) =>
      p.intents.has('throw') &&
      (p.nouns.has('redDisc') || p.all.has('disc') || p.all.has('ring')),
    action: (_p, _raw, ctx, flags) => {
      const hasDisc =
        (ctx.inventory?.has('red disc') ?? false) ||
        (flags.hasRedDisc ?? false);
      if (!hasDisc)
        return reply(
          'scene.throwDisc',
          'You cannot throw what you do not have.',
        );
      if (ctx.inventory?.has('red disc')) ctx.inventory.delete('red disc');
      flags.hasRedDisc = true;
      ctx.lastFocus = 'redDisc';
      return reply('scene.throwDisc', replies.throwDisc);
    },
  },
  {
    id: 'scene.throwGeneral',
    priority: 1870,
    match: (p) => p.intents.has('throw'),
    action: () =>
      reply(
        'scene.throwGeneral',
        'You mime throwing something. It is not as satisfying as throwing something real.',
      ),
  },

  // SEARCH / SCAN / READ / PRESS / CLEAN
  {
    id: 'scene.searchFloor',
    priority: 1860,
    match: (p) =>
      p.intents.has('search') &&
      (p.nouns.has('rubble') || p.nouns.has('deck') || p.nouns.has('debris')),
    action: (_p, _raw, ctx) => {
      ctx.lastFocus = 'rubble';
      const k = ctx.knowledge ?? new Set<string>();
      ctx.knowledge = k;
      if (!k.has('foundMetalTab')) {
        k.add('foundMetalTab');
        ctx.inventory?.add('metal tab');
        return reply('scene.searchFloor', replies.searchFoundTab);
      }
      return reply('scene.searchFloor', replies.searchNothing);
    },
  },
  {
    id: 'scene.searchGeneral',
    priority: 1859,
    match: (p) => p.intents.has('search'),
    action: () =>
      reply(
        'scene.searchGeneral',
        'You search. Pick a target: rubble, debris, machine, panel, archway.',
      ),
  },
  {
    id: 'scene.scanMachine',
    priority: 1858,
    match: (p) =>
      p.intents.has('scan') && (p.nouns.has('machine') || p.all.has('left')),
    action: (_p, _raw, ctx, flags) => {
      ctx.lastFocus = 'machine';
      if (!flags.leftMachinePowered)
        return reply(
          'scene.scanMachine',
          'The machine looks inert. No glow, no hum, no help.',
        );
      ctx.knowledge?.add('machineScanned');
      return reply('scene.scanMachine', replies.scanMachine);
    },
  },
  {
    id: 'scene.scanGeneral',
    priority: 1857,
    match: (p) => p.intents.has('scan'),
    action: () =>
      reply(
        'scene.scanGeneral',
        'You scan with your eyes because you do not have an actual scanner.',
      ),
  },
  {
    id: 'scene.readSymbols',
    priority: 1856,
    match: (p) => p.intents.has('read') && p.nouns.has('symbols'),
    action: (_p, _raw, ctx, flags) => {
      ctx.lastFocus = 'symbols';
      if (!flags.wallHasSymbols)
        return reply('scene.readSymbols', 'There is nothing to read here.');
      const k = ctx.knowledge ?? new Set<string>();
      ctx.knowledge = k;
      if (!k.has('symbolsDecoded')) {
        k.add('symbolsDecoded');
        return reply('scene.readSymbols', replies.readSymbolsFail);
      }
      flags.archwaySafe = true;
      return reply('scene.readSymbols', replies.readSymbolsSuccess);
    },
  },
  {
    id: 'scene.readGeneral',
    priority: 1855,
    match: (p) => p.intents.has('read'),
    action: () =>
      reply(
        'scene.readGeneral',
        'There is not much to read that wants to be understood. Try the symbols.',
      ),
  },
  {
    id: 'scene.pressPanel',
    priority: 1854,
    match: (p) =>
      p.intents.has('press') &&
      (p.nouns.has('panel') || p.nouns.has('controls')),
    action: (_p, _raw, ctx, flags) => {
      ctx.lastFocus = 'panel';
      const hasCylinder = ctx.inventory?.has('silver cylinder') ?? false;
      if (!flags.panelUnlocked && !hasCylinder)
        return reply('scene.pressPanel', replies.pressPanelDead);
      flags.panelUnlocked = true;
      return reply('scene.pressPanel', replies.pressPanelBeep);
    },
  },
  {
    id: 'scene.pressGeneral',
    priority: 1853,
    match: (p) => p.intents.has('press'),
    action: () =>
      reply(
        'scene.pressGeneral',
        'You press at random. The room does not reward that. Try the panel.',
      ),
  },
  {
    id: 'scene.cleanWall',
    priority: 1852,
    match: (p) =>
      p.intents.has('clean') && (p.nouns.has('walls') || p.nouns.has('stains')),
    action: (_p, _raw, ctx) => {
      ctx.lastFocus = 'stains';
      return reply('scene.cleanWall', replies.cleanWall);
    },
  },
  {
    id: 'scene.cleanFloor',
    priority: 1851,
    match: (p) =>
      p.intents.has('clean') && (p.nouns.has('deck') || p.nouns.has('rubble')),
    action: (_p, _raw, ctx) => {
      ctx.lastFocus = 'deck';
      return reply('scene.cleanFloor', replies.cleanFloor);
    },
  },
  {
    id: 'scene.cleanGeneral',
    priority: 1850,
    match: (p) => p.intents.has('clean'),
    action: () =>
      reply(
        'scene.cleanGeneral',
        'You attempt to clean. The bay offers you more work.',
      ),
  },

  // APPROACH / ENTER archway
  {
    id: 'scene.approachArchway',
    priority: 1840,
    match: (p) => p.intents.has('approach') && p.nouns.has('archway'),
    action: (_p, _raw, ctx, flags) => {
      ctx.lastFocus = 'archway';
      if (!flags.archwayOpen)
        return reply(
          'scene.approachArchway',
          'You approach. It is sealed. The bay wins.',
        );
      return reply('scene.approachArchway', replies.approachArchway);
    },
  },
  {
    id: 'scene.enterArchway',
    priority: 1839,
    match: (p) => p.intents.has('enter') && p.nouns.has('archway'),
    action: (_p, _raw, ctx, flags) => {
      ctx.lastFocus = 'archway';
      if (!flags.archwayOpen)
        return reply(
          'scene.enterArchway',
          'You try to go through. It is closed.',
        );
      if (flags.archwaySafe)
        return reply('scene.enterArchway', replies.enterArchwaySafe);
      return reply('scene.enterArchway', replies.enterArchwayBlocked);
    },
  },

  // TAKE items
  {
    id: 'scene.takeRedDisc',
    priority: 1820,
    match: (p) => p.intents.has('take') && p.nouns.has('redDisc'),
    action: (_p, _raw, ctx, flags) => {
      ctx.lastFocus = 'redDisc';
      if (!flags.hasRedDisc)
        return reply('scene.takeRedDisc', 'You do not see a red disc to take.');
      ctx.inventory?.add('red disc');
      flags.hasRedDisc = false;
      return reply('scene.takeRedDisc', replies.takeRedDisc);
    },
  },
  {
    id: 'scene.takeSilverCylinder',
    priority: 1819,
    match: (p) => p.intents.has('take') && p.nouns.has('silverCylinder'),
    action: (_p, _raw, ctx, flags) => {
      ctx.lastFocus = 'silverCylinder';
      if (!flags.hasSilverCylinder)
        return reply(
          'scene.takeSilverCylinder',
          'You do not see the silver cylinder.',
        );
      ctx.inventory?.add('silver cylinder');
      flags.hasSilverCylinder = false;
      return reply('scene.takeSilverCylinder', replies.takeCylinder);
    },
  },
  {
    id: 'scene.takeMetalTab',
    priority: 1818,
    match: (p) => p.intents.has('take') && p.nouns.has('metalTab'),
    action: (_p, _raw, ctx) => {
      ctx.lastFocus = 'metalTab';
      if (ctx.inventory?.has('metal tab'))
        return reply('scene.takeMetalTab', 'You already have the metal tab.');
      if (ctx.knowledge?.has('foundMetalTab')) {
        ctx.inventory?.add('metal tab');
        return reply(
          'scene.takeMetalTab',
          'You take the metal tab. It looks like a latch piece.',
        );
      }
      return reply(
        'scene.takeMetalTab',
        'You do not see any metal tab to take.',
      );
    },
  },
  {
    id: 'scene.takeBlueCrate',
    priority: 1817,
    match: (p) => p.intents.has('take') && p.nouns.has('blueCrate'),
    action: (_p, _raw, ctx) => {
      ctx.lastFocus = 'blueCrate';
      return reply('scene.takeBlueCrate', replies.takeBlueCrate);
    },
  },
  {
    id: 'scene.takeGeneric',
    priority: 1810,
    match: (p) => p.intents.has('take'),
    action: () => reply('scene.takeGeneric', replies.takeNothing),
  },

  // USE: progression path
  {
    id: 'scene.useCylinderOnPanel',
    priority: 1800,
    match: (p) =>
      p.intents.has('use') &&
      p.nouns.has('silverCylinder') &&
      (p.nouns.has('panel') || p.nouns.has('controls')),
    action: (_p, _raw, ctx, flags) => {
      ctx.lastFocus = 'panel';
      const hasCylinder = ctx.inventory?.has('silver cylinder') ?? false;
      if (!hasCylinder)
        return reply(
          'scene.useCylinderOnPanel',
          'You do not have a silver cylinder.',
        );
      flags.panelUnlocked = true;
      flags.blueGlowActive = true;
      ctx.knowledge?.add('panelAcceptedCylinder');
      return reply('scene.useCylinderOnPanel', replies.useCylinderOnPanel);
    },
  },
  {
    id: 'scene.useCylinderOnMachine',
    priority: 1799,
    match: (p) =>
      p.intents.has('use') &&
      p.nouns.has('silverCylinder') &&
      (p.nouns.has('machine') || p.all.has('left')),
    action: (_p, _raw, ctx, flags) => {
      ctx.lastFocus = 'machine';
      const hasCylinder = ctx.inventory?.has('silver cylinder') ?? false;
      if (!hasCylinder)
        return reply(
          'scene.useCylinderOnMachine',
          'You do not have a silver cylinder.',
        );
      if (!flags.leftMachinePowered)
        return reply(
          'scene.useCylinderOnMachine',
          'The machine is not powered. The coupling is dead.',
        );
      if (!ctx.inventory?.has('metal tab'))
        return reply(
          'scene.useCylinderOnMachine',
          replies.useCylinderOnMachineFail,
        );
      // If they have the tab, guide them to use it explicitly (deterministic gating).
      return reply(
        'scene.useCylinderOnMachine',
        'The cylinder wants a latch. Try using the metal tab on the machine.',
      );
    },
  },
  {
    id: 'scene.useTabOnMachine',
    priority: 1798,
    match: (p) =>
      p.intents.has('use') && p.nouns.has('metalTab') && p.nouns.has('machine'),
    action: (_p, _raw, ctx, flags) => {
      ctx.lastFocus = 'machine';
      if (!ctx.inventory?.has('metal tab'))
        return reply('scene.useTabOnMachine', replies.useTabMissing);
      const hasCylinder = ctx.inventory?.has('silver cylinder') ?? false;
      if (!hasCylinder)
        return reply(
          'scene.useTabOnMachine',
          'You latch the coupling, but there is no cylinder to seat.',
        );
      flags.machineRepaired = true;
      flags.blueGlowActive = true;
      ctx.knowledge?.add('machineLatched');
      return reply('scene.useTabOnMachine', replies.useTabOnMachineSuccess);
    },
  },
  {
    id: 'scene.useGeneral',
    priority: 1790,
    match: (p) => p.intents.has('use'),
    action: (_p, raw, ctx) => {
      // If they said "use it" without object, try lastFocus hint.
      if (ctx.lastFocus) {
        return reply(
          'scene.useGeneral',
          `Use ${renderTarget(ctx.lastFocus)} how? Try "use X on Y".`,
        );
      }
      return reply(
        'scene.useGeneral',
        `You try "${raw}". Nothing here is cooperating.`,
      );
    },
  },

  // TALK
  {
    id: 'scene.talkRoger',
    priority: 1700,
    match: (p) => p.intents.has('talk') && p.person.has('roger'),
    action: (_p, _raw, ctx) => {
      ctx.lastFocus = 'roger';
      return reply('scene.talkRoger', replies.talkRogerUnavailable);
    },
  },
  {
    id: 'scene.talkGeneral',
    priority: 1699,
    match: (p) => p.intents.has('talk'),
    action: () => reply('scene.talkGeneral', replies.talkGeneral),
  },

  // Roger: knowledge responses (deterministic)
  {
    id: 'roger.who',
    priority: 1600,
    match: (p) =>
      p.person.has('roger') &&
      (p.intents.has('ask') || p.question) &&
      (p.all.has('who') || p.all.has('roger')),
    action: (_p, _raw, ctx) => {
      ctx.lastFocus = 'roger';
      return reply('roger.who', replies.rogerWho);
    },
  },
  {
    id: 'roger.statusNow',
    priority: 1599,
    match: (p) =>
      p.person.has('roger') &&
      (p.intents.has('ask') || p.question) &&
      (p.all.has('now') || p.all.has('here') || p.all.has('where')),
    action: (_p, _raw, ctx) => {
      ctx.lastFocus = 'roger';
      return reply('roger.statusNow', replies.rogerStatusNow);
    },
  },
  {
    id: 'roger.pattern',
    priority: 1598,
    match: (p) =>
      p.person.has('roger') &&
      (p.intents.has('ask') || p.question) &&
      (p.all.has('how') ||
        p.all.has('survive') ||
        p.all.has('alive') ||
        p.all.has('why')),
    action: (_p, _raw, ctx) => {
      ctx.lastFocus = 'roger';
      return reply('roger.pattern', replies.rogerPattern);
    },
  },
  {
    id: 'roger.pastArcada',
    priority: 1597,
    match: (p) =>
      p.person.has('roger') &&
      (p.intents.has('ask') || p.question) &&
      (p.all.has('ship') || p.all.has('arcada') || p.all.has('invasion')),
    action: (_p, _raw, ctx) => {
      ctx.lastFocus = 'roger';
      return reply('roger.pastArcada', replies.rogerPastArcada);
    },
  },
  {
    id: 'roger.pastKerona',
    priority: 1596,
    match: (p) =>
      p.person.has('roger') &&
      (p.intents.has('ask') || p.question) &&
      (p.all.has('planet') || p.all.has('kerona') || p.all.has('crash')),
    action: (_p, _raw, ctx) => {
      ctx.lastFocus = 'roger';
      return reply('roger.pastKerona', replies.rogerPastKerona);
    },
  },
  {
    id: 'roger.pastVohaul',
    priority: 1595,
    match: (p) =>
      p.person.has('roger') &&
      (p.intents.has('ask') || p.question) &&
      (p.all.has('abduct') ||
        p.all.has('base') ||
        p.all.has('life') ||
        p.all.has('support')),
    action: (_p, _raw, ctx) => {
      ctx.lastFocus = 'roger';
      return reply('roger.pastVohaul', replies.rogerPastVohaul);
    },
  },
  {
    id: 'roger.mood',
    priority: 1594,
    match: (p) =>
      p.person.has('roger') &&
      (p.intents.has('ask') || p.intents.has('feel') || p.question) &&
      (p.all.has('feel') ||
        p.all.has('scared') ||
        p.all.has('afraid') ||
        p.all.has('brave')),
    action: (_p, _raw, ctx) => {
      ctx.lastFocus = 'roger';
      return reply('roger.mood', replies.rogerMood);
    },
  },
];

const rulesSorted = [...rules].sort((a, b) => b.priority - a.priority);

function pickVariant(ctx: Context, key: string, options: string[]): string {
  const n = seen(ctx, `variant.${key}`);
  bump(ctx, `variant.${key}`);
  return options[n % options.length];
}

function pickIntent(p: Parse): string {
  const priority = [
    'ask',
    'look',
    'search',
    'scan',
    'read',
    'press',
    'clean',
    'approach',
    'enter',
    'smell',
    'listen',
    'touch',
    'taste',
    'take',
    'use',
    'open',
    'move',
    'break',
    'start',
    'climb',
    'talk',
    'throw',
    'kick',
    'jump',
    'wait',
  ];
  for (const i of priority) if (p.intents.has(i)) return i;
  return 'look';
}

function fallbackReply(
  p: Parse,
  raw: string,
  ctx: Context,
  flags: SceneFlags,
): MatchResult {
  const target = pickTarget(p);
  const intent = pickIntent(p);

  // Common ask patterns
  if (intent === 'ask') {
    if (p.person.has('roger')) {
      ctx.lastFocus = 'roger';
      return reply('fallback.ask.roger', replies.rogerWho);
    }

    if (target) {
      ctx.lastFocus = target;
      return reply(
        fallback.ask.target,
        `You consider ${renderTarget(target)}. It does not answer back. Try looking closer or trying something specific.`,
      );
    }

    return reply(
      fallback.ask.general,
      'You do not get a neat answer. You get a junk bay, an archway, and the sense that anything useful will be earned.',
    );
  }

  if (intent === 'look') {
    if (target) {
      ctx.lastFocus = target;
      return reply(
        fallback.look.target,
        `You look at ${renderTarget(target)}. It is real, grimy, and not interested in your feelings.`,
      );
    }
    ctx.lastFocus = 'area';
    return reply(
      fallback.look.general,
      pickVariant(ctx, 'lookArea', [replies.lookAreaA, replies.lookAreaB]),
    );
  }

  if (intent === 'search')
    return reply(
      'fallback.search',
      'Search what? Try rubble, debris, machine, or panel.',
    );
  if (intent === 'scan')
    return reply('fallback.scan', 'Scan what? Try the machine or the symbols.');
  if (intent === 'read')
    return reply('fallback.read', 'Read what? Try the symbols.');
  if (intent === 'press')
    return reply('fallback.press', 'Press what? Try the panel.');
  if (intent === 'clean')
    return reply('fallback.clean', 'Clean what? Try stains or the floor.');
  if (intent === 'approach')
    return reply(
      'fallback.approach',
      'Approach what? Try the archway or the machine.',
    );
  if (intent === 'enter')
    return reply(
      'fallback.enter',
      'Enter what? The archway is the only obvious path.',
    );
  if (intent === 'smell') return reply('fallback.smell', replies.smellMetal);
  if (intent === 'listen')
    return reply(
      'fallback.listen',
      flags.ambientHum ? replies.listenHum : replies.listenQuiet,
    );
  if (intent === 'touch')
    return reply('fallback.touch', replies.touchColdMetal);
  if (intent === 'taste') return reply('fallback.taste', replies.tasteNo);
  if (intent === 'take') return reply('fallback.take', replies.takeNothing);
  if (intent === 'use') return reply('fallback.use', replies.useNothing);
  if (intent === 'throw')
    return reply(
      'fallback.throw',
      'Throw what? The red disc is a solid candidate.',
    );
  if (intent === 'kick')
    return reply(
      'fallback.kick',
      'Kick what? Try rubble. It will not thank you.',
    );
  if (intent === 'jump') return reply('fallback.jump', replies.jump);
  if (intent === 'wait')
    return reply(
      'fallback.wait',
      pickVariant(ctx, 'wait', [replies.waitA, replies.waitB]),
    );
  if (intent === 'talk') return reply('fallback.talk', replies.talkGeneral);

  return reply(
    fallback.default,
    `You try: "${raw}". The environment does not cooperate, but it does register your effort.`,
  );
}

/* =========================
 * Recorder controller: STOP runs engine, SPEAKS response
 * ========================= */

function createRecorderController(opts: {
  onStatusText: (text: string) => void;
  onTranscript: (text: string) => void;
  onResponseText: (text: string) => void;
  getContext: () => Context;
  getFlags: () => SceneFlags;
}): RecorderController {
  let mediaRecorder: MediaRecorder | null = null;
  let stream: MediaStream | null = null;
  let chunks: BlobPart[] = [];
  let audioUrl: string | null = null;

  let recognition: SpeechRecognition | null = null;
  let transcript = '';
  let lastResponse = '';
  let state: RecordingState = 'idle';

  const setState = (next: RecordingState) => {
    state = next;
  };

  const getState = () => state;

  const start = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      alert('getUserMedia is not supported in this browser.');
      return;
    }

    if (mediaRecorder && mediaRecorder.state === 'recording') {
      return;
    }

    chunks = [];
    transcript = '';
    lastResponse = '';
    opts.onTranscript('');
    opts.onResponseText('');
    opts.onStatusText('Requesting mic permission...');
    setState('idle');

    stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    if (!window.MediaRecorder) {
      alert('MediaRecorder is not supported in this browser.');
      stream.getTracks().forEach((t) => t.stop());
      stream = null;
      opts.onStatusText('Recording not supported.');
      return;
    }

    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.addEventListener('dataavailable', (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data);
      }
    });

    mediaRecorder.addEventListener('stop', () => {
      const blob = new Blob(chunks, {
        type: mediaRecorder?.mimeType || 'audio/webm',
      });

      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }

      audioUrl = URL.createObjectURL(blob);
      setState('recorded');

      const suffix = isSpeechRecognitionSupported()
        ? ''
        : ' (no transcript support in this browser)';
      opts.onStatusText(`Recorded.${suffix}`);
    });

    // Live speech-to-text while recording.
    recognition = createSpeechRecognition();
    if (recognition) {
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let next = '';
        for (let i = 0; i < event.results.length; i += 1) {
          next += event.results[i][0].transcript;
        }
        transcript = next;
        opts.onTranscript(transcript);
      };

      recognition.onerror = () => {
        // If STT fails, recording should still work.
      };

      try {
        recognition.start();
      } catch {
        // Ignore
      }
    }

    mediaRecorder.start();
    setState('recording');
    opts.onStatusText('Recording...');
  };

  const stop = () => {
    if (!mediaRecorder || mediaRecorder.state !== 'recording') {
      return;
    }

    try {
      recognition?.stop();
    } catch {
      // Ignore
    }
    recognition = null;

    mediaRecorder.stop();

    stream?.getTracks().forEach((t) => t.stop());
    stream = null;

    // IMPORTANT: Instead of speaking transcript, we compute response and speak it.
    const ctx = opts.getContext();
    const flags = opts.getFlags();

    const result = respondToCommand(transcript, ctx, flags);
    const responseText =
      result.kind === 'reply'
        ? result.text
        : result.kind === 'pass'
          ? 'That does not work right now.'
          : 'You get no response. The bay just sits there, being a bay.';

    lastResponse = responseText;
    opts.onResponseText(lastResponse);

    // Speak the whole response, immediately.
    speak(lastResponse);

    setState('recorded');
    opts.onStatusText('Stopping...');
  };

  const speakLastResponse = () => {
    speak(lastResponse);
  };

  const destroy = () => {
    try {
      recognition?.stop();
    } catch {
      // Ignore
    }
    recognition = null;

    if (mediaRecorder && mediaRecorder.state === 'recording') {
      try {
        mediaRecorder.stop();
      } catch {
        // Ignore
      }
    }
    mediaRecorder = null;

    stream?.getTracks().forEach((t) => t.stop());
    stream = null;

    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      audioUrl = null;
    }
  };

  return { start, stop, speakLastResponse, getState, destroy };
}

/* =========================
 * App
 * =========================  */

export default function App() {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cleanup: undefined | (() => void);

    const run = async () => {
      const host = hostRef.current;
      if (!host) return;

      const app = new Application();
      await app.init({
        background: '#0b1020',
        resizeTo: host,
      });

      host.appendChild(app.canvas);
      app.stage.eventMode = 'static';

      const stage = new Container();
      app.stage.addChild(stage);

      const bg = new Sprite(bgTexture);
      stage.addChildAt(bg, 0);

      // Make it fill the renderer; call this in updateLayout too
      //bg.width = "100%";
      //bg.height = app.renderer.height;
      bg.scale = 0.5;
      bg.position.set(0, 0);

      const title = new Text({
        text: 'Single scene for now, click left dot, speak, press right dot to hear response',
        style: {
          fill: '#ffffff',
          fontSize: 30,
          fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
        },
      });
      title.anchor.set(0.5);
      stage.addChild(title);

      const status = new Text({
        text: 'Idle',
        style: {
          fill: '#cbd5e1',
          fontSize: 18,
          fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
        },
      });
      status.anchor.set(0.5);
      stage.addChild(status);

      const transcriptText = new Text({
        text: '',
        style: {
          fill: '#94a3b8',
          fontSize: 14,
          wordWrap: true,
          wordWrapWidth: 680,
          fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
        },
      });
      transcriptText.anchor.set(0.5);
      stage.addChild(transcriptText);

      const responseText = new Text({
        text: '',
        style: {
          fill: '#e2e8f0',
          fontSize: 14,
          wordWrap: true,
          wordWrapWidth: 680,
          fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
        },
      });
      responseText.anchor.set(0.5);
      stage.addChild(responseText);

      const radius = 10;

      // Dot 1: start recording (green)
      const startDot = makeDot(radius, 0x22c55e);
      stage.addChild(startDot);

      // Dot 2: stop recording (red) -> runs engine -> speaks response
      const stopDot = makeDot(radius, 0xef4444);
      stage.addChild(stopDot);

      // Dot 3: speak last response (cyan)
      const speakDot = makeDot(radius, 0x7dd3fc);
      stage.addChild(speakDot);

      // Scene state for the rule engine (tweak as you like)
      const ctx: Context = {
        global186: false,
        global200: false,
      };

      const flags: SceneFlags = {
        podDoorSealed: true,
        lightsWorking: true,
        slimePresent: true,
        ambientHum: true,
        wallsSweaty: false,
        playerBruised: true,
      };

      const recorder = createRecorderController({
        onStatusText: (text) => {
          status.text = text;
        },
        onTranscript: (text) => {
          transcriptText.text = text ? `Heard: ${text}` : '';
        },
        onResponseText: (text) => {
          responseText.text = text ? `Response: ${text}` : '';
        },
        getContext: () => ctx,
        getFlags: () => flags,
      });

      startDot.on('pointertap', async () => {
        try {
          await recorder.start();
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error(err);
          status.text = 'Failed to start recording.';
        }
      });

      stopDot.on('pointertap', () => {
        recorder.stop();
      });

      speakDot.on('pointertap', () => {
        recorder.speakLastResponse();
      });

      const updateLayout = () => {
        const w = app.renderer.width;
        const h = app.renderer.height;

        title.position.set(w / 2, h / 2 - 130);
        status.position.set(w / 2, h / 2 - 95);

        transcriptText.position.set(w / 2, h / 2 + 40);
        responseText.position.set(w / 2, h / 2 + 125);

        startDot.position.set(w / 2 - 50, h / 2 - 35);
        stopDot.position.set(w / 2, h / 2 - 35);
        speakDot.position.set(w / 2 + 50, h / 2 - 35);
      };

      updateLayout();
      window.addEventListener('resize', updateLayout);

      app.ticker.add(() => {
        startDot.rotation += 0.02;
        stopDot.rotation += 0.02;
        speakDot.rotation += 0.02;

        const s = recorder.getState();
        const isRecording = s === 'recording';

        repaintDot(startDot, radius, isRecording ? 0x166534 : 0x22c55e);
        repaintDot(stopDot, radius, isRecording ? 0xef4444 : 0x7f1d1d);
        repaintDot(speakDot, radius, s === 'recorded' ? 0x38bdf8 : 0x1e3a8a);
      });

      cleanup = () => {
        window.removeEventListener('resize', updateLayout);
        recorder.destroy();
        app.destroy(true);
      };
    };

    run().catch((err) => {
      // eslint-disable-next-line no-console
      console.error(err);
    });

    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  return (
    <div className="app">
      <header className="header">
        <h1>Hello World</h1>
        <p>React + Vite + Pixi + PWA (service worker) + Capacitor</p>
      </header>
      <main className="main">
        <div className="canvasHost" ref={hostRef} />
      </main>
    </div>
  );
}
