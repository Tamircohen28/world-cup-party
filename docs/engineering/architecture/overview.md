# Architecture Overview

## What the system is

World Cup Party is a **React SPA** that uses **Base44** as its backend-as-a-service layer. There is no custom server. All persistence, auth, business logic functions, and connectors (Google Calendar, Splitwise, push notifications) are hosted on Base44.

```
Browser (React + Vite)
        │
        │  @base44/sdk (REST)
        ▼
  Base44 Platform
  ├── Auth (email/password)
  ├── Entities (Postgres-backed, auto-REST)
  │   ├── Match          — fixture data
  │   ├── WatchParty     — per-match party
  │   ├── RSVP           — user ↔ match attendance
  │   ├── Prediction     — user score predictions
  │   ├── UserStats      — aggregated leaderboard stats
  │   ├── Message        — party chat
  │   ├── Notification   — push notification records
  │   ├── CalendarSync   — calendar sync state per user
  │   └── SyncState      — connector sync cursors
  └── Functions (TypeScript, run serverless on Base44)
      ├── calculatePredictionPoints
      ├── sendMatchReminders
      ├── notifyWatchPartyChanges
      ├── predictionWindowNotifier
      ├── syncGoogleCalendar
      ├── handleCalendarWebhook
      ├── exportCalendar
      └── splitwiseParty
```

## Frontend structure

```
src/
├── api/base44Client.js     — singleton SDK client, configured from env vars
├── App.jsx                 — router root; wraps everything in AuthProvider + QueryClientProvider
├── lib/
│   ├── AuthContext.jsx     — current user, auth loading state, login/logout
│   ├── matchData.js        — static array of all 104 WC2026 fixtures (pre-computed UTC ISO strings)
│   ├── predictions.js      — deadline checking; whether prediction window is open
│   └── flags.js            — country → emoji flag map; IDT date formatter
├── pages/                  — one component per route
└── components/
    ├── layout/AppLayout.jsx — bottom-nav shell
    └── ui/                  — shadcn/ui primitives (Radix-based)
```

## Data flow: submitting a prediction

1. User fills in score form in `src/pages/GameDetail.jsx`
2. `base44.entities.Prediction.create(...)` call via TanStack Query mutation
3. Base44 persists the record and fires the `calculatePredictionPoints` function trigger
4. Function reads the match's actual scores (if already set), computes points, and updates `Prediction.points_earned` + `UserStats`
5. Frontend invalidates `['predictions', matchId]` and `['leaderboard']` query keys → UI re-renders

## Match data strategy

All 104 WC2026 fixtures are **embedded statically** in `src/lib/matchData.js`. This means:
- Zero API calls for the schedule; page loads are instant
- Match results (actual scores) are stored in `Match` entities on Base44 and entered by the host
- The static list is the source of truth for fixture metadata (teams, time, venue, group, stage)

## Auth model

Base44 handles email/password auth. The `useAuth` hook exposes `currentUser`, `isLoadingAuth`, and `authError`. Routes inside `<AuthenticatedApp>` require a valid session; the `ProtectedRoute` component enforces this. Users who authenticate but have no registered profile see `UserNotRegisteredError`.
