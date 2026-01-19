/**
 * Scene 2 - Junk Bay Room
 * The industrial bay with archway, machine, and various interactive objects
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
    };
  }

  getNouns(): Lexicon {
    return {
      // Scene-specific objects
      archway: 'archway',
      arch: 'archway',
      passage: 'archway',
      exit: 'archway',

      machine: 'machine',
      device: 'machine',
      equipment: 'machine',
      left: 'machine',

      panel: 'panel',
      controls: 'controls',
      control: 'controls',

      glow: 'glow',
      blue: 'glow',

      symbols: 'symbols',
      symbol: 'symbols',
      markings: 'symbols',
      writing: 'symbols',

      stains: 'stains',
      stain: 'stains',

      pillar: 'pillar',
      column: 'pillar',

      // Items
      disc: 'redDisc',
      redDisc: 'redDisc',
      red: 'redDisc',
      reddisc: 'redDisc',
      ring: 'redDisc',

      crate: 'blueCrate',
      blueCrate: 'blueCrate',
      box: 'blueCrate',
      bluebox: 'blueCrate',
      bluecrate: 'blueCrate',

      cylinder: 'silverCylinder',
      silverCylinder: 'silverCylinder',
      silvercylinder: 'silverCylinder',
      cartridge: 'silverCylinder',
      silver: 'silverCylinder',

      tab: 'metalTab',
      metalTab: 'metalTab',
      metaltab: 'metalTab',
      latch: 'metalTab',
    };
  }

  getAdjectives(): Lexicon {
    return {
      industrial: 'industrial',
      gritty: 'industrial',
      blue: 'blue',
      dark: 'dark',
    };
  }

  getRules(): Rule[] {
    return [
      // LOOK: area
      {
        id: 'scene2.lookAround',
        priority: 2000,
        match: (p) =>
          p.intents.has('look') &&
          (p.nouns.has('area') || p.preps.has('around') || p.pronouns.has('here')),
        action: (_p, _raw, ctx) => {
          ctx.lastFocus = 'area';
          return reply(
            'scene2.lookAround',
            pickVariant(ctx, 'lookArea', [replies.lookAreaA, replies.lookAreaB]),
          );
        },
      },

      // LOOK: scene elements
      {
        id: 'scene2.lookWalls',
        priority: 1990,
        match: (p) => p.intents.has('look') && p.nouns.has('wall'),
        action: (_p, _raw, ctx) => {
          ctx.lastFocus = 'wall';
          return reply('scene2.lookWalls', replies.lookWalls);
        },
      },
      {
        id: 'scene2.lookCeiling',
        priority: 1989,
        match: (p) => p.intents.has('look') && p.nouns.has('ceiling'),
        action: (_p, _raw, ctx) => {
          ctx.lastFocus = 'ceiling';
          return reply('scene2.lookCeiling', replies.lookCeiling);
        },
      },
      {
        id: 'scene2.lookLightsFlicker',
        priority: 1988,
        match: (p) =>
          p.intents.has('look') && p.nouns.has('lights') && p.adjs.has('flicker'),
        action: (_p, _raw, ctx, flags) => {
          ctx.lastFocus = 'lights';
          return reply(
            'scene2.lookLightsFlicker',
            flags.lightsFlickering
              ? replies.lookLightsFlicker
              : flags.lightsWorking
                ? replies.lookLightsWorking
                : replies.lookLightsDead,
          );
        },
      },
      {
        id: 'scene2.lookLights',
        priority: 1987,
        match: (p) => p.intents.has('look') && p.nouns.has('lights'),
        action: (_p, _raw, ctx, flags) => {
          ctx.lastFocus = 'lights';
          return reply(
            'scene2.lookLights',
            flags.lightsWorking
              ? replies.lookLightsWorking
              : replies.lookLightsDead,
          );
        },
      },
      {
        id: 'scene2.lookShadows',
        priority: 1986,
        match: (p) => p.intents.has('look') && p.nouns.has('shadows'),
        action: (_p, _raw, ctx) => {
          ctx.lastFocus = 'shadows';
          return reply('scene2.lookShadows', replies.lookShadows);
        },
      },
      {
        id: 'scene2.lookDeck',
        priority: 1985,
        match: (p) => p.intents.has('look') && p.nouns.has('deck'),
        action: (_p, _raw, ctx) => {
          ctx.lastFocus = 'deck';
          return reply('scene2.lookDeck', replies.lookDeck);
        },
      },
      {
        id: 'scene2.lookRubble',
        priority: 1984,
        match: (p) => p.intents.has('look') && p.nouns.has('rubble'),
        action: (_p, _raw, ctx) => {
          ctx.lastFocus = 'rubble';
          return reply('scene2.lookRubble', replies.lookRubble);
        },
      },
      {
        id: 'scene2.lookDebris',
        priority: 1983,
        match: (p) => p.intents.has('look') && p.nouns.has('debris'),
        action: (_p, _raw, ctx) => {
          ctx.lastFocus = 'debris';
          return reply('scene2.lookDebris', replies.lookDebris);
        },
      },
      {
        id: 'scene2.lookPipes',
        priority: 1982,
        match: (p) => p.intents.has('look') && p.nouns.has('pipes'),
        action: (_p, _raw, ctx) => {
          ctx.lastFocus = 'pipes';
          return reply('scene2.lookPipes', replies.lookPipes);
        },
      },
      {
        id: 'scene2.lookVents',
        priority: 1981,
        match: (p) => p.intents.has('look') && p.nouns.has('vents'),
        action: (_p, _raw, ctx) => {
          ctx.lastFocus = 'vents';
          return reply('scene2.lookVents', replies.lookVents);
        },
      },
      {
        id: 'scene2.lookCables',
        priority: 1980,
        match: (p) => p.intents.has('look') && p.nouns.has('cables'),
        action: (_p, _raw, ctx) => {
          ctx.lastFocus = 'cables';
          return reply('scene2.lookCables', replies.lookCables);
        },
      },
      {
        id: 'scene2.lookStains',
        priority: 1979,
        match: (p) => p.intents.has('look') && p.nouns.has('stains'),
        action: (_p, _raw, ctx, flags) => {
          ctx.lastFocus = 'stains';
          if (!flags.wallHasStains)
            return reply(
              'scene2.lookStains',
              'You do not see stains anymore. That is suspicious.',
            );
          return reply('scene2.lookStains', replies.lookStains);
        },
      },
      {
        id: 'scene2.lookSymbols',
        priority: 1978,
        match: (p) => p.intents.has('look') && p.nouns.has('symbols'),
        action: (_p, _raw, ctx, flags) => {
          ctx.lastFocus = 'symbols';
          if (!flags.wallHasSymbols)
            return reply('scene2.lookSymbols', 'No markings worth calling symbols.');
          return reply('scene2.lookSymbols', replies.lookSymbols);
        },
      },
      {
        id: 'scene2.lookPillar',
        priority: 1977,
        match: (p) => p.intents.has('look') && p.nouns.has('pillar'),
        action: (_p, _raw, ctx) => {
          ctx.lastFocus = 'pillar';
          return reply('scene2.lookPillar', replies.lookPillar);
        },
      },
      {
        id: 'scene2.lookArchway',
        priority: 1976,
        match: (p) => p.intents.has('look') && p.nouns.has('archway'),
        action: (_p, _raw, ctx) => {
          ctx.lastFocus = 'archway';
          return reply('scene2.lookArchway', replies.lookArchway);
        },
      },
      {
        id: 'scene2.lookMachine',
        priority: 1975,
        match: (p) => p.intents.has('look') && p.nouns.has('machine'),
        action: (_p, _raw, ctx) => {
          ctx.lastFocus = 'machine';
          return reply('scene2.lookMachine', replies.lookMachine);
        },
      },
      {
        id: 'scene2.lookPanel',
        priority: 1974,
        match: (p) =>
          p.intents.has('look') &&
          (p.nouns.has('panel') || p.nouns.has('controls')),
        action: (_p, _raw, ctx) => {
          ctx.lastFocus = 'panel';
          return reply('scene2.lookPanel', replies.lookPanel);
        },
      },
      {
        id: 'scene2.lookGlow',
        priority: 1973,
        match: (p) => p.intents.has('look') && p.nouns.has('glow'),
        action: (_p, _raw, ctx) => {
          ctx.lastFocus = 'glow';
          return reply('scene2.lookGlow', replies.lookGlow);
        },
      },
      {
        id: 'scene2.lookRedDisc',
        priority: 1972,
        match: (p) => p.intents.has('look') && p.nouns.has('redDisc'),
        action: (_p, _raw, ctx, flags) => {
          ctx.lastFocus = 'redDisc';
          if (!flags.hasRedDisc && !(ctx.inventory?.has('red disc') ?? false)) {
            return reply(
              'scene2.lookRedDisc',
              'You do not see the red disc anymore.',
            );
          }
          return reply('scene2.lookRedDisc', replies.lookRedDisc);
        },
      },
      {
        id: 'scene2.lookBlueCrate',
        priority: 1971,
        match: (p) => p.intents.has('look') && p.nouns.has('blueCrate'),
        action: (_p, _raw, ctx, flags) => {
          ctx.lastFocus = 'blueCrate';
          if (!flags.hasBlueCrate)
            return reply(
              'scene2.lookBlueCrate',
              'You do not see the blue box anymore.',
            );
          return reply('scene2.lookBlueCrate', replies.lookBlueCrate);
        },
      },
      {
        id: 'scene2.lookSilverCylinder',
        priority: 1970,
        match: (p) => p.intents.has('look') && p.nouns.has('silverCylinder'),
        action: (_p, _raw, ctx, flags) => {
          ctx.lastFocus = 'silverCylinder';
          if (
            !flags.hasSilverCylinder &&
            !(ctx.inventory?.has('silver cylinder') ?? false)
          ) {
            return reply(
              'scene2.lookSilverCylinder',
              'You do not see the silver cylinder anymore.',
            );
          }
          return reply('scene2.lookSilverCylinder', replies.lookSilverCylinder);
        },
      },
      {
        id: 'scene2.lookSlime',
        priority: 1969,
        match: (p) => p.intents.has('look') && p.nouns.has('slime'),
        action: (_p, _raw, ctx, flags) => {
          ctx.lastFocus = 'slime';
          return reply(
            'scene2.lookSlime',
            flags.slimePresent ? replies.lookSlimePresent : replies.lookSlimeAbsent,
          );
        },
      },

      // SMELL / LISTEN / TOUCH / TASTE
      {
        id: 'scene2.smellOzone',
        priority: 1890,
        match: (p) =>
          p.intents.has('smell') &&
          (p.nouns.has('ozone') || p.all.has('electric') || p.all.has('burnt')),
        action: (_p, _raw, ctx) => {
          ctx.lastFocus = 'air';
          return reply('scene2.smellOzone', replies.smellOzone);
        },
      },
      {
        id: 'scene2.smellGeneral',
        priority: 1889,
        match: (p) => p.intents.has('smell'),
        action: (_p, _raw, ctx) => {
          ctx.lastFocus = 'air';
          return reply('scene2.smellGeneral', replies.smellMetal);
        },
      },
      {
        id: 'scene2.listen',
        priority: 1888,
        match: (p) => p.intents.has('listen') || p.nouns.has('hum'),
        action: (_p, _raw, ctx, flags) => {
          ctx.lastFocus = 'hum';
          return reply(
            'scene2.listen',
            flags.ambientHum ? replies.listenHum : replies.listenQuiet,
          );
        },
      },
      {
        id: 'scene2.touchSlime',
        priority: 1887,
        match: (p) => p.intents.has('touch') && p.nouns.has('slime'),
        action: (_p, _raw, ctx) => {
          ctx.lastFocus = 'slime';
          return reply('scene2.touchSlime', replies.touchSlime);
        },
      },
      {
        id: 'scene2.touchRubble',
        priority: 1886,
        match: (p) => p.intents.has('touch') && p.nouns.has('rubble'),
        action: (_p, _raw, ctx) => {
          ctx.lastFocus = 'rubble';
          return reply('scene2.touchRubble', replies.touchRubble);
        },
      },
      {
        id: 'scene2.touchPanel',
        priority: 1885,
        match: (p) =>
          p.intents.has('touch') &&
          (p.nouns.has('panel') || p.nouns.has('controls')),
        action: (_p, _raw, ctx) => {
          ctx.lastFocus = 'panel';
          return reply('scene2.touchPanel', replies.touchPanel);
        },
      },
      {
        id: 'scene2.touchGeneral',
        priority: 1884,
        match: (p) => p.intents.has('touch'),
        action: (_p, _raw, ctx) => {
          ctx.lastFocus = pickTarget(ctx) ?? ctx.lastFocus ?? 'deck';
          return reply('scene2.touchGeneral', replies.touchColdMetal);
        },
      },
      {
        id: 'scene2.taste',
        priority: 1883,
        match: (p) => p.intents.has('taste'),
        action: () => reply('scene2.taste', replies.tasteNo),
      },

      // WAIT / JUMP / KICK / THROW
      {
        id: 'scene2.wait',
        priority: 1875,
        match: (p) => p.intents.has('wait'),
        action: (_p, _raw, ctx) =>
          reply(
            'scene2.wait',
            pickVariant(ctx, 'wait', [replies.waitA, replies.waitB]),
          ),
      },
      {
        id: 'scene2.jump',
        priority: 1874,
        match: (p) => p.intents.has('jump'),
        action: () => reply('scene2.jump', replies.jump),
      },
      {
        id: 'scene2.kickRubble',
        priority: 1873,
        match: (p) =>
          p.intents.has('kick') &&
          (p.nouns.has('rubble') || p.nouns.has('debris') || p.nouns.has('deck')),
        action: () => reply('scene2.kickRubble', replies.kickRubble),
      },
      {
        id: 'scene2.kickGeneral',
        priority: 1872,
        match: (p) => p.intents.has('kick'),
        action: () => reply('scene2.kickGeneral', replies.kickAir),
      },
      {
        id: 'scene2.throwDisc',
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
              'scene2.throwDisc',
              'You cannot throw what you do not have.',
            );
          if (ctx.inventory?.has('red disc')) ctx.inventory.delete('red disc');
          flags.hasRedDisc = true;
          ctx.lastFocus = 'redDisc';
          return reply('scene2.throwDisc', replies.throwDisc);
        },
      },
      {
        id: 'scene2.throwGeneral',
        priority: 1870,
        match: (p) => p.intents.has('throw'),
        action: () =>
          reply(
            'scene2.throwGeneral',
            'You mime throwing something. It is not as satisfying as throwing something real.',
          ),
      },

      // SEARCH / SCAN / READ / PRESS / CLEAN
      {
        id: 'scene2.searchFloor',
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
            return reply('scene2.searchFloor', replies.searchFoundTab);
          }
          return reply('scene2.searchFloor', replies.searchNothing);
        },
      },
      {
        id: 'scene2.searchGeneral',
        priority: 1859,
        match: (p) => p.intents.has('search'),
        action: () =>
          reply(
            'scene2.searchGeneral',
            'You search. Pick a target: rubble, debris, machine, panel, archway.',
          ),
      },
      {
        id: 'scene2.scanMachine',
        priority: 1858,
        match: (p) =>
          p.intents.has('scan') && (p.nouns.has('machine') || p.all.has('left')),
        action: (_p, _raw, ctx, flags) => {
          ctx.lastFocus = 'machine';
          if (!flags.leftMachinePowered)
            return reply(
              'scene2.scanMachine',
              'The machine looks inert. No glow, no hum, no help.',
            );
          ctx.knowledge?.add('machineScanned');
          return reply('scene2.scanMachine', replies.scanMachine);
        },
      },
      {
        id: 'scene2.scanGeneral',
        priority: 1857,
        match: (p) => p.intents.has('scan'),
        action: () =>
          reply(
            'scene2.scanGeneral',
            'You scan with your eyes because you do not have an actual scanner.',
          ),
      },
      {
        id: 'scene2.readSymbols',
        priority: 1856,
        match: (p) => p.intents.has('read') && p.nouns.has('symbols'),
        action: (_p, _raw, ctx, flags) => {
          ctx.lastFocus = 'symbols';
          if (!flags.wallHasSymbols)
            return reply('scene2.readSymbols', 'There is nothing to read here.');
          const k = ctx.knowledge ?? new Set<string>();
          ctx.knowledge = k;
          if (!k.has('symbolsDecoded')) {
            k.add('symbolsDecoded');
            return reply('scene2.readSymbols', replies.readSymbolsFail);
          }
          flags.archwaySafe = true;
          return reply('scene2.readSymbols', replies.readSymbolsSuccess);
        },
      },
      {
        id: 'scene2.readGeneral',
        priority: 1855,
        match: (p) => p.intents.has('read'),
        action: () =>
          reply(
            'scene2.readGeneral',
            'There is not much to read that wants to be understood. Try the symbols.',
          ),
      },
      {
        id: 'scene2.pressPanel',
        priority: 1854,
        match: (p) =>
          p.intents.has('press') &&
          (p.nouns.has('panel') || p.nouns.has('controls')),
        action: (_p, _raw, ctx, flags) => {
          ctx.lastFocus = 'panel';
          const hasCylinder = ctx.inventory?.has('silver cylinder') ?? false;
          if (!flags.panelUnlocked && !hasCylinder)
            return reply('scene2.pressPanel', replies.pressPanelDead);
          flags.panelUnlocked = true;
          return reply('scene2.pressPanel', replies.pressPanelBeep);
        },
      },
      {
        id: 'scene2.pressGeneral',
        priority: 1853,
        match: (p) => p.intents.has('press'),
        action: () =>
          reply(
            'scene2.pressGeneral',
            'You press at random. The room does not reward that. Try the panel.',
          ),
      },
      {
        id: 'scene2.cleanWall',
        priority: 1852,
        match: (p) =>
          p.intents.has('clean') && (p.nouns.has('wall') || p.nouns.has('stains')),
        action: (_p, _raw, ctx) => {
          ctx.lastFocus = 'stains';
          return reply('scene2.cleanWall', replies.cleanWall);
        },
      },
      {
        id: 'scene2.cleanFloor',
        priority: 1851,
        match: (p) =>
          p.intents.has('clean') && (p.nouns.has('deck') || p.nouns.has('rubble')),
        action: (_p, _raw, ctx) => {
          ctx.lastFocus = 'deck';
          return reply('scene2.cleanFloor', replies.cleanFloor);
        },
      },
      {
        id: 'scene2.cleanGeneral',
        priority: 1850,
        match: (p) => p.intents.has('clean'),
        action: () =>
          reply(
            'scene2.cleanGeneral',
            'You attempt to clean. The bay offers you more work.',
          ),
      },

      // APPROACH / ENTER archway
      {
        id: 'scene2.approachArchway',
        priority: 1840,
        match: (p) => p.intents.has('approach') && p.nouns.has('archway'),
        action: (_p, _raw, ctx, flags) => {
          ctx.lastFocus = 'archway';
          if (!flags.archwayOpen)
            return reply(
              'scene2.approachArchway',
              'You approach. It is sealed. The bay wins.',
            );
          return reply('scene2.approachArchway', replies.approachArchway);
        },
      },
      {
        id: 'scene2.enterArchway',
        priority: 1839,
        match: (p) => p.intents.has('enter') && p.nouns.has('archway'),
        action: (_p, _raw, ctx, flags) => {
          ctx.lastFocus = 'archway';
          if (!flags.archwayOpen)
            return reply(
              'scene2.enterArchway',
              'You try to go through. It is closed.',
            );
          if (flags.archwaySafe)
            return reply('scene2.enterArchway', replies.enterArchwaySafe);
          return reply('scene2.enterArchway', replies.enterArchwayBlocked);
        },
      },

      // TAKE items
      {
        id: 'scene2.takeRedDisc',
        priority: 1820,
        match: (p) => p.intents.has('take') && p.nouns.has('redDisc'),
        action: (_p, _raw, ctx, flags) => {
          ctx.lastFocus = 'redDisc';
          if (!flags.hasRedDisc)
            return reply('scene2.takeRedDisc', 'You do not see a red disc to take.');
          ctx.inventory?.add('red disc');
          flags.hasRedDisc = false;
          return reply('scene2.takeRedDisc', replies.takeRedDisc);
        },
      },
      {
        id: 'scene2.takeSilverCylinder',
        priority: 1819,
        match: (p) => p.intents.has('take') && p.nouns.has('silverCylinder'),
        action: (_p, _raw, ctx, flags) => {
          ctx.lastFocus = 'silverCylinder';
          if (!flags.hasSilverCylinder)
            return reply(
              'scene2.takeSilverCylinder',
              'You do not see the silver cylinder.',
            );
          ctx.inventory?.add('silver cylinder');
          flags.hasSilverCylinder = false;
          return reply('scene2.takeSilverCylinder', replies.takeCylinder);
        },
      },
      {
        id: 'scene2.takeMetalTab',
        priority: 1818,
        match: (p) => p.intents.has('take') && p.nouns.has('metalTab'),
        action: (_p, _raw, ctx) => {
          ctx.lastFocus = 'metalTab';
          if (ctx.inventory?.has('metal tab'))
            return reply('scene2.takeMetalTab', 'You already have the metal tab.');
          if (ctx.knowledge?.has('foundMetalTab')) {
            ctx.inventory?.add('metal tab');
            return reply(
              'scene2.takeMetalTab',
              'You take the metal tab. It looks like a latch piece.',
            );
          }
          return reply(
            'scene2.takeMetalTab',
            'You do not see any metal tab to take.',
          );
        },
      },
      {
        id: 'scene2.takeBlueCrate',
        priority: 1817,
        match: (p) => p.intents.has('take') && p.nouns.has('blueCrate'),
        action: (_p, _raw, ctx) => {
          ctx.lastFocus = 'blueCrate';
          return reply('scene2.takeBlueCrate', replies.takeBlueCrate);
        },
      },
      {
        id: 'scene2.takeGeneric',
        priority: 1810,
        match: (p) => p.intents.has('take'),
        action: () => reply('scene2.takeGeneric', replies.takeNothing),
      },

      // USE: progression path
      {
        id: 'scene2.useCylinderOnPanel',
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
              'scene2.useCylinderOnPanel',
              'You do not have a silver cylinder.',
            );
          flags.panelUnlocked = true;
          flags.blueGlowActive = true;
          ctx.knowledge?.add('panelAcceptedCylinder');
          return reply('scene2.useCylinderOnPanel', replies.useCylinderOnPanel);
        },
      },
      {
        id: 'scene2.useCylinderOnMachine',
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
              'scene2.useCylinderOnMachine',
              'You do not have a silver cylinder.',
            );
          if (!flags.leftMachinePowered)
            return reply(
              'scene2.useCylinderOnMachine',
              'The machine is not powered. The coupling is dead.',
            );
          if (!ctx.inventory?.has('metal tab'))
            return reply(
              'scene2.useCylinderOnMachine',
              replies.useCylinderOnMachineFail,
            );
          // If they have the tab, guide them to use it explicitly (deterministic gating).
          return reply(
            'scene2.useCylinderOnMachine',
            'The cylinder wants a latch. Try using the metal tab on the machine.',
          );
        },
      },
      {
        id: 'scene2.useTabOnMachine',
        priority: 1798,
        match: (p) =>
          p.intents.has('use') && p.nouns.has('metalTab') && p.nouns.has('machine'),
        action: (_p, _raw, ctx, flags) => {
          ctx.lastFocus = 'machine';
          if (!ctx.inventory?.has('metal tab'))
            return reply('scene2.useTabOnMachine', replies.useTabMissing);
          const hasCylinder = ctx.inventory?.has('silver cylinder') ?? false;
          if (!hasCylinder)
            return reply(
              'scene2.useTabOnMachine',
              'You latch the coupling, but there is no cylinder to seat.',
            );
          flags.machineRepaired = true;
          flags.blueGlowActive = true;
          ctx.knowledge?.add('machineLatched');
          return reply('scene2.useTabOnMachine', replies.useTabOnMachineSuccess);
        },
      },
      {
        id: 'scene2.useGeneral',
        priority: 1790,
        match: (p) => p.intents.has('use'),
        action: (_p, raw, ctx) => {
          // If they said "use it" without object, try lastFocus hint.
          if (ctx.lastFocus) {
            return reply(
              'scene2.useGeneral',
              `Use ${renderTarget(ctx.lastFocus)} how? Try "use X on Y".`,
            );
          }
          return reply(
            'scene2.useGeneral',
            `You try "${raw}". Nothing here is cooperating.`,
          );
        },
      },

      // TALK
      {
        id: 'scene2.talkRoger',
        priority: 1700,
        match: (p) => p.intents.has('talk') && p.person.has('roger'),
        action: (_p, _raw, ctx) => {
          ctx.lastFocus = 'roger';
          return reply('scene2.talkRoger', replies.talkRogerUnavailable);
        },
      },
      {
        id: 'scene2.talkGeneral',
        priority: 1699,
        match: (p) => p.intents.has('talk'),
        action: () => reply('scene2.talkGeneral', replies.talkGeneral),
      },
    ];
  }
}
