/**
 * Scene 2 - Junk Bay Room (EXPANDED)
 * The industrial bay with archway, machine, and hundreds of interactive responses
 */

import { BaseRoom } from './BaseRoom';
import type { Rule, SceneFlags, Lexicon, Parse, Context } from '../types';
import { replies } from '../data/replies';
import { reply, pickVariant, renderTarget, pickTarget } from '../engine/engine';
import { hasAny } from '../utils/parser';

export class Scene2Room extends BaseRoom {
  readonly id = 'scene2';
  readonly backgroundPath = '/roger/scene2.png';

  getDefaultFlags(): Partial<SceneFlags> {
    return {
      lightsWorking: true,
      slimePresent: true,
      ambientHum: true,
      wallsSweaty: false,
      playerBruised: true,
      lightsFlickering: true,
      archwayOpen: true,
      wallHasSymbols: true,
      wallHasStains: true,
      floorHasRubble: true,
      leftMachinePowered: true,
      blueGlowActive: true,
      hasRedDisc: true,
      hasBlueCrate: true,
      hasSilverCylinder: true,
      panelUnlocked: false,
      machineRepaired: false,
      archwaySafe: false,
      hiddenPanelSeamVisible: false,
      gritSwept: false,
      symbolsWiped: false,
      stainsWiped: false,
      ventsDusty: true,
      cablesPlugged: false,
      machinePoweredDown: false,
      lightsToggled: false,
      pillarExamined: false,
      rubbleSearched: false,
      crateExamined: false,
      discThrown: false,
      slimeTouched: false,
      playerSat: false,
      playerPrayed: false,
      playerShouted: false,
      glowStable: true,
    };
  }

  getNouns(): Lexicon {
    return {
      // Area
      area: 'area',
      bay: 'area',
      room: 'area',
      place: 'area',
      environment: 'area',
      surroundings: 'area',

      // Walls & structure
      wall: 'wall',
      walls: 'wall',
      bulkhead: 'wall',
      surface: 'wall',

      ceiling: 'ceiling',
      roof: 'ceiling',
      overhead: 'ceiling',
      top: 'ceiling',

      lights: 'lights',
      light: 'lights',
      lighting: 'lights',
      lamp: 'lights',
      lamps: 'lights',
      grid: 'lights',
      fixture: 'lights',
      fixtures: 'lights',
      bulb: 'lights',
      bulbs: 'lights',

      shadow: 'shadow',
      shadows: 'shadow',
      darkness: 'shadow',
      dark: 'shadow',

      deck: 'deck',
      floor: 'deck',
      ground: 'deck',
      flooring: 'deck',
      plating: 'deck',

      rubble: 'rubble',
      debris: 'debris',
      scrap: 'debris',
      junk: 'debris',
      trash: 'debris',
      waste: 'debris',
      fragments: 'debris',
      wreckage: 'debris',
      mess: 'debris',
      garbage: 'debris',

      pipe: 'pipe',
      pipes: 'pipe',
      conduit: 'pipe',
      conduits: 'pipe',
      duct: 'pipe',
      ducts: 'pipe',
      tubing: 'pipe',

      vent: 'vent',
      vents: 'vent',
      ventilation: 'vent',
      airduct: 'vent',

      cable: 'cable',
      cables: 'cable',
      wire: 'cable',
      wires: 'cable',
      wiring: 'cable',
      cord: 'cable',
      cords: 'cable',

      stain: 'stain',
      stains: 'stain',
      mark: 'stain',
      marks: 'stain',
      streak: 'stain',
      streaks: 'stain',
      smear: 'stain',

      symbol: 'symbol',
      symbols: 'symbol',
      marking: 'symbol',
      markings: 'symbol',
      writing: 'symbol',
      text: 'symbol',
      inscription: 'symbol',
      inscriptions: 'symbol',
      notation: 'symbol',
      glyphs: 'symbol',

      pillar: 'pillar',
      column: 'pillar',
      post: 'pillar',
      support: 'pillar',

      // Archway
      archway: 'archway',
      arch: 'archway',
      door: 'archway',
      doorway: 'archway',
      portal: 'archway',
      passage: 'archway',
      passageway: 'archway',
      exit: 'archway',
      entrance: 'archway',
      tunnel: 'archway',
      hatch: 'archway',
      frame: 'archway',
      opening: 'archway',
      corridor: 'archway',

      // Machine
      machine: 'machine',
      leftMachine: 'machine',
      device: 'machine',
      equipment: 'machine',
      apparatus: 'machine',
      generator: 'machine',
      console: 'machine',
      system: 'machine',
      unit: 'machine',

      // Panel
      panel: 'panel',
      wallPanel: 'panel',
      interface: 'panel',
      keypad: 'panel',
      terminal: 'panel',
      screen: 'panel',
      display: 'panel',
      controls: 'controls',
      control: 'controls',
      buttons: 'panel',
      switches: 'panel',

      glow: 'glow',
      blueGlow: 'glow',
      blueLight: 'glow',
      square: 'glow',
      blueSquare: 'glow',

      coupling: 'coupling',
      socket: 'coupling',
      port: 'coupling',
      slot: 'coupling',
      receptacle: 'coupling',
      connector: 'coupling',
      jack: 'coupling',

      // Items
      disc: 'redDisc',
      redDisc: 'redDisc',
      red: 'redDisc',
      reddisc: 'redDisc',
      ring: 'redDisc',
      disk: 'redDisc',
      redDisk: 'redDisc',
      redCircle: 'redDisc',
      circle: 'redDisc',
      redComponent: 'redDisc',
      redThing: 'redDisc',
      redObject: 'redDisc',

      crate: 'blueCrate',
      blueCrate: 'blueCrate',
      box: 'blueCrate',
      bluebox: 'blueCrate',
      bluecrate: 'blueCrate',
      blueBox: 'blueCrate',
      container: 'blueCrate',
      blueContainer: 'blueCrate',
      blueThing: 'blueCrate',
      blueObject: 'blueCrate',

      cylinder: 'silverCylinder',
      silverCylinder: 'silverCylinder',
      silvercylinder: 'silverCylinder',
      cartridge: 'silverCylinder',
      silver: 'silverCylinder',
      silverCartridge: 'silverCylinder',
      silverCanister: 'silverCylinder',
      silverThing: 'silverCylinder',
      silverObject: 'silverCylinder',
      tube: 'silverCylinder',
      canister: 'silverCylinder',

      tab: 'metalTab',
      metalTab: 'metalTab',
      metaltab: 'metalTab',
      latch: 'metalTab',
      clip: 'metalTab',
      fastener: 'metalTab',
      notch: 'metalTab',
      adapter: 'metalTab',

      slime: 'slime',
      grime: 'slime',
      gunk: 'slime',
      muck: 'slime',
      ooze: 'slime',
      sludge: 'slime',

      // NPCs
      roger: 'roger',
      wilco: 'roger',
      janitor: 'roger',
      spacejanitor: 'roger',
      self: 'self',
      me: 'self',
      myself: 'self',
    };
  }

