/**
 * Core game engine for rule processing
 */

import type { Context, SceneFlags, Parse, MatchResult, Rule } from '../types';

/**
 * Hydrate state with defaults
 */
export function hydrateState(ctx: Context, flags: SceneFlags): void {
  // Initialize context defaults
  if (!ctx.inventory) ctx.inventory = new Set();
  if (!ctx.knowledge) ctx.knowledge = new Set();
  if (ctx.lastFocus === undefined) ctx.lastFocus = null;
  if (!ctx.counters) ctx.counters = {};

  // Initialize scene flags defaults
  if (flags.lightsWorking === undefined) flags.lightsWorking = true;
  if (flags.slimePresent === undefined) flags.slimePresent = true;
  if (flags.ambientHum === undefined) flags.ambientHum = true;
  if (flags.lightsFlickering === undefined) flags.lightsFlickering = true;
  if (flags.archwayOpen === undefined) flags.archwayOpen = true;
  if (flags.wallHasSymbols === undefined) flags.wallHasSymbols = true;
  if (flags.wallHasStains === undefined) flags.wallHasStains = true;
  if (flags.floorHasRubble === undefined) flags.floorHasRubble = true;
  if (flags.leftMachinePowered === undefined) flags.leftMachinePowered = true;
  if (flags.blueGlowActive === undefined) flags.blueGlowActive = true;

  // Item presence
  if (flags.hasRedDisc === undefined) flags.hasRedDisc = true;
  if (flags.hasBlueCrate === undefined) flags.hasBlueCrate = true;
  if (flags.hasSilverCylinder === undefined) flags.hasSilverCylinder = true;

  // Progression
  if (flags.panelUnlocked === undefined) flags.panelUnlocked = false;
  if (flags.machineRepaired === undefined) flags.machineRepaired = false;
  if (flags.archwaySafe === undefined) flags.archwaySafe = false;
}

/**
 * Increment a counter and return the new value
 */
export function bump(ctx: Context, key: string): number {
  if (!ctx.counters) ctx.counters = {};
  const current = ctx.counters[key] || 0;
  ctx.counters[key] = current + 1;
  return ctx.counters[key];
}

/**
 * Get current counter value
 */
export function seen(ctx: Context, key: string): number {
  if (!ctx.counters) return 0;
  return ctx.counters[key] || 0;
}

/**
 * Pick a variant from an array based on counter (deterministic cycling)
 */
export function pickVariant(ctx: Context, key: string, options: string[]): string {
  if (options.length === 0) return '';
  if (options.length === 1) return options[0];

  const fullKey = `variant.${key}`;
  const count = seen(ctx, fullKey);
  bump(ctx, fullKey);
  const index = count % options.length;
  return options[index];
}

/**
 * Process command through rule engine
 */
export function respondToCommand(
  input: string,
  ctx: Context,
  flags: SceneFlags,
  rules: Rule[],
  parseFunc: (input: string, ctx: Context) => Parse,
  fallbackFunc: (p: Parse, raw: string, ctx: Context, flags: SceneFlags) => MatchResult,
): MatchResult {
  hydrateState(ctx, flags);

  const parsed = parseFunc(input, ctx);

  // Try each rule in priority order
  for (const rule of rules) {
    // Check optional 'when' condition
    if (rule.when && !rule.when(ctx, flags)) {
      continue;
    }

    // Check if rule matches
    if (rule.match(parsed, input, ctx, flags)) {
      const result = rule.action(parsed, input, ctx, flags);
      if (result.kind === 'reply') {
        return result;
      }
      // If 'pass', continue to next rule
    }
  }

  // No rule matched, use fallback
  return fallbackFunc(parsed, input, ctx, flags);
}

/**
 * Create a reply result
 */
export function reply(ruleId: string, text: string): MatchResult {
  return { kind: 'reply', text, ruleId };
}

/**
 * Create a pass result
 */
export function pass(ruleId: string, reason: string): MatchResult {
  return { kind: 'pass', reason, ruleId };
}

/**
 * Pick the most relevant target from parsed input (priority order)
 */
export function pickTarget(p: Parse): string | null {
  // Priority order for target selection
  const priority = [
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
    'rubble',
    'debris',
    'slime',
    'wall',
    'ceiling',
    'lights',
    'shadows',
    'deck',
    'pipes',
    'vents',
    'cables',
    'area',
    'roger',
  ];

  for (const t of priority) {
    if (p.targets.has(t)) {
      return t;
    }
  }

  // Fallback to first target
  if (p.targets.size > 0) {
    return Array.from(p.targets)[0];
  }

  return null;
}

/**
 * Render target name in human-readable form
 */
export function renderTarget(t: string): string {
  const map: Record<string, string> = {
    redDisc: 'red disc',
    blueCrate: 'blue crate',
    silverCylinder: 'silver cylinder',
    metalTab: 'metal tab',
    area: 'area',
    archway: 'archway',
    machine: 'machine',
    panel: 'panel',
    glow: 'blue glow',
    symbols: 'symbols',
    stains: 'stains',
    pillar: 'pillar',
    rubble: 'rubble',
    debris: 'debris',
    slime: 'slime',
    wall: 'wall',
    ceiling: 'ceiling',
    lights: 'lights',
    shadows: 'shadows',
    deck: 'deck',
    pipes: 'pipes',
    vents: 'vents',
    cables: 'cables',
    roger: 'Roger',
  };

  return map[t] || t;
}
