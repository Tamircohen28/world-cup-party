# ADR 001 — Use Base44 as the backend-as-a-service layer

**Status:** Accepted

## Context

The project needs persistence, authentication, serverless business logic, and third-party connectors (Google Calendar, Splitwise, push notifications). The goal was a fully functional app with minimal backend infrastructure setup and maintenance overhead.

Options considered:

| Option | Notes |
|--------|-------|
| Custom Node.js/Express backend | Full control; significant setup and hosting cost |
| Supabase | Good fit; Postgres + auth + edge functions; no built-in connector ecosystem |
| Firebase | Real-time updates are good; NoSQL schema flexibility is a drawback for relational data |
| Base44 | Purpose-built for rapid app development; includes auth, entities (structured schemas), serverless functions, and first-party connectors; tight GitHub integration for code-first workflow |

## Decision

Use Base44 as the sole backend layer. The frontend communicates exclusively via `@base44/sdk`.

## Consequences

**Good:**
- Zero infrastructure to manage — no servers, no databases, no CI/CD for backend
- GitHub-connected workflow: pushing code updates the live app automatically
- Built-in connectors for Google Calendar and Splitwise removed weeks of OAuth plumbing
- Typed entity schemas in `.jsonc` files provide a clear contract between frontend and backend

**Neutral:**
- The app is tightly coupled to Base44's platform and pricing model
- Entity querying is limited to the Base44 SDK's filter/sort API — complex joins require client-side aggregation

**Risky:**
- Base44 is a relatively new platform; long-term availability is not guaranteed
- Migrating off Base44 would require building a replacement backend and migrating all stored data
