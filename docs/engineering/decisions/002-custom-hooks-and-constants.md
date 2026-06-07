# ADR 002 — Custom hooks and centralized constants

**Status:** Accepted

## Context

`GameDetail.jsx` grew to ~570 lines combining data fetching, mutations, UI state, and render logic for the most complex screen in the app. Additionally, domain constants (stage multipliers, RSVP status values, default party items) were scattered across `predictions.js`, `flags.js`, and inline in components, making them hard to find and easy to diverge.

## Decision

1. **Extract `useGameDetail` hook** (`src/hooks/useGameDetail.js`) — moves all TanStack Query declarations and mutation handlers out of `GameDetail.jsx` into a dedicated hook. The page component keeps only UI state and render logic.

2. **Introduce `src/lib/constants.js`** — single source of truth for all domain enumerations: `STAGE_KEYS`, `STAGE_MULTIPLIER`, `IDT_TIMEZONE`, `DEFAULT_WATCH_PARTY_ITEMS`, `BADGE_DESCRIPTIONS`, `RSVP_STATUS`, `CORNER_BUCKETS`.

## Consequences

**Good:**
- `GameDetail.jsx` is simpler and focused on rendering
- `useGameDetail` is independently testable and reusable (e.g. for a future modal preview)
- Constants have one canonical location — a typo in a status string now fails tests rather than silently misbehaving
- New contributors can read `constants.js` to understand the full domain vocabulary in ~50 lines

**Neutral:**
- Adds one more file to learn; the trade-off is worth it at this codebase size
- The hook doesn't encapsulate UI state (`activeTab`, `showHostForm`, etc.) — those remain in the component as they're purely presentational

**Trade-off considered:** merging constants back into their source files (`predictions.js`, `flags.js`) keeps fewer files but makes cross-cutting concerns (e.g. RSVP status used in both RSVPButtons and Leaderboard) harder to share without creating circular imports.
