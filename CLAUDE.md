# World Cup Party — Claude Code guidance

## Project overview

World Cup 2026 watch party coordinator. A React + Vite SPA backed by [Base44](https://base44.com) as the BaaS layer. Users authenticate via Base44, browse all 104 WC2026 fixtures, create/join watch parties, submit score predictions, and track standings on a live leaderboard.

## Key file locations

| Path | Purpose |
|------|---------|
| `src/App.jsx` | Root router and auth gating |
| `src/api/base44Client.js` | Singleton Base44 SDK client |
| `src/lib/matchData.js` | All 104 WC2026 fixtures (static, pre-computed) |
| `src/lib/AuthContext.jsx` | Auth state and current-user hook |
| `src/lib/predictions.js` | Prediction window logic (deadline checking) |
| `src/lib/flags.js` | Country flag helpers and date/timezone formatting |
| `src/pages/` | One file per route |
| `src/components/` | Shared UI; `ui/` are shadcn/ui primitives |
| `base44/entities/` | JSONC schema definitions for Base44 entities |
| `base44/functions/` | Serverless backend functions (TypeScript, run on Base44) |

## Commands

```bash
npm run dev           # start dev server on :5173
npm run build         # production build → dist/
npm run lint          # ESLint (quiet mode)
npm run lint:fix      # ESLint auto-fix
npm run typecheck     # TypeScript check (no emit)
npm run test          # run unit tests (Vitest)
npm run test:watch    # Vitest in watch mode
npm run test:coverage # Vitest with v8 coverage
```

## Commit convention

`type(scope): short description` — e.g. `feat(predictions): add corner-bucket bonus bet`

Types: `feat`, `fix`, `refactor`, `docs`, `chore`, `test`

## AI features

`MatchBuzz` and `MatchInsights` use `base44.integrations.Core.InvokeLLM` with `add_context_from_internet: true` and a `response_json_schema` for structured output. Both are wrapped in `<ErrorBoundary>` in `GameDetail.jsx`. See [docs/engineering/architecture/ai-features.md](docs/engineering/architecture/ai-features.md).

## Testing

Tests live in `src/lib/__tests__/`. The test stack is **Vitest + @testing-library/react + @testing-library/jest-dom**. Test setup is in `src/test-setup.js`. Vitest config is in `vite.config.js` under the `test` key.

## Hard constraints

- Never commit `.env.local` or any file containing real Base44 credentials
- Never replace `base44/.app.jsonc` placeholder with a real app ID
- `src/lib/matchData.js` is a static fixture list — do not fetch match data dynamically without explicit instruction; the entire 2026 schedule is intentionally embedded
- The app targets mobile-first layouts; keep `max-w-lg mx-auto` on page roots
- All new AI components must be wrapped in `<ErrorBoundary>` at their call site
