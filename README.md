# Roger - Text Adventure Game Engine

A modular text adventure game engine with voice interaction using:

- React + Vite + TypeScript
- Pixi.js for graphics rendering
- PWA service worker via `vite-plugin-pwa`
- Capacitor (iOS/Android support)
- Web Speech API for voice input/output
- Deterministic rule-based game logic
- GitHub Pages deploy via Actions
- Testing via Vitest + Testing Library

## Quick Start

```bash
npm install
npm run dev
```

## Project Structure

```
src/
├── types.ts                    # TypeScript type definitions
├── App.tsx                     # Main React component (PixiJS integration)
├── main.tsx                    # React entry point
├── styles.css                  # Global styles
├── utils/
│   ├── lexicons.ts             # Word category mappings
│   ├── parser.ts               # Natural language parser
│   ├── speech.ts               # Text-to-speech utilities
│   ├── audio.ts                # Recording & speech recognition
│   └── pixi.ts                 # PixiJS graphics utilities
├── engine/
│   └── engine.ts               # Rule processing engine
├── data/
│   └── replies.ts              # Game response text database
├── rooms/
│   ├── BaseRoom.ts             # Abstract room class
│   └── Scene2Room.ts           # Junk Bay room implementation
└── game/
    └── Game.ts                 # Game orchestration & global rules

tests/
├── parser.test.ts              # Parser logic tests
├── engine.test.ts              # Game engine tests
├── speech.test.ts              # Speech utilities tests
├── audio.test.ts               # Audio recording tests
├── pixi.test.ts                # PixiJS utilities tests
├── room.test.ts                # Room system tests
└── game.test.ts                # Game class tests
```

## Architecture

### Modular Design

The codebase is organized into distinct, testable modules:

1. **Utilities** (`src/utils/`): Reusable functionality
   - Lexicons for natural language understanding
   - Parser for command tokenization
   - Speech synthesis and recognition
   - Audio recording management
   - PixiJS helper functions

2. **Engine** (`src/engine/`): Core game logic
   - Rule processing system
   - State management (context, flags, counters)
   - Variant selection for response diversity

3. **Room System** (`src/rooms/`): Scene-specific logic
   - `BaseRoom`: Abstract interface for all rooms
   - `Scene2Room`: Current junk bay implementation
   - Each room defines: background, rules, lexicons, flags

4. **Game Class** (`src/game/`): Orchestration layer
   - Combines global + room-specific rules
   - Manages room transitions
   - Processes player commands

5. **Data** (`src/data/`): Content database
   - Response text strings
   - Separated from logic for easy content updates

## Testing

```bash
npm test                        # Run tests in watch mode
npm test -- --run              # Run tests once
npm run test:ui                # Open Vitest UI
```

All core modules have comprehensive test coverage.

## PWA Notes

- In dev, the PWA plugin is enabled so you can validate SW registration
- In production, the SW is generated at build time
- Offline caching supports up to 4MB files

## Capacitor Mobile

After install:

```bash
npx cap init
npm run build
npx cap add ios
npx cap add android
npm run cap:sync
```

Then open the native project:

```bash
npm run cap:open:ios          # Opens Xcode
npm run cap:open:android       # Opens Android Studio
```

## GitHub Pages Deployment

Automated deployment via GitHub Actions:

1. Update `base` in [vite.config.ts](vite.config.ts) to your repo name
2. In GitHub: Settings → Pages → set source to "GitHub Actions"
3. Push to `main` branch triggers build & deploy

## Game Design

### Deterministic Rule Engine

- No AI/LLM - purely rule-based
- ~100 priority-sorted rules
- Natural language parsing via lexicons
- Pronoun resolution using focus tracking
- Deterministic variant cycling for response diversity

### Room-Based Architecture

Each room is a self-contained module with:
- Background image path
- Room-specific nouns, verbs, adjectives
- Custom rules for interactions
- Default scene flags

### Adding New Rooms

1. Create class extending `BaseRoom`
2. Define lexicons, rules, background
3. Add to Game class room registry

See [src/rooms/Scene2Room.ts](src/rooms/Scene2Room.ts) for example.

## Development Notes

- **PixiJS Integration**: React manages lifecycle, PixiJS handles rendering
- **Memory Management**: Always destroy PixiJS resources on unmount
- **Type Safety**: Strict TypeScript enabled throughout
- **Browser Compat**: ES2022 target, modern browsers only
- **Web Speech API**: Chrome/Edge/Safari (fallback messages for others)

## License

MIT
