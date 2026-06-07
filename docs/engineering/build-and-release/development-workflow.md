# Development Workflow

## Prerequisites

- Node.js ≥ 18
- npm ≥ 9
- A Base44 account with an app created at [base44.com](https://base44.com)

## First-time setup

```bash
git clone https://github.com/TamirCohen28/world-cup-party.git
cd world-cup-party
npm install
```

Create `.env.local`:

```env
VITE_BASE44_APP_ID=your_base44_app_id
VITE_BASE44_APP_BASE_URL=https://your-app.base44.app
```

Update `base44/.app.jsonc` with your app ID (same value as `VITE_BASE44_APP_ID`).

Start the dev server:

```bash
npm run dev
# → http://localhost:5173
```

## Daily workflow

```bash
# Check types and lint before committing
npm run typecheck
npm run lint

# Production build sanity check
npm run build
```

## Branching

| Branch | Purpose |
|--------|---------|
| `main` | Stable; deploys to production via Base44 |
| `feat/*` | New features |
| `fix/*` | Bug fixes |
| `chore/*` | Dependency bumps, tooling |

Open a PR against `main`. CI must be green before merging.

## Publishing to Base44

Base44 watches your connected GitHub repo. Any push to `main` automatically re-publishes the app via the Base44 builder. There is no separate deploy step.

To publish manually: open your app in the Base44 dashboard and click **Publish**.

## Adding/modifying Base44 entities or functions

Entity schemas live in `base44/entities/*.jsonc`. Function code lives in `base44/functions/*/entry.ts`. Changes pushed to the repo are synced to Base44 automatically. The Base44 builder provides a live preview of schema changes.
