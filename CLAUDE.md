# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a modular text adventure game engine with voice interaction. It's a deterministic (non-AI) system that uses rule-based command processing, natural language parsing, and Web Speech API integration.

**Key Technologies:**
- React 18 + TypeScript (strict mode)
- PixiJS 8 (WebGL rendering)
- Vite 6 (build tool)
- Capacitor 6 (mobile wrapper)
- PWA via vite-plugin-pwa
- Vitest + Testing Library

## Common Commands

### Development
```bash
npm run dev              # Start Vite dev server (http://localhost:5173)
npm run build            # Production build to dist/
npm run preview          # Preview production build locally
npm run lint             # Run ESLint
```

### Testing
```bash
npm test                 # Run Vitest in watch mode
npm test -- --run        # Run tests once
npm run test:ui          # Open Vitest UI
```

To run a single test file:
```bash
npx vitest tests/parser.test.ts
```

### Capacitor Mobile
```bash
npm run cap:init         # Initialize Capacitor (already done)
npm run cap:sync         # Sync web build to native platforms
npm run cap:open:ios     # Open iOS project in Xcode
npm run cap:open:android # Open Android project in Android Studio
```

## Architecture Overview

### Modular File Structure

```
src/
├── types.ts                 # All TypeScript type definitions
├── App.tsx                  # React + PixiJS integration (UI layer only)
├── utils/
│   ├── lexicons.ts          # Global word mappings (VERBS, NOUNS, etc.)
│   ├── parser.ts            # Natural language parser
│   ├── speech.ts            # Text-to-speech utilities
│   ├── audio.ts             # Recording + speech recognition
│   └── pixi.ts              # PixiJS graphics helpers
├── engine/
│   └── engine.ts            # Rule processing, state management
├── data/
│   └── replies.ts           # Response text database
├── rooms/
│   ├── BaseRoom.ts          # Abstract room interface
│   └── Scene2Room.ts        # Junk Bay room (room-specific rules/lexicons)
└── game/
    └── Game.ts              # Orchestrates global rules + current room
```

### Key Design Principles

1. **Separation of Concerns**
   - **Utils**: Pure functions, no game state
   - **Engine**: State management + rule processing logic
   - **Rooms**: Scene-specific content (rules, lexicons, backgrounds)
   - **Game**: Global rules + room coordination
   - **Data**: Content (replies) separate from logic

2. **Testability**
   - Each module has corresponding test file
   - Pure functions make testing straightforward
   - Placeholder tests exist for all modules

3. **Type Safety**
   - All types defined in [src/types.ts](src/types.ts)
   - Strict TypeScript mode enabled
   - No implicit `any` allowed

## Core Modules

### 1. Types ([src/types.ts](src/types.ts))

Defines all interfaces and types:
- `Context`: Persistent game state (inventory, knowledge, counters, lastFocus)
- `SceneFlags`: Room-specific state (lights, doors, items, progression)
- `Rule`: Priority-based rule definition
- `Parse`: Parsed player input structure
- `MatchResult`: Rule processing result
- `IRoom`: Room interface
- `RecorderController`, `RecorderOptions`: Audio types

### 2. Parser ([src/utils/parser.ts](src/utils/parser.ts))

**Purpose**: Convert natural language to structured data

**Key Functions:**
- `parse(input, ctx, extraNouns?, extraVerbs?, extraAdjs?)` → `Parse`
  - Tokenizes input
  - Classifies words using lexicons
  - Resolves pronouns using `ctx.lastFocus`
  - Infers intents from verbs
- `resolvePronouns(nouns, pronouns, ctx)` → resolved nouns
- `isQuestionish(raw, rawWords)` → boolean
- `normalizeWord(word)` → normalized form
- `hasAny(set, ...items)` → boolean helper

**Lexicons** ([src/utils/lexicons.ts](src/utils/lexicons.ts)):
- `VERBS`: look, take, use, move, open, etc. → canonical forms
- `NOUNS`: area, wall, pipes, etc. → canonical forms
- `ADJECTIVES`: sealed, cold, blue, etc.
- `PREPOSITIONS`: in, on, at, with, etc.
- `PRONOUNS`: it, this, that, him, her
- `PERSONS`: roger, wilco
- `INTENTS`: greet, thanks, help, inventory, ask, feel

### 3. Game Engine ([src/engine/engine.ts](src/engine/engine.ts))

**Purpose**: Process commands through rules

**Key Functions:**
- `respondToCommand(input, ctx, flags, rules, parseFunc, fallbackFunc)` → `MatchResult`
  - Hydrates state
  - Parses input
  - Iterates rules by priority
  - Returns first match or fallback
- `hydrateState(ctx, flags)` - Sets defaults
- `bump(ctx, key)` - Increment counter
- `seen(ctx, key)` - Get counter value
- `pickVariant(ctx, key, options[])` - Deterministic cycling
- `reply(ruleId, text)` - Create reply result
- `pickTarget(p)` - Priority-ordered target selection
- `renderTarget(t)` - Human-readable name

### 4. Room System

