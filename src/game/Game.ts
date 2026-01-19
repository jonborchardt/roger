/**
 * Main Game class - orchestrates global rules and room-specific logic
 */

import type { Context, SceneFlags, Rule, MatchResult, Parse } from '../types';
import type { IRoom } from '../types';
import { parse } from '../utils/parser';
import { respondToCommand as processCommand, reply, pickVariant, renderTarget, pickTarget } from '../engine/engine';
import { replies } from '../data/replies';
import { Scene2Room } from '../rooms/Scene2Room';

export class Game {
  private ctx: Context;
  private flags: SceneFlags;
  private currentRoom: IRoom;

  constructor() {
    // Initialize game state
    this.ctx = {
      global186: false,
      global200: false,
      inventory: new Set<string>(),
      knowledge: new Set<string>(),
      lastFocus: null,
      counters: {},
    };

    this.flags = {};

    // Start with Scene2Room
    this.currentRoom = new Scene2Room();

    // Initialize flags from room
    this.flags = { ...this.currentRoom.getDefaultFlags() } as SceneFlags;
  }

  /**
   * Process a player command
   */
  processCommand(input: string): MatchResult {
    // Get room-specific lexicons
    const roomNouns = this.currentRoom.getNouns();
    const roomVerbs = this.currentRoom.getVerbs();
    const roomAdjs = this.currentRoom.getAdjectives();

    // Parse input with combined lexicons
    const parseFunc = (inp: string, ctx: Context) =>
      parse(inp, ctx, roomNouns, roomVerbs, roomAdjs);

    // Combine global rules + room rules
    const allRules = [
      ...this.getGlobalRules(),
      ...this.currentRoom.getRules(),
    ];

    // Sort by priority
    const sortedRules = [...allRules].sort((a, b) => b.priority - a.priority);

    // Process through engine
    return processCommand(
      input,
      this.ctx,
      this.flags,
      sortedRules,
      parseFunc,
      this.fallbackReply.bind(this),
    );
  }

  /**
   * Get the current room's background path
   */
  getBackgroundPath(): string {
    return this.currentRoom.backgroundPath;
  }

  /**
   * Get current context (for recorder)
   */
  getContext(): Context {
    return this.ctx;
  }

  /**
   * Get current flags (for recorder)
   */
  getFlags(): SceneFlags {
    return this.flags;
  }

  /**
   * Global rules that work across all rooms
   */
  private getGlobalRules(): Rule[] {
    return [
      // QA passthrough
      {
        id: 'qa.entry',
        priority: 3000,
        match: (_p, raw) => this.isQa(raw),
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
  }

  /**
   * Fallback for unmatched commands
   */
  private fallbackReply(
    p: Parse,
    raw: string,
    ctx: Context,
    flags: SceneFlags,
  ): MatchResult {
    const target = pickTarget(p);
    const intent = this.pickIntent(p);

    // Common ask patterns
    if (intent === 'ask') {
      if (p.person.has('roger')) {
        ctx.lastFocus = 'roger';
        return reply('fallback.ask.roger', replies.rogerWho);
      }

      if (target) {
        ctx.lastFocus = target;
        return reply(
          'fallback.ask.target',
          `You consider ${renderTarget(target)}. It does not answer back. Try looking closer or trying something specific.`,
        );
      }

      return reply(
        'fallback.ask.general',
        'You do not get a neat answer. You get a junk bay, an archway, and the sense that anything useful will be earned.',
      );
    }

    if (intent === 'look') {
      if (target) {
        ctx.lastFocus = target;
        return reply(
          'fallback.look.target',
          `You look at ${renderTarget(target)}. It is real, grimy, and not interested in your feelings.`,
        );
      }
      ctx.lastFocus = 'area';
      return reply(
        'fallback.look.general',
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
      'fallback.default',
      `You try: "${raw}". The environment does not cooperate, but it does register your effort.`,
    );
  }

  /**
   * Pick the most relevant intent from parsed input
   */
  private pickIntent(p: Parse): string {
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

  /**
   * Check if input is QA mode
   */
  private isQa(raw: string): boolean {
    if (/\bqa\b/i.test(raw)) return true;
    if (/\bq\s*\/?\s*a\b/i.test(raw)) return true;
    if (/\bqa[-_\s]?o[-_\s]?matic\b/i.test(raw)) return true;
    return false;
  }
}
