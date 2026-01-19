# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a demo project combining React, PixiJS graphics, PWA capabilities, and Capacitor mobile wrapper. The app is a deterministic text adventure/sci-fi game engine with voice input/output using the Web Speech API.

**Key Technologies:**
- React 18 + TypeScript
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
npm run test:ui          # Open Vitest UI
```

### Capacitor Mobile
```bash
npm run cap:init         # Initialize Capacitor (already done)
npm run cap:sync         # Sync web build to native platforms
npm run cap:open:ios     # Open iOS project in Xcode
npm run cap:open:android # Open Android project in Android Studio
```

## Architecture

### Single-File Application

The entire application logic resides in [src/App.tsx](src/App.tsx) (~2,500 lines). This is intentional for this demo project - it's a self-contained example showing how to integrate multiple technologies.

**App.tsx contains:**
- React component with PixiJS lifecycle management
- Deterministic rule engine (~100 priority-based rules)
- Natural language parser (lexicon-based tokenization)
- Web Speech API integration (recognition + synthesis)
- Game state management (context, inventory, scene flags)
- PixiJS graphics rendering (sprites, text, interactive elements)

### PixiJS Integration Pattern

**Critical pattern: Ref-based canvas mounting**

PixiJS and React are kept separate - React manages the component lifecycle while PixiJS handles all rendering:

```typescript
const hostRef = useRef<HTMLDivElement | null>(null);

useEffect(() => {
  const app = new Application();
  await app.init({ resizeTo: hostRef.current });
  hostRef.current?.appendChild(app.canvas);

  // Setup PixiJS scene, event handlers, ticker...

  return () => { app.destroy(true); }; // Critical: cleanup on unmount
}, []);

return <div ref={hostRef} />;
```

**Key points:**
- PixiJS app initialized in `useEffect` (runs once on mount)
- Canvas appended to DOM via ref (not React-rendered)
- Cleanup function destroys PixiJS app to prevent memory leaks
- React doesn't re-render PixiJS content - ticker handles updates

### Rule Engine Architecture

The command processing system is **purely deterministic** (no AI/LLM):

1. **Parse phase**: User input → tokenization → word categorization
   - Lexicons: verbs, nouns, adjectives, prepositions, pronouns, intents, persons
   - Ambiguous word resolution via context (pronoun references, last focus)

2. **Match phase**: Rules sorted by priority (high → low)
   - Each rule: `when (condition) → match (parsed input) → action (response)`
   - First matching rule wins

3. **Action phase**: Update game state, return response text
   - Modify `Context` (inventory, knowledge, counters)
   - Update `SceneFlags` (environment state)

**Rule priorities:**
- 2000+: Meta commands (inventory, help, status, quit)
- 1900-1999: Social interactions (greetings, thanks)
- 1800-1899: Object-specific interactions
- 1700-1799: General actions
- Fallback: Generic "I don't understand" responses

### PWA Configuration

PWA setup is in [vite.config.ts](vite.config.ts) lines 13-53:

- **Auto-update:** Service worker updates automatically without hard refresh
- **Dev mode:** Service worker enabled during development (`devOptions.enabled: true`)
- **Cache limit:** 4MB max file size (`maximumFileSizeToCacheInBytes`)
- **Offline assets:** All JS/CSS/HTML/images cached via Workbox
- **GitHub Pages:** Base path configured via `VITE_BASE` env var (default: `/roger/`)

### Capacitor Setup

Config in [capacitor.config.ts](capacitor.config.ts):
- **appId:** `com.jonborchardt.roger`
- **webDir:** Points to `dist/` (Vite build output)
- **Native projects:** Android folder included; iOS needs `npx cap add ios`

**Build flow for mobile:**
```bash
npm run build        # Build web assets to dist/
npm run cap:sync     # Copy dist/ to native projects
npm run cap:open:android  # Open in Android Studio to build APK/AAB
```

### Testing Setup

Tests use Vitest with jsdom environment (configured in [vite.config.ts](vite.config.ts) lines 63-69):

- **Environment:** jsdom (simulates browser DOM for React Testing Library)
- **Setup file:** [tests/setup.ts](tests/setup.ts) imports jest-dom matchers
- **Coverage:** V8 provider enabled
- **Globals:** Vitest globals (`describe`, `it`, `expect`) available without imports

**Running a single test file:**
```bash
npx vitest tests/App.test.tsx
```

## GitHub Pages Deployment

Automated via [.github/workflows/deploy.yml](.github/workflows/deploy.yml):

1. Triggered on push to `main` branch or manual dispatch
2. Builds with Node 20: `npm ci` → `npm run build`
3. Uploads `dist/` artifact
4. Deploys to GitHub Pages environment

**Important:** The `base` path in [vite.config.ts](vite.config.ts) must match your repo name (currently `/roger/`). Change via `VITE_BASE` env var or edit directly.

## Code Patterns & Conventions

### Memory Management
Always destroy PixiJS resources on component unmount:
```typescript
return () => {
  app.destroy(true, { children: true, texture: true });
};
```

### Feature Detection
All Web APIs have graceful fallbacks with user-facing messages:
```typescript
function isSpeechRecognitionSupported(): boolean {
  const w = window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown };
  return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
}
```

### Type Safety
Strict TypeScript enabled in [tsconfig.json](tsconfig.json):
- No implicit `any`
- Strict null checks
- Unused locals/parameters flagged

### React Patterns
- Functional components only
- Minimal state (all game state in objects passed to rules)
- Single `useEffect` for PixiJS lifecycle
- No prop drilling (single-component app)

## Project Structure

```
src/
├── main.tsx           # React entry point
├── App.tsx            # Main component (all application logic)
└── styles.css         # Global styles

