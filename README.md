# The Syndicate

A single-player bluffing card game built with React, TypeScript, Vite, Tailwind, and Zustand.

Players take money, claim hidden powers, bluff, challenge claims, block actions, exchange cards, and try to survive as the last player at the table.

## Live Deploy

This repo is ready for GitHub Pages deployment through GitHub Actions.

After pushing to `main`, GitHub will:

1. Install dependencies.
2. Run the test suite.
3. Build the Vite app.
4. Publish `dist/` to GitHub Pages.

In GitHub, set:

- Repository → Settings → Pages
- Source: `GitHub Actions`

The app uses `base: './'` in `vite.config.ts`, so it works under a GitHub Pages project URL.

## Run Locally

```bash
npm install
npm run dev -- --host 127.0.0.1 --port 5174
```

If port `5174` is busy, Vite will use the next available port.

## Verify

```bash
npm test
npm run build
```

Current expected test suite: 25 tests.

## Gameplay Highlights

- Human players can challenge, block, pass, and choose targets.
- Challenge popups show who challenged whom, the claimed power, action/target, truth/liar result, and who loses a card.
- Challenge losses reveal the chosen card publicly.
- Attack and eliminate losses return the chosen card hidden to the deck.
- Exchange draws two cards and lets the human choose which cards to keep; the turn ends after confirmation.
- Eliminated humans can spectate or immediately start a new match.
- Bot personas include names, avatars, style labels, flavor lines, and difficulty-based strategies.
- The UI includes mobile bottom sheets, richer table decisions, gold treasury visuals, and clearer action cards.

## Structure

```text
public/assets/roles/      Role portraits
src/domain/game/          Pure TypeScript rules and tests
src/store/                Zustand state and game events
src/ui/                   React screens and widgets
src/i18n/                 English and Bangla translations
```

## Scripts

```bash
npm run dev
npm test
npm run build
npm run preview
```

## Development Notes

- Keep `src/domain/**` pure TypeScript: no React, DOM, timers, or browser APIs.
- Keep global game state in `src/store/useGameStore.ts`.
- Update English and Bangla translation text together.
- Do not commit generated folders: `node_modules`, `dist`, or `coverage`.