**BaseRoom** ([src/rooms/BaseRoom.ts](src/rooms/BaseRoom.ts)):
- Abstract class implementing `IRoom`
- Must define: `id`, `backgroundPath`, `getDefaultFlags()`, `getRules()`, `getNouns()`
- Optional: `getVerbs()`, `getAdjectives()`

**Scene2Room** ([src/rooms/Scene2Room.ts](src/rooms/Scene2Room.ts)):
- Junk Bay implementation
- ~70 room-specific rules (priority 1820-2000)
- Room-specific nouns: archway, machine, panel, redDisc, blueCrate, silverCylinder, metalTab
- Default flags: lights, archway, machine state, item presence, progression

**Adding New Rooms:**
1. Create class extending `BaseRoom`
2. Define `id`, `backgroundPath`
3. Implement `getDefaultFlags()` with room state
4. Implement `getRules()` with room-specific rules
5. Implement `getNouns()` with room-specific vocabulary
6. Update `Game` class to instantiate the room

### 5. Game Class ([src/game/Game.ts](src/game/Game.ts))

**Purpose**: Orchestrate global + room-specific logic

**Key Methods:**
- `processCommand(input)` → `MatchResult`
  - Gets room lexicons
  - Combines global + room rules
  - Processes through engine
- `getBackgroundPath()` - Current room background
- `getContext()`, `getFlags()` - For recorder access

**Global Rules** (priority 2850-3000):
- Social: greet, thanks, help
- System: inventory, status, "where am I"
- Roger knowledge: 7 rules about Roger's backstory

### 6. Audio/Speech ([src/utils/audio.ts](src/utils/audio.ts), [src/utils/speech.ts](src/utils/speech.ts))

**Speech utilities:**
- `isSpeechRecognitionSupported()` - Check browser support
- `createSpeechRecognition()` - Create recognition instance (webkit fallback)
- `speak(text)` - Text-to-speech (rate: 0.95, pitch: 1)

**Audio recorder:**
- `createRecorderController(opts)` → `RecorderController`
  - Manages MediaRecorder + SpeechRecognition lifecycle
  - `start()` - Request mic, start recording + recognition
  - `stop()` - Combines final + interim transcripts, processes through game engine, speaks response
  - `speakLastResponse()` - Re-speak last response
  - `destroy()` - Cleanup resources

**Important implementation details:**
- Uses `isProcessing` flag to prevent race conditions with late-arriving recognition results
- Tracks both `transcript` (final results) and `interimTranscript` (interim results)
- When stop() is called, combines both transcripts since speech recognition often doesn't finalize before stopping
- State machine: idle → recording → idle (no 'recorded' state to prevent blocking)

### 7. PixiJS Integration ([src/App.tsx](src/App.tsx), [src/utils/pixi.ts](src/utils/pixi.ts))

**Pattern: Ref-based Canvas Mounting**

App.tsx creates PixiJS application in `useEffect`:
- React manages component lifecycle
- PixiJS handles all rendering
- No re-renders needed - ticker updates display

**Graphics Utilities:**
- `makeDot(radius, color)` - Create interactive circle
- `repaintDot(dot, radius, color)` - Update circle color

**Critical:**
- Always call `app.destroy(true, { children: true, texture: true })` on unmount
- Never update PixiJS objects from React render

## Rule System

### Rule Structure

```typescript
{
  id: string,                          // Unique identifier
  priority: number,                     // Higher = checked first
  when?: (ctx, flags) => boolean,       // Optional condition
  match: (p, raw, ctx, flags) => boolean,
  action: (p, raw, ctx, flags) => MatchResult
}
```

### Priority Ranges

- **3000**: QA passthrough
- **2900-2850**: Global (social, system, where am I)
- **2000-1969**: Room lookAt commands
- **1890-1883**: Senses (smell, listen, touch, taste)
- **1875-1870**: Actions (wait, jump, kick, throw)
- **1860-1850**: Interactions (search, scan, read, press, clean)
- **1840-1839**: Movement (approach, enter)
- **1820-1810**: Inventory (take)
- **1800-1790**: Use (progression mechanics)
- **1700-1699**: Talk
- **1600-1594**: Roger knowledge

### Adding New Rules

**In Scene2Room:**
```typescript
{
  id: 'scene2.myRule',
  priority: 1975,  // Choose appropriate priority
  match: (p) => p.intents.has('look') && p.nouns.has('newObject'),
  action: (_p, _raw, ctx) => {
    ctx.lastFocus = 'newObject';
    return reply('scene2.myRule', replies.lookNewObject);
  },
}
```

**In Game (global):**
Add to `getGlobalRules()` method

## State Management

### Context (Persistent)

```typescript
{
  inventory: Set<string>,        // Items carried
  knowledge: Set<string>,        // Facts learned
  lastFocus: string | null,      // Last examined object (for pronouns)
  counters: Record<string, number>,  // For variant cycling
  global186: boolean,            // Legacy flag
  global200: boolean,            // QA mode toggle
}
```

### SceneFlags (Room-Specific)