tests/
├── setup.ts           # Vitest + jest-dom setup
└── App.test.tsx       # Basic component tests

public/
├── favicon.svg        # App icon
├── pwa-*.png          # PWA icons (192x192, 512x512)
├── apple-touch-icon.png  # iOS home screen icon
└── scene2.png         # Background image (2.4MB - cached by SW)

android/               # Capacitor Android project (Gradle)
```

## Key Files

- [vite.config.ts](vite.config.ts) - Vite build config + PWA plugin + test setup
- [capacitor.config.ts](capacitor.config.ts) - Capacitor native wrapper config
- [tsconfig.json](tsconfig.json) - TypeScript compiler options (strict mode)
- [package.json](package.json) - Dependencies and scripts
- [.github/workflows/deploy.yml](.github/workflows/deploy.yml) - CI/CD for GitHub Pages

## Development Notes

### Adding New Rules
Rules in [App.tsx](src/App.tsx) are objects with:
- `priority` (number): Higher = checked first
- `when` (optional): Conditional function for rule activation
- `match`: Function taking `(parsed, ctx, flags)` → boolean
- `action`: Function taking `(parsed, ctx, flags)` → MatchResult

Add new rules to the `rules` array and they'll be automatically sorted by priority.

### Modifying Lexicons
Word categories defined in [App.tsx](src/App.tsx):
- `PRONOUNS` - Ambiguous references (it, that, this, him, her, there, here)
- `PERSONS` - Named entities (roger, wilco)
- `INTENTS` - Meta commands (help, inventory, status, score)
- `VERBS` - Actions (look, take, use, push, open, break, enter, etc.)
- `NOUNS` - Objects (cylinder, disc, crate, panel, door, etc.)
- `ADJECTIVES` - Descriptors (gold/golden, small, open, broken, etc.)
- `PREPOSITIONS` - Spatial/relational (on, at, with, without, in, inside, etc.)

### PixiJS Display Hierarchy
```
app.stage
└── stage (Container)
    ├── bg (Sprite - background image)
    ├── titleText (Text)
    ├── commandText (Text - user input display)
    ├── replyText (Text - response display)
    └── dots (Array<Graphics> - interactive circular buttons)
```

### Browser Compatibility
Target: ES2022 (configured in [vite.config.ts](vite.config.ts) and [tsconfig.json](tsconfig.json))
- Assumes modern browser features (async/await, classes, etc.)
- Web Speech API requires Chrome/Edge/Safari (fallback messages shown)
- MediaRecorder API for voice recording

## Build Output

Production build creates:
- `dist/index.html` - Entry point
- `dist/assets/*.js` - Code-split bundles (React, PixiJS, app code)
- `dist/assets/*.css` - Extracted styles
- `dist/sw.js` - Service worker (Workbox-generated)
- `dist/manifest.webmanifest` - PWA manifest

Build size optimizations:
- Tree-shaking enabled
- Code splitting (PixiJS loaded separately)
- Asset optimization (images, fonts)
