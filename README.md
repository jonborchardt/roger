# Hello Pixi PWA + Capacitor

A minimal "hello world" project using:

- React + Vite + TypeScript
- Pixi.js
- PWA service worker via `vite-plugin-pwa`
- Capacitor (config included)
- GitHub Pages deploy via Actions
- Testing via Vitest + Testing Library (Jest-like)

## Quick start

```bash
npm install
npm run dev
```

## Tests

```bash
npm test
```

## PWA notes

- In dev, the PWA plugin is enabled so you can validate SW registration.
- In production, the SW is generated at build time.

## GitHub Pages

This repo includes an Actions workflow that builds and deploys to GitHub Pages.

1. Update `base` in `vite.config.ts` from `/REPO_NAME/` to your actual repo name.
2. In GitHub: Settings -> Pages -> set source to "GitHub Actions".

## Capacitor

After install:

```bash
npx cap init
npm run build
npx cap add ios
npx cap add android
npm run cap:sync
```

Then open the native project with:

```bash
npm run cap:open:ios
npm run cap:open:android
```