  getVerbs(): Lexicon {
    return {
      wipe: 'clean',
      sweep: 'clean',
      rub: 'rub',
      smear: 'smear',
      plug: 'plug',
      unplug: 'unplug',
      toggle: 'toggle',
      flip: 'toggle',
      shout: 'shout',
      yell: 'shout',
      scream: 'shout',
      swear: 'swear',
      curse: 'swear',
      sit: 'sit',
      rest: 'sit',
      sleep: 'sleep',
      lay: 'sleep',
      lie: 'sleep',
      pray: 'pray',
      dance: 'dance',
      sing: 'sing',
      hum: 'sing',
      smash: 'smash',
      break: 'smash',
      destroy: 'smash',
      pry: 'pry',
      lift: 'lift',
      pull: 'pull',
      push: 'push',
      climb: 'climb',
      insert: 'use',
      attach: 'use',
      connect: 'use',
      install: 'use',
      mount: 'use',
      slot: 'use',
      fit: 'use',
      lick: 'taste',
      hide: 'hide',
      crouch: 'crouch',
      duck: 'crouch',
      run: 'run',
      sprint: 'run',
      shake: 'shake',
      turn: 'turn',
      rotate: 'turn',
      twist: 'turn',
    };
  }

  getAdjectives(): Lexicon {
    return {
      industrial: 'industrial',
      gritty: 'industrial',
      blue: 'blue',
      dark: 'dark',
      red: 'red',
      silver: 'silver',
      metal: 'metal',
      metallic: 'metal',
      powered: 'powered',
      glowing: 'glowing',
      dirty: 'dirty',
      grimy: 'dirty',
      rusty: 'rusty',
      old: 'old',
      worn: 'worn',
      broken: 'broken',
      loose: 'loose',
      sealed: 'sealed',
      locked: 'locked',
      hidden: 'hidden',
      flickering: 'flickering',
      flicker: 'flickering',
      steady: 'steady',
      bolted: 'bolted',
      heavy: 'heavy',
      dusty: 'dusty',
      clogged: 'dusty',
      green: 'green',
      orange: 'orange',
      cold: 'cold',
    };
  }

