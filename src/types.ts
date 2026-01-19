/**
 * Core type definitions for the text adventure game engine
 */

// ==================== Audio/Recording Types ====================

export type RecordingState = 'idle' | 'recording' | 'recorded';

export type RecorderController = {
  start: () => Promise<void>;
  stop: () => void;
  speakLastResponse: () => void;
  getState: () => RecordingState;
  destroy: () => void;
};

// ==================== Game State Types ====================

/**
 * Persistent game state that carries across scenes
 */
export type Context = {
  global186?: boolean;
  global200?: boolean;
  inventory?: Set<string>;
  knowledge?: Set<string>;
  lastFocus?: string | null;
  counters?: Record<string, number>;
};

/**
 * Scene-specific flags for current room state
 */
export type SceneFlags = {
  // Legacy flags (from original pod scene)
  podDoorSealed?: boolean;
  lightsWorking?: boolean;
  slimePresent?: boolean;
  ambientHum?: boolean;
  wallsSweaty?: boolean;
  playerBruised?: boolean;

  // Scene 2 environment flags
  lightsFlickering?: boolean;
  archwayOpen?: boolean;
  wallHasSymbols?: boolean;
  wallHasStains?: boolean;
  floorHasRubble?: boolean;
  leftMachinePowered?: boolean;
  blueGlowActive?: boolean;

  // Item presence flags
  hasRedDisc?: boolean;
  hasBlueCrate?: boolean;
  hasSilverCylinder?: boolean;

  // Progression flags
  panelUnlocked?: boolean;
  machineRepaired?: boolean;
  archwaySafe?: boolean;
};

// ==================== Rule Engine Types ====================

/**
 * Result of matching a rule against player input
 */
export type MatchResult =
  | { kind: 'reply'; text: string; ruleId: string }
  | { kind: 'pass'; reason: string; ruleId: string }
  | { kind: 'none' };

/**
 * A single rule in the game engine
 */
export type Rule = {
  id: string;
  priority: number;
  when?: (ctx: Context, flags: SceneFlags) => boolean;
  match: (p: Parse, raw: string, ctx: Context, flags: SceneFlags) => boolean;
  action: (p: Parse, raw: string, ctx: Context, flags: SceneFlags) => MatchResult;
};

/**
 * Parsed representation of player input
 */
export type Parse = {
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

// ==================== Room Types ====================

/**
 * Configuration for a game room/scene
 */
export interface RoomConfig {
  id: string;
  backgroundPath: string;
  defaultFlags: Partial<SceneFlags>;
  nouns: Record<string, string>;
  verbs?: Record<string, string>;
  adjectives?: Record<string, string>;
}

/**
 * Interface for game room implementations
 */
export interface IRoom {
  readonly id: string;
  readonly backgroundPath: string;

  /**
   * Get default scene flags for this room
   */
  getDefaultFlags(): Partial<SceneFlags>;

  /**
   * Get room-specific rules
   */
  getRules(): Rule[];

  /**
   * Get room-specific noun lexicon
   */
  getNouns(): Record<string, string>;

  /**
   * Get room-specific verb lexicon (optional)
   */
  getVerbs(): Record<string, string>;

  /**
   * Get room-specific adjective lexicon (optional)
   */
  getAdjectives(): Record<string, string>;
}

// ==================== Game Types ====================

/**
 * Options for creating recorder controller
 */
export type RecorderOptions = {
  onTranscriptChange?: (text: string) => void;
  onResponseText?: (text: string) => void;
  onStateChange?: (state: RecordingState) => void;
  onDebug?: (message: string) => void;
  processCommand: (input: string) => MatchResult;
};

/**
 * Lexicon type for word mappings
 */
export type Lexicon = Record<string, string>;
