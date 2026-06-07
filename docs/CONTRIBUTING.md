# Contributing

## Getting started

1. Fork the repo and clone your fork
2. Follow the [Quick Start](user/quick-start.md) to get the dev server running
3. Create a branch: `git checkout -b feat/your-feature`

## PR workflow

1. Keep PRs focused — one feature or fix per PR
2. Run `npm run lint` and `npm run build` before opening a PR; both must pass
3. Update [CHANGELOG.md](CHANGELOG.md) under `[Unreleased]`
4. Fill in the PR template

## Commit convention

```
type(scope): short description
```

| Type | Use for |
|------|---------|
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Code change that isn't a feature or fix |
| `docs` | Documentation only |
| `chore` | Build, tooling, dependency updates |

Examples:
```
feat(predictions): add corner-bucket bonus bet
fix(leaderboard): correct streak reset on missed prediction
docs(user): add troubleshooting entry for calendar sync
```

## Code style

- ESLint config is in `eslint.config.js` — run `npm run lint:fix` to auto-fix
- TypeScript is checked via `npm run typecheck` (no emit; `jsconfig.json` drives it)
- Tailwind utility classes only — no inline styles, no CSS modules
- shadcn/ui primitives live in `src/components/ui/`; do not modify them directly

## Adding a new page

1. Create `src/pages/YourPage.jsx`
2. Add a route in `src/App.jsx` inside `<AppLayout>`
3. Add a nav link in `src/components/layout/AppLayout.jsx` if it belongs in the nav

## Adding a Base44 entity or function

1. Define the schema in `base44/entities/YourEntity.jsonc`
2. Implement the function in `base44/functions/yourFunction/entry.ts`
3. Access via `base44.entities.YourEntity` or `base44.functions.yourFunction.run(...)` in the frontend