  getRules(): Rule[] {
    // Helpers
    const has = (ctx: Context, item: string) => ctx.inventory?.has(item) ?? false;
    const knows = (ctx: Context, fact: string) => ctx.knowledge?.has(fact) ?? false;

    return [
      // ===== LOOK AT RULES (priority 2000-1969) =====
      {
        id: 'scene2.lookArea',
        priority: 2000,
        match: (p, raw) =>
          (p.intents.has('look') &&
            (p.nouns.has('area') || p.nouns.size === 0)) ||
          raw.match(/^(look around|look)$/i) !== null,
        action: (_p, _raw, ctx) => {
          ctx.lastFocus = 'area';
          return reply(
            'scene2.lookArea',
            pickVariant(ctx, 'lookArea', [replies.lookAreaA, replies.lookAreaB])
          );
        },
      },
      {
        id: 'scene2.lookWalls',
        priority: 1995,
        match: (p) => p.intents.has('look') && p.nouns.has('wall'),
        action: (_p, _raw, ctx) => {
          ctx.lastFocus = 'wall';
          return reply('scene2.lookWalls', replies.lookWalls);
        },
      },
      {
        id: 'scene2.lookCeiling',
        priority: 1994,
        match: (p) => p.intents.has('look') && p.nouns.has('ceiling'),
        action: (_p, _raw, ctx) => {
          ctx.lastFocus = 'ceiling';
          return reply('scene2.lookCeiling', replies.lookCeiling);
        },
      },
      {
        id: 'scene2.lookLights',
        priority: 1993,
        match: (p) => p.intents.has('look') && p.nouns.has('lights'),
        action: (_p, _raw, ctx, flags) => {
          ctx.lastFocus = 'lights';
          if (flags.lightsFlickering) {
            return reply('scene2.lookLights', replies.lookLightsFlicker);
          }
          if (!flags.lightsWorking) {
            return reply('scene2.lookLights', replies.lookLightsDead);
          }
          return reply('scene2.lookLights', replies.lookLightsWorking);
        },
      },
      {
        id: 'scene2.lookShadows',
        priority: 1992,
        match: (p) => p.intents.has('look') && p.nouns.has('shadow'),
        action: (_p, _raw, ctx) => {
          ctx.lastFocus = 'shadow';
          return reply('scene2.lookShadows', replies.lookShadows);
        },
      },
      {
        id: 'scene2.lookDeck',
        priority: 1991,
        match: (p) => p.intents.has('look') && p.nouns.has('deck'),
        action: (_p, _raw, ctx) => {
          ctx.lastFocus = 'deck';
          return reply('scene2.lookDeck', replies.lookDeck);
        },
      },
      {
        id: 'scene2.lookRubble',
        priority: 1990,
        match: (p) => p.intents.has('look') && p.nouns.has('rubble'),
        action: (_p, _raw, ctx) => {
          ctx.lastFocus = 'rubble';
          return reply('scene2.lookRubble', replies.lookRubble);
        },
      },
      {
        id: 'scene2.lookDebris',
        priority: 1989,
        match: (p) => p.intents.has('look') && p.nouns.has('debris'),
        action: (_p, _raw, ctx) => {
          ctx.lastFocus = 'debris';
          return reply('scene2.lookDebris', replies.lookDebris);
        },
      },
      {
        id: 'scene2.lookPipes',
        priority: 1988,
        match: (p) => p.intents.has('look') && p.nouns.has('pipe'),
        action: (_p, _raw, ctx) => {
          ctx.lastFocus = 'pipe';
          return reply('scene2.lookPipes', replies.lookPipes);
        },
      },
      {
        id: 'scene2.lookVents',
        priority: 1987,
        match: (p) => p.intents.has('look') && p.nouns.has('vent'),
        action: (_p, _raw, ctx) => {
          ctx.lastFocus = 'vent';
          return reply('scene2.lookVents', replies.lookVents);
        },
      },
      {
        id: 'scene2.lookCables',
        priority: 1986,
        match: (p) => p.intents.has('look') && p.nouns.has('cable'),
        action: (_p, _raw, ctx, flags) => {
          ctx.lastFocus = 'cable';
          if (flags.cablesPlugged) {
            return reply('scene2.lookCables', replies.lookCablesPlugged);
          }
          return reply('scene2.lookCables', replies.lookCables);
        },
      },
      {
        id: 'scene2.lookStains',
        priority: 1985,
        match: (p) => p.intents.has('look') && p.nouns.has('stain'),
        action: (_p, _raw, ctx, flags) => {
          ctx.lastFocus = 'stain';
          if (flags.stainsWiped) {
            return reply('scene2.lookStains', replies.lookStainsWiped);
          }
          return reply('scene2.lookStains', replies.lookStains);
        },
      },
      {
        id: 'scene2.lookSymbols',
        priority: 1984,
        match: (p) => p.intents.has('look') && p.nouns.has('symbol'),
        action: (_p, _raw, ctx, flags) => {
          ctx.lastFocus = 'symbol';
          if (flags.symbolsWiped) {
            return reply('scene2.lookSymbols', replies.lookSymbolsWiped);
          }
          return reply('scene2.lookSymbols', replies.lookSymbols);
        },
      },
      {
        id: 'scene2.lookPillar',
        priority: 1983,
        match: (p) => p.intents.has('look') && p.nouns.has('pillar'),
        action: (_p, _raw, ctx, flags) => {
          ctx.lastFocus = 'pillar';
          flags.pillarExamined = true;
          return reply('scene2.lookPillar', replies.lookPillar);
        },
      },
      {
        id: 'scene2.lookArchway',
        priority: 1982,
        match: (p) => p.intents.has('look') && p.nouns.has('archway'),
        action: (_p, _raw, ctx) => {
          ctx.lastFocus = 'archway';
          return reply('scene2.lookArchway', replies.lookArchway);
        },
      },
      {
        id: 'scene2.lookMachine',
        priority: 1981,
        match: (p) => p.intents.has('look') && p.nouns.has('machine'),
        action: (_p, _raw, ctx, flags) => {
          ctx.lastFocus = 'machine';
          if (flags.machinePoweredDown) {
            return reply('scene2.lookMachine', replies.lookMachinePoweredDown);
          }
          return reply('scene2.lookMachine', replies.lookMachine);
        },
      },
      {
        id: 'scene2.lookPanel',
        priority: 1980,
        match: (p) => p.intents.has('look') && p.nouns.has('panel'),
        action: (_p, _raw, ctx, flags) => {
          ctx.lastFocus = 'panel';
          if (flags.hiddenPanelSeamVisible) {
            return reply('scene2.lookPanel', replies.lookPanelSeamVisible);
          }
          return reply('scene2.lookPanel', replies.lookPanel);
        },
      },
      {
        id: 'scene2.lookGlow',
        priority: 1979,
        match: (p) => p.intents.has('look') && p.nouns.has('glow'),
        action: (_p, _raw, ctx, flags) => {
          ctx.lastFocus = 'glow';
          if (!flags.glowStable) {
            return reply('scene2.lookGlow', replies.lookGlowFlicker);
          }
          return reply('scene2.lookGlow', replies.lookGlow);
        },
      },
      {
        id: 'scene2.lookCoupling',
        priority: 1978,
        match: (p) => p.intents.has('look') && p.nouns.has('coupling'),
        action: (_p, _raw, ctx) => {
          ctx.lastFocus = 'coupling';
          return reply('scene2.lookCoupling', replies.lookCoupling);
        },
      },
      {
        id: 'scene2.lookRedDisc',
        priority: 1977,
        when: (_ctx, flags) => flags.hasRedDisc ?? false,
        match: (p) => p.intents.has('look') && p.nouns.has('redDisc'),
        action: (_p, _raw, ctx) => {
          ctx.lastFocus = 'redDisc';
          return reply('scene2.lookRedDisc', replies.lookRedDisc);
        },
      },
      {
        id: 'scene2.lookBlueCrate',
        priority: 1976,
        when: (_ctx, flags) => flags.hasBlueCrate ?? false,
        match: (p) => p.intents.has('look') && p.nouns.has('blueCrate'),
        action: (_p, _raw, ctx, flags) => {
          ctx.lastFocus = 'blueCrate';
          flags.crateExamined = true;
          return reply('scene2.lookBlueCrate', replies.lookBlueCrate);
        },
      },
      {
        id: 'scene2.lookSilverCylinder',
        priority: 1975,
        when: (_ctx, flags) => flags.hasSilverCylinder ?? false,
        match: (p) => p.intents.has('look') && p.nouns.has('silverCylinder'),
        action: (_p, _raw, ctx) => {
          ctx.lastFocus = 'silverCylinder';
          return reply('scene2.lookSilverCylinder', replies.lookSilverCylinder);
        },
      },
      {
        id: 'scene2.lookSlimePresent',
        priority: 1974,
        when: (_ctx, flags) => flags.slimePresent ?? false,
        match: (p) => p.intents.has('look') && p.nouns.has('slime'),
        action: (_p, _raw, ctx) => {
          ctx.lastFocus = 'slime';
          return reply('scene2.lookSlimePresent', replies.lookSlimePresent);
        },
      },
      {
        id: 'scene2.lookSlimeAbsent',
        priority: 1973,
        when: (_ctx, flags) => !(flags.slimePresent ?? false),
        match: (p) => p.intents.has('look') && p.nouns.has('slime'),
        action: (_p, _raw, ctx) => {
          ctx.lastFocus = 'slime';
          return reply('scene2.lookSlimeAbsent', replies.lookSlimeAbsent);
        },
      },
      {
        id: 'scene2.lookUnder',
        priority: 1972,
        match: (_p, raw) => raw.match(/look under|under the|beneath/i) !== null,
        action: () => reply('scene2.lookUnder', replies.lookUnder),
      },
      {
        id: 'scene2.lookBehind',
        priority: 1971,
        match: (_p, raw) => raw.match(/look behind|behind the/i) !== null,
        action: () => reply('scene2.lookBehind', replies.lookBehind),
      },
      {
        id: 'scene2.lookSelf',
        priority: 1970,
        match: (p) => p.intents.has('look') && p.nouns.has('self'),
        action: () => reply('scene2.lookSelf', replies.lookSelf),
      },

      // ===== SMELL RULES (priority 1890-1883) =====
      {
        id: 'scene2.smellMetal',
        priority: 1890,
        match: (p) =>
          p.intents.has('smell') &&
          (p.nouns.has('area') ||
            p.nouns.has('wall') ||
            p.nouns.has('machine') ||
            p.nouns.size === 0),
        action: () => reply('scene2.smellMetal', replies.smellMetal),
      },
      {
        id: 'scene2.smellOzone',
        priority: 1889,
        match: (p) =>
          p.intents.has('smell') &&
          (p.nouns.has('glow') || p.nouns.has('panel')),
        action: () => reply('scene2.smellOzone', replies.smellOzone),
      },
      {
        id: 'scene2.smellArchway',
        priority: 1888,
        match: (p) => p.intents.has('smell') && p.nouns.has('archway'),
        action: () => reply('scene2.smellArchway', replies.smellArchway),
      },
      {
        id: 'scene2.smellSlime',
        priority: 1887,
        when: (_ctx, flags) => flags.slimePresent ?? false,
        match: (p) => p.intents.has('smell') && p.nouns.has('slime'),
        action: () => reply('scene2.smellSlime', replies.smellSlime),
      },
      {
        id: 'scene2.smellRubble',
        priority: 1886,
        match: (p) =>
          p.intents.has('smell') &&
          (p.nouns.has('rubble') || p.nouns.has('debris')),
        action: () => reply('scene2.smellRubble', replies.smellRubble),
      },
      {
        id: 'scene2.smellVents',
        priority: 1885,
        match: (p) => p.intents.has('smell') && p.nouns.has('vent'),
        action: () => reply('scene2.smellVents', replies.smellVents),
      },
      {
        id: 'scene2.smellDisc',
        priority: 1884,
        match: (p) => p.intents.has('smell') && p.nouns.has('redDisc'),
        action: () => reply('scene2.smellDisc', replies.smellDisc),
      },

      // ===== LISTEN RULES (priority 1883-1880) =====
      {
        id: 'scene2.listenHum',
        priority: 1883,
        when: (_ctx, flags) => flags.ambientHum ?? false,
        match: (p) =>
          p.intents.has('listen') &&
          (p.nouns.size === 0 || p.nouns.has('area')),
        action: () => reply('scene2.listenHum', replies.listenHum),
      },
      {
        id: 'scene2.listenQuiet',
        priority: 1882,
        when: (_ctx, flags) => !(flags.ambientHum ?? false),
        match: (p) =>
          p.intents.has('listen') &&
          (p.nouns.size === 0 || p.nouns.has('area')),
        action: () => reply('scene2.listenQuiet', replies.listenQuiet),
      },
      {
        id: 'scene2.listenArchway',
        priority: 1881,
        match: (p) => p.intents.has('listen') && p.nouns.has('archway'),
        action: () => reply('scene2.listenArchway', replies.listenArchway),
      },
      {
        id: 'scene2.listenMachine',
        priority: 1880,
        match: (p) => p.intents.has('listen') && p.nouns.has('machine'),
        action: (_p, _raw, _ctx, flags) => {
          if (flags.machinePoweredDown) {
            return reply('scene2.listenMachine', replies.listenMachineSilent);
          }
          return reply('scene2.listenMachine', replies.listenMachineHum);
        },
      },

      // ===== TOUCH RULES (priority 1879-1873) =====
      {
        id: 'scene2.touchColdMetal',
        priority: 1879,
        match: (p) =>
          p.intents.has('touch') &&
          (p.nouns.has('wall') ||
            p.nouns.has('machine') ||
            p.nouns.has('pillar')),
        action: () => reply('scene2.touchColdMetal', replies.touchColdMetal),
      },
      {
        id: 'scene2.touchRubble',
        priority: 1878,
        match: (p) =>
          p.intents.has('touch') &&
          (p.nouns.has('rubble') || p.nouns.has('debris')),
        action: () => reply('scene2.touchRubble', replies.touchRubble),
      },
      {
        id: 'scene2.touchPanel',
        priority: 1877,
        match: (p) => p.intents.has('touch') && p.nouns.has('panel'),
        action: () => reply('scene2.touchPanel', replies.touchPanel),
      },
      {
        id: 'scene2.touchSlime',
        priority: 1876,
        when: (_ctx, flags) => flags.slimePresent ?? false,
        match: (p) => p.intents.has('touch') && p.nouns.has('slime'),
        action: (_p, _raw, _ctx, flags) => {
          flags.slimeTouched = true;
          return reply('scene2.touchSlime', replies.touchSlime);
        },
      },
      {
        id: 'scene2.touchGlow',
        priority: 1875,
        match: (p) => p.intents.has('touch') && p.nouns.has('glow'),
        action: () => reply('scene2.touchGlow', replies.touchGlow),
      },
      {
        id: 'scene2.touchDisc',
        priority: 1874,
        match: (p) => p.intents.has('touch') && p.nouns.has('redDisc'),
        action: () => reply('scene2.touchDisc', replies.touchDisc),
      },
      {
        id: 'scene2.touchCables',
        priority: 1873,
        match: (p) => p.intents.has('touch') && p.nouns.has('cable'),
        action: () => reply('scene2.touchCables', replies.touchCables),
      },

      // ===== TASTE RULES (priority 1872) =====
      {
        id: 'scene2.tasteNo',
        priority: 1872,
        match: (p) => p.intents.has('taste'),
        action: () => reply('scene2.tasteNo', replies.tasteNo),
      },

      // ===== WAIT/TIME RULES (priority 1870) =====
      {
        id: 'scene2.wait',
        priority: 1870,
        match: (p, raw) =>
          p.verbs.has('wait') || raw.match(/^(wait|z|pause)$/i) !== null,
        action: (_p, _raw, ctx) =>
          reply(
            'scene2.wait',
            pickVariant(ctx, 'wait', [replies.waitA, replies.waitB])
          ),
      },

      // ===== MOVEMENT RULES (priority 1867-1860) =====
      {
        id: 'scene2.jump',
        priority: 1867,
        match: (p) => p.verbs.has('jump'),
        action: () => reply('scene2.jump', replies.jump),
      },
      {
        id: 'scene2.kickAir',
        priority: 1866,
        match: (p) => p.verbs.has('kick') && p.nouns.size === 0,
        action: () => reply('scene2.kickAir', replies.kickAir),
      },
      {
        id: 'scene2.run',
        priority: 1865,
        match: (p) => p.verbs.has('run'),
        action: () => reply('scene2.run', replies.run),
      },
      {
        id: 'scene2.crouch',
        priority: 1864,
        match: (p) => p.verbs.has('crouch'),
        action: () => reply('scene2.crouch', replies.crouch),
      },
      {
        id: 'scene2.hide',
        priority: 1863,
        match: (p) => p.verbs.has('hide'),
        action: () => reply('scene2.hide', replies.hide),
      },
      {
        id: 'scene2.climbPillar',
        priority: 1862,
        match: (p) => p.verbs.has('climb') && p.nouns.has('pillar'),
        action: () => reply('scene2.climbPillar', replies.climbPillar),
      },
      {
        id: 'scene2.climbWall',
        priority: 1861,
        match: (p) => p.verbs.has('climb') && p.nouns.has('wall'),
        action: () => reply('scene2.climbWall', replies.climbWall),
      },
      {
        id: 'scene2.climbCrate',
        priority: 1860,
        match: (p) => p.verbs.has('climb') && p.nouns.has('blueCrate'),
        action: () => reply('scene2.climbCrate', replies.climbCrate),
      },

      // ===== INTERACTION RULES (priority 1859-1840) =====
      {
        id: 'scene2.searchRubbleFound',
        priority: 1859,
        when: (ctx, flags) => !has(ctx, 'metal tab') && (flags.floorHasRubble ?? false),
        match: (p) =>
          p.intents.has('search') &&
          (p.nouns.has('rubble') || p.nouns.has('debris')),
        action: (_p, _raw, ctx, flags) => {
          ctx.inventory = ctx.inventory ?? new Set<string>();
          ctx.inventory.add('metal tab');
          flags.rubbleSearched = true;
          return reply('scene2.searchFoundTab', replies.searchFoundTab);
        },
      },
      {
        id: 'scene2.searchRubbleNothing',
        priority: 1858,
        when: (ctx) => has(ctx, 'metal tab'),
        match: (p) =>
          p.intents.has('search') &&
          (p.nouns.has('rubble') || p.nouns.has('debris')),
        action: () => reply('scene2.searchNothing', replies.searchNothing),
      },
      {
        id: 'scene2.searchCrate',
        priority: 1857,
        match: (p) => p.intents.has('search') && p.nouns.has('blueCrate'),
        action: () => reply('scene2.searchCrate', replies.searchCrate),
      },
      {
        id: 'scene2.searchArea',
        priority: 1856,
        match: (p) =>
          p.intents.has('search') &&
          (p.nouns.has('area') || p.nouns.size === 0),
        action: () => reply('scene2.searchArea', replies.searchArea),
      },
      {
        id: 'scene2.scanMachine',
        priority: 1855,
        match: (p) => p.intents.has('scan') && p.nouns.has('machine'),
        action: () => reply('scene2.scanMachine', replies.scanMachine),
      },
      {
        id: 'scene2.scanArchway',
        priority: 1854,
        match: (p) => p.intents.has('scan') && p.nouns.has('archway'),
        action: () => reply('scene2.scanArchway', replies.scanArchway),
      },
      {
        id: 'scene2.scanPanel',
        priority: 1853,
        match: (p) => p.intents.has('scan') && p.nouns.has('panel'),
        action: () => reply('scene2.scanPanel', replies.scanPanel),
      },
      {
        id: 'scene2.readSymbolsSuccess',
        priority: 1852,
        when: (ctx) => knows(ctx, 'symbolsDecoded'),
        match: (p) => p.intents.has('read') && p.nouns.has('symbol'),
        action: (_p, _raw, ctx) => {
          ctx.lastFocus = 'symbol';
          return reply(
            'scene2.readSymbolsSuccess',
            replies.readSymbolsSuccess
          );
        },
      },
      {
        id: 'scene2.readSymbolsFail',
        priority: 1851,
        when: (ctx) => !knows(ctx, 'symbolsDecoded'),
        match: (p) => p.intents.has('read') && p.nouns.has('symbol'),
        action: (_p, _raw, ctx) => {
          ctx.lastFocus = 'symbol';
          ctx.knowledge = ctx.knowledge ?? new Set<string>();
          ctx.knowledge.add('symbolsDecoded');
          return reply('scene2.readSymbolsFail', replies.readSymbolsFail);
        },
      },
      {
        id: 'scene2.readPanel',
        priority: 1850,
        match: (p) => p.intents.has('read') && p.nouns.has('panel'),
        action: () => reply('scene2.readPanel', replies.readPanel),
      },
      {
        id: 'scene2.readStains',
        priority: 1849,
        match: (p) => p.intents.has('read') && p.nouns.has('stain'),
        action: () => reply('scene2.readStains', replies.readStains),
      },
      {
        id: 'scene2.pressPanelUnlocked',
        priority: 1848,
        when: (_ctx, flags) => flags.panelUnlocked ?? false,
        match: (p) => p.intents.has('press') && p.nouns.has('panel'),
        action: () => reply('scene2.pressPanelBeep', replies.pressPanelBeep),
      },
      {
        id: 'scene2.pressPanelDead',
        priority: 1847,
        when: (_ctx, flags) => !(flags.panelUnlocked ?? false),
        match: (p) => p.intents.has('press') && p.nouns.has('panel'),
        action: () => reply('scene2.pressPanelDead', replies.pressPanelDead),
      },
      {
        id: 'scene2.cleanWall',
        priority: 1846,
        match: (p) => p.intents.has('clean') && p.nouns.has('wall'),
        action: () => reply('scene2.cleanWall', replies.cleanWall),
      },
      {
        id: 'scene2.cleanFloor',
        priority: 1845,
        match: (p) => p.intents.has('clean') && p.nouns.has('deck'),
        action: (_p, _raw, _ctx, flags) => {
          flags.gritSwept = true;
          return reply('scene2.cleanFloor', replies.cleanFloor);
        },
      },
      {
        id: 'scene2.cleanStains',
        priority: 1844,
        match: (p) => p.intents.has('clean') && p.nouns.has('stain'),
        action: (_p, _raw, _ctx, flags) => {
          flags.stainsWiped = true;
          return reply('scene2.cleanStains', replies.cleanStains);
        },
      },
      {
        id: 'scene2.cleanSymbolsReveal',
        priority: 1843,
        when: (_ctx, flags) => !(flags.hiddenPanelSeamVisible ?? false),
        match: (p) => p.intents.has('clean') && p.nouns.has('symbol'),
        action: (_p, _raw, _ctx, flags) => {
          flags.symbolsWiped = true;
          flags.hiddenPanelSeamVisible = true;
          return reply('scene2.cleanSymbolsReveal', replies.cleanSymbolsReveal);
        },
      },
      {
        id: 'scene2.cleanSymbols',
        priority: 1842,
        when: (_ctx, flags) => flags.hiddenPanelSeamVisible ?? false,
        match: (p) => p.intents.has('clean') && p.nouns.has('symbol'),
        action: () => reply('scene2.cleanSymbols', replies.cleanSymbols),
      },
      {
        id: 'scene2.cleanPanel',
        priority: 1841,
        match: (p) => p.intents.has('clean') && p.nouns.has('panel'),
        action: () => reply('scene2.cleanPanel', replies.cleanPanel),
      },
      {
        id: 'scene2.cleanVents',
        priority: 1840,
        match: (p) => p.intents.has('clean') && p.nouns.has('vent'),
        action: (_p, _raw, _ctx, flags) => {
          flags.ventsDusty = false;
          return reply('scene2.cleanVents', replies.cleanVents);
        },
      },

      // ===== OPEN/CLOSE RULES (priority 1839-1830) =====
      {
        id: 'scene2.openArchway',
        priority: 1839,
        match: (p) => p.intents.has('open') && p.nouns.has('archway'),
        action: () => reply('scene2.openArchway', replies.openArchway),
      },
      {
        id: 'scene2.closeArchway',
        priority: 1838,
        match: (p) => p.intents.has('close') && p.nouns.has('archway'),
        action: () => reply('scene2.closeArchway', replies.closeArchway),
      },
      {
        id: 'scene2.openPanelSeam',
        priority: 1837,
        when: (_ctx, flags) => flags.hiddenPanelSeamVisible ?? false,
        match: (p) => p.intents.has('open') && p.nouns.has('panel'),
        action: (_p, _raw, _ctx, flags) => {
          flags.panelUnlocked = true;
          return reply('scene2.openPanelSeam', replies.openPanelSeam);
        },
      },
      {
        id: 'scene2.openPanel',
        priority: 1836,
        when: (_ctx, flags) => !(flags.hiddenPanelSeamVisible ?? false),
        match: (p) => p.intents.has('open') && p.nouns.has('panel'),
        action: () => reply('scene2.openPanel', replies.openPanel),
      },
      {
        id: 'scene2.openCrate',
        priority: 1835,
        match: (p) => p.intents.has('open') && p.nouns.has('blueCrate'),
        action: () => reply('scene2.openCrate', replies.openCrate),
      },
      {
        id: 'scene2.openMachine',
        priority: 1834,
        match: (p) => p.intents.has('open') && p.nouns.has('machine'),
        action: () => reply('scene2.openMachine', replies.openMachine),
      },
      {
        id: 'scene2.closePanel',
        priority: 1833,
        match: (p) => p.intents.has('close') && p.nouns.has('panel'),
        action: () => reply('scene2.closePanel', replies.closePanel),
      },
      {
        id: 'scene2.closeCrate',
        priority: 1832,
        match: (p) => p.intents.has('close') && p.nouns.has('blueCrate'),
        action: () => reply('scene2.closeCrate', replies.closeCrate),
      },

      // ===== PUSH/PULL/LIFT RULES (priority 1829-1820) =====
      {
        id: 'scene2.pushCrate',
        priority: 1829,
        match: (p) => p.verbs.has('push') && p.nouns.has('blueCrate'),
        action: () => reply('scene2.pushCrate', replies.pushCrate),
      },
      {
        id: 'scene2.pullCrate',
        priority: 1828,
        match: (p) => p.verbs.has('pull') && p.nouns.has('blueCrate'),
        action: () => reply('scene2.pullCrate', replies.pullCrate),
      },
      {
        id: 'scene2.liftCrate',
        priority: 1827,
        match: (p) => p.verbs.has('lift') && p.nouns.has('blueCrate'),
        action: () => reply('scene2.liftCrate', replies.takeBlueCrate),
      },
      {
        id: 'scene2.moveCrate',
        priority: 1826,
        match: (p) => p.verbs.has('move') && p.nouns.has('blueCrate'),
        action: () => reply('scene2.moveCrate', replies.moveCrate),
      },
      {
        id: 'scene2.pushMachine',
        priority: 1825,
        match: (p) => p.verbs.has('push') && p.nouns.has('machine'),
        action: () => reply('scene2.pushMachine', replies.pushMachine),
      },
      {
        id: 'scene2.pullCables',
        priority: 1824,
        match: (p) => p.verbs.has('pull') && p.nouns.has('cable'),
        action: () => reply('scene2.pullCables', replies.pullCables),
      },
      {
        id: 'scene2.pushPanel',
        priority: 1823,
        match: (p) => p.verbs.has('push') && p.nouns.has('panel'),
        action: () => reply('scene2.pushPanel', replies.pushPanel),
      },
      {
        id: 'scene2.pullRubble',
        priority: 1822,
        match: (p) => p.verbs.has('pull') && p.nouns.has('rubble'),
        action: () => reply('scene2.pullRubble', replies.pullRubble),
      },
      {
        id: 'scene2.liftDebris',
        priority: 1821,
        match: (p) => p.verbs.has('lift') && p.nouns.has('debris'),
        action: () => reply('scene2.liftDebris', replies.liftDebris),
      },

      // ===== TAKE RULES (priority 1820-1810) =====
      {
        id: 'scene2.takeRedDisc',
        priority: 1820,
        when: (ctx, flags) => !has(ctx, 'red disc') && (flags.hasRedDisc ?? false),
        match: (p) => p.intents.has('take') && p.nouns.has('redDisc'),
        action: (_p, _raw, ctx, flags) => {
          ctx.inventory = ctx.inventory ?? new Set<string>();
          ctx.inventory.add('red disc');
          flags.hasRedDisc = false;
          return reply('scene2.takeRedDisc', replies.takeRedDisc);
        },
      },
      {
        id: 'scene2.takeCylinder',
        priority: 1819,
        when: (ctx, flags) =>
          !has(ctx, 'silver cylinder') && (flags.hasSilverCylinder ?? false),
        match: (p) => p.intents.has('take') && p.nouns.has('silverCylinder'),
        action: (_p, _raw, ctx, flags) => {
          ctx.inventory = ctx.inventory ?? new Set<string>();
          ctx.inventory.add('silver cylinder');
          flags.hasSilverCylinder = false;
          return reply('scene2.takeCylinder', replies.takeCylinder);
        },
      },
      {
        id: 'scene2.takeBlueCrate',
        priority: 1818,
        when: (_ctx, flags) => flags.hasBlueCrate ?? false,
        match: (p) => p.intents.has('take') && p.nouns.has('blueCrate'),
        action: () => reply('scene2.takeBlueCrate', replies.takeBlueCrate),
      },
      {
        id: 'scene2.takeMachine',
        priority: 1817,
        match: (p) => p.intents.has('take') && p.nouns.has('machine'),
        action: () => reply('scene2.takeMachine', replies.takeMachine),
      },
      {
        id: 'scene2.takePanel',
        priority: 1816,
        match: (p) => p.intents.has('take') && p.nouns.has('panel'),
        action: () => reply('scene2.takePanel', replies.takePanel),
      },
      {
        id: 'scene2.takeWall',
        priority: 1815,
        match: (p) => p.intents.has('take') && p.nouns.has('wall'),
        action: () => reply('scene2.takeWall', replies.takeWall),
      },
      {
        id: 'scene2.takePipes',
        priority: 1814,
        match: (p) => p.intents.has('take') && p.nouns.has('pipe'),
        action: () => reply('scene2.takePipes', replies.takePipes),
      },
      {
        id: 'scene2.takeCables',
        priority: 1813,
        match: (p) => p.intents.has('take') && p.nouns.has('cable'),
        action: () => reply('scene2.takeCables', replies.takeCables),
      },
      {
        id: 'scene2.takeSlime',
        priority: 1812,
        when: (_ctx, flags) => flags.slimePresent ?? false,
        match: (p) => p.intents.has('take') && p.nouns.has('slime'),
        action: () => reply('scene2.takeSlime', replies.takeSlime),
      },
      {
        id: 'scene2.takeDebris',
        priority: 1811,
        match: (p) => p.intents.has('take') && p.nouns.has('debris'),
        action: () => reply('scene2.takeDebris', replies.takeDebris),
      },
      {
        id: 'scene2.takeNothing',
        priority: 1810,
        match: (p) => p.intents.has('take') && p.nouns.size === 0,
        action: () => reply('scene2.takeNothing', replies.takeNothing),
      },

      // ===== THROW RULES (priority 1809-1803) =====
      {
        id: 'scene2.throwDiscAtMachine',
        priority: 1809,
        when: (ctx) => has(ctx, 'red disc'),
        match: (p) => p.verbs.has('throw') && p.nouns.has('machine'),
        action: () => reply('scene2.throwDiscAtMachine', replies.throwDiscAtMachine),
      },
      {
        id: 'scene2.throwDiscAtArchway',
        priority: 1808,
        when: (ctx) => has(ctx, 'red disc'),
        match: (p) => p.verbs.has('throw') && p.nouns.has('archway'),
        action: () => reply('scene2.throwDiscAtArchway', replies.throwDiscAtArchway),
      },
      {
        id: 'scene2.throwDiscAtPanel',
        priority: 1807,
        when: (ctx) => has(ctx, 'red disc'),
        match: (p) => p.verbs.has('throw') && p.nouns.has('panel'),
        action: () => reply('scene2.throwDiscAtPanel', replies.throwDiscAtPanel),
      },
      {
        id: 'scene2.throwDisc',
        priority: 1806,
        when: (ctx) => has(ctx, 'red disc'),
        match: (p) =>
          p.verbs.has('throw') &&
          (p.nouns.has('redDisc') || p.nouns.size === 0),
        action: (_p, _raw, _ctx, flags) => {
          flags.discThrown = true;
          return reply('scene2.throwDisc', replies.throwDisc);
        },
      },
      {
        id: 'scene2.throwCylinder',
        priority: 1805,
        when: (ctx) => has(ctx, 'silver cylinder'),
        match: (p) => p.verbs.has('throw') && p.nouns.has('silverCylinder'),
        action: () => reply('scene2.throwCylinder', replies.throwCylinder),
      },
      {
        id: 'scene2.throwNothing',
        priority: 1804,
        match: (p) => p.verbs.has('throw'),
        action: () => reply('scene2.throwNothing', replies.throwNothing),
      },

      // ===== KICK RULES (priority 1803-1799) =====
      {
        id: 'scene2.kickRubble',
        priority: 1803,
        match: (p) => p.verbs.has('kick') && p.nouns.has('rubble'),
        action: () => reply('scene2.kickRubble', replies.kickRubble),
      },
      {
        id: 'scene2.kickCrate',
        priority: 1802,
        match: (p) => p.verbs.has('kick') && p.nouns.has('blueCrate'),
        action: () => reply('scene2.kickCrate', replies.kickCrate),
      },
      {
        id: 'scene2.kickMachine',
        priority: 1801,
        match: (p) => p.verbs.has('kick') && p.nouns.has('machine'),
        action: () => reply('scene2.kickMachine', replies.kickMachine),
      },
      {
        id: 'scene2.kickWall',
        priority: 1800,
        match: (p) => p.verbs.has('kick') && p.nouns.has('wall'),
        action: () => reply('scene2.kickWall', replies.kickWall),
      },

      // ===== USE RULES (priority 1799-1790) =====
      {
        id: 'scene2.useCylinderOnPanel',
        priority: 1799,
        when: (ctx) => has(ctx, 'silver cylinder'),
        match: (p) =>
          (p.verbs.has('use') || p.verbs.has('insert')) &&
          p.nouns.has('silverCylinder') &&
          p.nouns.has('panel'),
        action: (_p, _raw, ctx, flags) => {
          ctx.inventory?.delete('silver cylinder');
          flags.panelUnlocked = true;
          return reply(
            'scene2.useCylinderOnPanel',
            replies.useCylinderOnPanel
          );
        },
      },
      {
        id: 'scene2.useTabOnMachineSuccess',
        priority: 1798,
        when: (ctx) => has(ctx, 'metal tab') && has(ctx, 'silver cylinder'),
        match: (p) =>
          (p.verbs.has('use') || p.verbs.has('insert')) &&
          p.nouns.has('metalTab') &&
          p.nouns.has('machine'),
        action: (_p, _raw, ctx, flags) => {
          ctx.inventory?.delete('metal tab');
          ctx.inventory?.delete('silver cylinder');
          flags.machineRepaired = true;
          flags.glowStable = true;
          return reply(
            'scene2.useTabOnMachineSuccess',
            replies.useTabOnMachineSuccess
          );
        },
      },
      {
        id: 'scene2.useCylinderOnMachineFail',
        priority: 1797,
        when: (ctx) => has(ctx, 'silver cylinder') && !has(ctx, 'metal tab'),
        match: (p) =>
          (p.verbs.has('use') || p.verbs.has('insert')) &&
          p.nouns.has('silverCylinder') &&
          p.nouns.has('machine'),
        action: () =>
          reply(
            'scene2.useCylinderOnMachineFail',
            replies.useCylinderOnMachineFail
          ),
      },
      {
        id: 'scene2.useTabMissing',
        priority: 1796,
        when: (ctx) => !has(ctx, 'metal tab'),
        match: (p) =>
          (p.verbs.has('use') || p.verbs.has('insert')) &&
          p.nouns.has('metalTab'),
        action: () => reply('scene2.useTabMissing', replies.useTabMissing),
      },
      {
        id: 'scene2.useDiscOnCrate',
        priority: 1795,
        when: (ctx) => has(ctx, 'red disc'),
        match: (p) =>
          p.verbs.has('use') &&
          p.nouns.has('redDisc') &&
          p.nouns.has('blueCrate'),
        action: () => reply('scene2.useDiscOnCrate', replies.useDiscOnCrate),
      },
      {
        id: 'scene2.pryWithDisc',
        priority: 1794,
        when: (ctx) => has(ctx, 'red disc'),
        match: (p) => p.verbs.has('pry') && p.nouns.has('panel'),
        action: () => reply('scene2.pryWithDisc', replies.pryWithDisc),
      },
      {
        id: 'scene2.useDiscHint',
        priority: 1793,
        when: (ctx) => has(ctx, 'red disc'),
        match: (p) => p.verbs.has('use') && p.nouns.has('redDisc'),
        action: () => reply('scene2.useDiscHint', replies.useDiscHint),
      },
      {
        id: 'scene2.useCylinderHint',
        priority: 1792,
        when: (ctx) => has(ctx, 'silver cylinder'),
        match: (p) => p.verbs.has('use') && p.nouns.has('silverCylinder'),
        action: () => reply('scene2.useCylinderHint', replies.useCylinderHint),
      },
      {
        id: 'scene2.useNothing',
        priority: 1791,
        match: (p) => p.verbs.has('use') && p.nouns.size === 0,
        action: () => reply('scene2.useNothing', replies.useNothing),
      },

      // ===== SMASH/BREAK RULES (priority 1789-1783) =====
      {
        id: 'scene2.smashMachine',
        priority: 1789,
        match: (p) => p.verbs.has('smash') && p.nouns.has('machine'),
        action: () => reply('scene2.smashMachine', replies.smashMachine),
      },
      {
        id: 'scene2.smashPanel',
        priority: 1788,
        match: (p) => p.verbs.has('smash') && p.nouns.has('panel'),
        action: () => reply('scene2.smashPanel', replies.smashPanel),
      },
      {
        id: 'scene2.smashWall',
        priority: 1787,
        match: (p) => p.verbs.has('smash') && p.nouns.has('wall'),
        action: () => reply('scene2.smashWall', replies.smashWall),
      },
      {
        id: 'scene2.smashCrate',
        priority: 1786,
        match: (p) => p.verbs.has('smash') && p.nouns.has('blueCrate'),
        action: () => reply('scene2.smashCrate', replies.smashCrate),
      },
      {
        id: 'scene2.smashLights',
        priority: 1785,
        match: (p) => p.verbs.has('smash') && p.nouns.has('lights'),
        action: () => reply('scene2.smashLights', replies.smashLights),
      },
      {
        id: 'scene2.smashDisc',
        priority: 1784,
        when: (ctx) => has(ctx, 'red disc'),
        match: (p) => p.verbs.has('smash') && p.nouns.has('redDisc'),
        action: () => reply('scene2.smashDisc', replies.smashDisc),
      },

      // ===== RUB/SMEAR RULES (priority 1782-1778) =====
      {
        id: 'scene2.rubSlimeOnMachine',
        priority: 1782,
        when: (_ctx, flags) => flags.slimeTouched ?? false,
        match: (p) => p.verbs.has('rub') && p.nouns.has('machine'),
        action: () => reply('scene2.rubSlimeOnMachine', replies.rubSlimeOnMachine),
      },
      {
        id: 'scene2.rubSlimeOnPanel',
        priority: 1781,
        when: (_ctx, flags) => flags.slimeTouched ?? false,
        match: (p) => p.verbs.has('rub') && p.nouns.has('panel'),
        action: () => reply('scene2.rubSlimeOnPanel', replies.rubSlimeOnPanel),
      },
      {
        id: 'scene2.rubSlimeOnWall',
        priority: 1780,
        when: (_ctx, flags) => flags.slimeTouched ?? false,
        match: (p) => p.verbs.has('rub') && p.nouns.has('wall'),
        action: () => reply('scene2.rubSlimeOnWall', replies.rubSlimeOnWall),
      },
      {
        id: 'scene2.rubStains',
        priority: 1779,
        match: (p) => p.verbs.has('rub') && p.nouns.has('stain'),
        action: () => reply('scene2.rubStains', replies.rubStains),
      },

      // ===== TOGGLE/FLIP/TURN RULES (priority 1777-1772) =====
      {
        id: 'scene2.toggleLights',
        priority: 1777,
        match: (p) => p.verbs.has('toggle') && p.nouns.has('lights'),
        action: (_p, _raw, _ctx, flags) => {
          flags.lightsToggled = !(flags.lightsToggled ?? false);
          flags.lightsFlickering = flags.lightsToggled;
          return reply('scene2.toggleLights', replies.toggleLights);
        },
      },
      {
        id: 'scene2.toggleMachine',
        priority: 1776,
        match: (p) => p.verbs.has('toggle') && p.nouns.has('machine'),
        action: (_p, _raw, _ctx, flags) => {
          flags.machinePoweredDown = !(flags.machinePoweredDown ?? false);
          flags.blueGlowActive = !flags.machinePoweredDown;
          if (flags.machinePoweredDown) {
            return reply('scene2.toggleMachine', replies.toggleMachineOff);
          }
          return reply('scene2.toggleMachine', replies.toggleMachineOn);
        },
      },
      {
        id: 'scene2.turnDisc',
        priority: 1775,
        when: (ctx) => has(ctx, 'red disc'),
        match: (p) => p.verbs.has('turn') && p.nouns.has('redDisc'),
        action: () => reply('scene2.turnDisc', replies.turnDisc),
      },
      {
        id: 'scene2.turnCylinder',
        priority: 1774,
        when: (ctx) => has(ctx, 'silver cylinder'),
        match: (p) => p.verbs.has('turn') && p.nouns.has('silverCylinder'),
        action: () => reply('scene2.turnCylinder', replies.turnCylinder),
      },

      // ===== PLUG/UNPLUG RULES (priority 1771-1768) =====
      {
        id: 'scene2.plugCables',
        priority: 1771,
        match: (p) => p.verbs.has('plug') && p.nouns.has('cable'),
        action: (_p, _raw, _ctx, flags) => {
          flags.cablesPlugged = true;
          flags.glowStable = false;
          return reply('scene2.plugCables', replies.plugCables);
        },
      },
      {
        id: 'scene2.unplugCables',
        priority: 1770,
        match: (p) => p.verbs.has('unplug') && p.nouns.has('cable'),
        action: (_p, _raw, _ctx, flags) => {
          flags.cablesPlugged = false;
          return reply('scene2.unplugCables', replies.unplugCables);
        },
      },
      {
        id: 'scene2.plugMachine',
        priority: 1769,
        match: (p) => p.verbs.has('plug') && p.nouns.has('machine'),
        action: () => reply('scene2.plugMachine', replies.plugMachine),
      },

      // ===== SHAKE RULES (priority 1767-1764) =====
      {
        id: 'scene2.shakeCrate',
        priority: 1767,
        match: (p) => p.verbs.has('shake') && p.nouns.has('blueCrate'),
        action: () => reply('scene2.shakeCrate', replies.shakeCrate),
      },
      {
        id: 'scene2.shakeDisc',
        priority: 1766,
        when: (ctx) => has(ctx, 'red disc'),
        match: (p) => p.verbs.has('shake') && p.nouns.has('redDisc'),
        action: () => reply('scene2.shakeDisc', replies.shakeDisc),
      },
      {
        id: 'scene2.shakeCylinder',
        priority: 1765,
        when: (ctx) => has(ctx, 'silver cylinder'),
        match: (p) => p.verbs.has('shake') && p.nouns.has('silverCylinder'),
        action: () => reply('scene2.shakeCylinder', replies.shakeCylinder),
      },

      // ===== APPROACH/ENTER RULES (priority 1763-1758) =====
      {
        id: 'scene2.approachArchway',
        priority: 1763,
        match: (p) =>
          p.intents.has('approach') &&
          (p.nouns.has('archway') || p.nouns.size === 0),
        action: () => reply('scene2.approachArchway', replies.approachArchway),
      },
      {
        id: 'scene2.approachMachine',
        priority: 1762,
        match: (p) => p.intents.has('approach') && p.nouns.has('machine'),
        action: () => reply('scene2.approachMachine', replies.approachMachine),
      },
      {
        id: 'scene2.enterArchwaySafe',
        priority: 1761,
        when: (ctx) => knows(ctx, 'symbolsDecoded'),
        match: (p) => p.intents.has('enter') && p.nouns.has('archway'),
        action: (_p, _raw, ctx, flags) => {
          flags.archwaySafe = true;
          return reply('scene2.enterArchwaySafe', replies.enterArchwaySafe);
        },
      },
      {
        id: 'scene2.enterArchwayBlocked',
        priority: 1760,
        when: (ctx) => !knows(ctx, 'symbolsDecoded'),
        match: (p) => p.intents.has('enter') && p.nouns.has('archway'),
        action: () =>
          reply('scene2.enterArchwayBlocked', replies.enterArchwayBlocked),
      },
      {
        id: 'scene2.enterMachine',
        priority: 1759,
        match: (p) => p.intents.has('enter') && p.nouns.has('machine'),
        action: () => reply('scene2.enterMachine', replies.enterMachine),
      },

      // ===== SOCIAL RULES (priority 1757-1750) =====
      {
        id: 'scene2.talkRogerUnavailable',
        priority: 1757,
        match: (p) => p.intents.has('talk') && p.nouns.has('roger'),
        action: () =>
          reply('scene2.talkRogerUnavailable', replies.talkRogerUnavailable),
      },
      {
        id: 'scene2.talkSelf',
        priority: 1756,
        match: (p) => p.intents.has('talk') && p.nouns.has('self'),
        action: () => reply('scene2.talkSelf', replies.talkSelf),
      },
      {
        id: 'scene2.talkMachine',
        priority: 1755,
        match: (p) => p.intents.has('talk') && p.nouns.has('machine'),
        action: () => reply('scene2.talkMachine', replies.talkMachine),
      },
      {
        id: 'scene2.talkArchway',
        priority: 1754,
        match: (p) => p.intents.has('talk') && p.nouns.has('archway'),
        action: () => reply('scene2.talkArchway', replies.talkArchway),
      },
      {
        id: 'scene2.talkGeneral',
        priority: 1753,
        match: (p) => p.intents.has('talk'),
        action: () => reply('scene2.talkGeneral', replies.talkGeneral),
      },
      {
        id: 'scene2.shout',
        priority: 1752,
        match: (p) => p.verbs.has('shout'),
        action: (_p, _raw, _ctx, flags) => {
          flags.playerShouted = true;
          return reply('scene2.shout', replies.shout);
        },
      },
      {
        id: 'scene2.swear',
        priority: 1751,
        match: (p) => p.verbs.has('swear'),
        action: () => reply('scene2.swear', replies.swear),
      },

      // ===== PLAYER ACTION RULES (priority 1749-1740) =====
      {
        id: 'scene2.sit',
        priority: 1749,
        match: (p) => p.verbs.has('sit'),
        action: (_p, _raw, _ctx, flags) => {
          flags.playerSat = true;
          return reply('scene2.sit', replies.sit);
        },
      },
      {
        id: 'scene2.sleep',
        priority: 1748,
        match: (p) => p.verbs.has('sleep'),
        action: () => reply('scene2.sleep', replies.sleep),
      },
      {
        id: 'scene2.pray',
        priority: 1747,
        match: (p) => p.verbs.has('pray'),
        action: (_p, _raw, _ctx, flags) => {
          flags.playerPrayed = true;
          return reply('scene2.pray', replies.pray);
        },
      },
      {
        id: 'scene2.dance',
        priority: 1746,
        match: (p) => p.verbs.has('dance'),
        action: () => reply('scene2.dance', replies.dance),
      },
      {
        id: 'scene2.sing',
        priority: 1745,
        match: (p) => p.verbs.has('sing'),
        action: () => reply('scene2.sing', replies.sing),
      },
    ];
  }
}
