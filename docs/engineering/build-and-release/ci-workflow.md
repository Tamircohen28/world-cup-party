# CI Workflow

CI runs on every pull request and every push to `main` via GitHub Actions (`.github/workflows/ci.yml`).

## Jobs

| Job | What it does |
|-----|-------------|
| `lint` | Runs `npm run lint` — ESLint with the project config |
| `build` | Runs `npm run build` — Vite production build; catches import errors and type issues |
| `secret-scan` | Greps for high-signal credential patterns (API keys, tokens, Base44 app IDs) to prevent accidental commits |

## Why no test job?

The project currently has no automated test suite. The `build` job acts as the primary correctness gate — a successful Vite build catches broken imports, missing exports, and TypeScript errors surfaced via `vite-plugin-checker`. Adding unit/integration tests is tracked in the backlog.

## Release workflow

`.github/workflows/release.yml` is a manually-triggered workflow (`workflow_dispatch`) that:
1. Takes a `version` input (e.g. `1.1.0`)
2. Validates the build passes
3. Creates a git tag `v{version}`
4. Creates a GitHub Release with an auto-generated changelog