```typescript
{
  // Environment
  lightsWorking, lightsFlickering, ambientHum, slimePresent,
  archwayOpen, wallHasSymbols, wallHasStains, floorHasRubble,
  leftMachinePowered, blueGlowActive,

  // Items
  hasRedDisc, hasBlueCrate, hasSilverCylinder,

  // Progression
  panelUnlocked, machineRepaired, archwaySafe
}
```

### State Mutations

Rules can modify:
- `ctx.inventory.add('item')` / `.delete('item')`
- `ctx.knowledge.add('fact')`
- `ctx.lastFocus = 'object'` (critical for pronoun resolution!)
- `flags.someFlag = true/false`
- `bump(ctx, 'counter')` - Auto-increment

## Testing

### Test Files

All modules have tests:
- [tests/parser.test.ts](tests/parser.test.ts) - Parser logic
- [tests/engine.test.ts](tests/engine.test.ts) - Rule processing
- [tests/speech.test.ts](tests/speech.test.ts) - TTS utilities
- [tests/audio.test.ts](tests/audio.test.ts) - Recording
- [tests/pixi.test.ts](tests/pixi.test.ts) - Graphics
- [tests/room.test.ts](tests/room.test.ts) - Room system
- [tests/game.test.ts](tests/game.test.ts) - Game orchestration
- [tests/App.test.tsx](tests/App.test.tsx) - React component

### Writing Tests

Use Vitest globals (auto-imported via config):
```typescript
import { describe, it, expect } from 'vitest';

describe('MyModule', () => {
  it('should do something', () => {
    expect(true).toBe(true);
  });
});
```

## PWA Configuration

In [vite.config.ts](vite.config.ts):
- `registerType: 'autoUpdate'` - Auto-updates SW
- `devOptions.enabled: true` - SW works in dev mode
- `workbox.maximumFileSizeToCacheInBytes: 4MB`
- `base` path set to `/roger/` for GitHub Pages

## Capacitor Configuration

In [capacitor.config.ts](capacitor.config.ts):
- `appId: 'com.jonborchardt.roger'`
- `webDir: 'dist'` - Points to Vite build output
- Android project in `android/` directory

## GitHub Pages Deployment

[.github/workflows/deploy.yml](.github/workflows/deploy.yml):
1. Triggered on push to `main`
2. Builds with Node 20: `npm ci` → `npm run build`
3. Uploads `dist/` artifact
4. Deploys to GitHub Pages

**IMPORTANT:** `base` in vite.config.ts must match repo name.

## Development Workflow

### Adding a New Object to Scene2Room

1. **Add to lexicon** in `Scene2Room.getNouns()`:
   ```typescript
   newObject: 'newObject',
   alias: 'newObject',
   ```

2. **Add to replies.ts**:
   ```typescript
   lookNewObject: 'Description of the new object.',
   ```

3. **Add lookAt rule** to `Scene2Room.getRules()`:
   ```typescript
   {
     id: 'scene2.lookNewObject',
     priority: 1972,
     match: (p) => p.intents.has('look') && p.nouns.has('newObject'),
     action: (_p, _raw, ctx) => {
       ctx.lastFocus = 'newObject';
       return reply('scene2.lookNewObject', replies.lookNewObject);
     },
   }
   ```

4. **Add interaction rules** as needed (take, use, etc.)

5. **Add to default flags** in `getDefaultFlags()` if stateful

### Debugging

- Check browser console for Web Speech API errors
- Use `npm run dev` for hot reload
- Use `statusText` in PixiJS display to show recorder state
- Add `console.log` in rules to trace matching
- Use `ctx.lastFocus` to debug pronoun resolution

## Common Patterns

### Pronoun Resolution

Always set `ctx.lastFocus` after examining objects:
```typescript
ctx.lastFocus = 'archway';
```

This allows "look at it" to work after "look at archway".

### Deterministic Variants

Use `pickVariant` for response variety:
```typescript
pickVariant(ctx, 'wait', [replies.waitA, replies.waitB])
```

Cycles through options based on counters.

### Conditional Rules

Use `when` for state-dependent rules:
```typescript
when: (ctx, flags) => flags.lightsWorking === true,
```

### Progressive Hints

Fallback function provides intent-specific hints when no rule matches.

## Browser Compatibility

- Target: ES2022
- Web Speech API: Chrome, Edge, Safari (detection + fallback)
- MediaRecorder API: Modern browsers only
- No polyfills for older browsers

## Performance Notes

- PixiJS ticker runs constantly - keep logic minimal
- Parser called on every command - lexicons are O(n)
- Rules checked in priority order - stop at first match
- Service worker caches all assets for offline use

## Key Files Summary

| File | Purpose | When to Modify |
|------|---------|----------------|
| `types.ts` | Type definitions | Adding new state/flags |
| `lexicons.ts` | Global word mappings | Adding common vocabulary |
| `parser.ts` | NLP logic | Changing parsing rules |
| `engine.ts` | Rule processing | Core engine changes |
| `replies.ts` | Response text | Adding/editing dialogue |
| `Scene2Room.ts` | Current room | Scene-specific content |
| `Game.ts` | Orchestration | Global rules, room registry |
| `App.tsx` | React/PixiJS | UI changes only |
