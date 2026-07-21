<p align="center">
  <img src="assets/banner.png" alt="World Cup Party banner" width="800" />
</p>

<h1 align="center">⚽ World Cup Party</h1>

<p align="center">
  <a href="https://github.com/TamirCohen28">
    <img src="https://img.shields.io/badge/author-Tamir%20Cohen-181717?logo=github" alt="Author" />
  </a>
  <a href="https://github.com/TamirCohen28/world-cup-party/actions/workflows/ci.yml">
    <img src="https://github.com/TamirCohen28/world-cup-party/actions/workflows/ci.yml/badge.svg" alt="CI" />
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/github/license/TamirCohen28/world-cup-party" alt="MIT License" />
  </a>
  <a href="package.json">
    <img src="https://img.shields.io/badge/version-1.0.0-blue" alt="Version" />
  </a>
  <img src="https://img.shields.io/badge/AI--powered-LLM%20match%20insights-22c55e" alt="AI-powered" />
</p>

<p align="center">
  <a href="docs/engineering/build-and-release/platform-targets.json">
    <img src="https://img.shields.io/badge/Claude%20Code-2.0.0-blueviolet" alt="Claude Code" />
  </a>
  <a href="docs/engineering/build-and-release/platform-targets.json">
    <img src="https://img.shields.io/badge/Cursor-0.45.0-000000" alt="Cursor" />
  </a>
  <a href="docs/engineering/build-and-release/platform-targets.json">
    <img src="https://img.shields.io/badge/Codex-0.40.0-412991" alt="Codex" />
  </a>
</p>

<p align="center">
  Your friend group's World Cup 2026 headquarters — schedule, RSVPs, score predictions, a live leaderboard, and <strong>AI-powered match intelligence</strong>, all in one place.
</p>

---

## Features

- **Full match schedule** — all 104 World Cup 2026 fixtures, pre-loaded with kickoff times converted to your timezone
- **Watch party coordination** — create parties per match, bring-items list with claim system, Google Calendar export
- **Score predictions** — submit scoreline + bonus bets (corners, cards) before the deadline; earn points with stage multipliers
- **Live leaderboard** — real-time standings, streak tracking, and achievement badges (🎯 Sniper, 🔥 On Fire, 🔮 Oracle, and more)
- **Host dashboard** — manage your events, track RSVPs, and push notifications to attendees
- **Splitwise integration** — automatically create Splitwise expenses for watch party costs

## AI Features

The app uses an LLM (via Base44's `InvokeLLM` integration with web-search grounding) to generate live match intelligence directly in the UI:

### 🔥 Match Buzz
Before each fixture, an AI hype engine generates a punchy match headline, the three hottest talking points (injuries, form, rivalry context), and a surprising fun fact — all grounded in current web data, cached for 30 minutes.

### 📊 Match Insights
A structured AI analysis per fixture including:
- Recent form for both teams (last 5 results)
- Head-to-head record with a visual win-percentage bar
- Live group standings (group stage only)
- Key player to watch per side
- Stadium fact
- Indicative betting odds

Both features use **JSON Schema-constrained LLM output** for reliable structured responses, wrapped in React Error Boundaries so an AI failure never crashes the rest of the page.

See [docs/engineering/architecture/ai-features.md](docs/engineering/architecture/ai-features.md) for implementation details.

## Prerequisites

| Requirement | Version |
|---|---|
| Node.js | ≥ 18 |
| npm | ≥ 9 |
| [Base44](https://base44.com) account | — |

## Quick Start

1. **Clone the repo**
   ```bash
   git clone https://github.com/TamirCohen28/world-cup-party.git
   cd world-cup-party
   ```

2. **Install dependencies**
   ```bash
   make install
   ```
   *Alternative (manual):* `npm ci`

3. **Set up your Base44 app**

   Create a Base44 app at [base44.com](https://base44.com), then update `base44/.app.jsonc` with your app ID:
   ```jsonc
   { "id": "YOUR_BASE44_APP_ID" }
   ```

4. **Configure environment variables**

   Create `.env.local`:
   ```env
   VITE_BASE44_APP_ID=your_app_id
   VITE_BASE44_APP_BASE_URL=https://your-app.base44.app
   ```

5. **Start the dev server**
   ```bash
   make dev
   ```
   Open [http://localhost:5173](http://localhost:5173).

### Claude Code

Open the repo folder in Claude Code. `CLAUDE.md` imports `@AGENTS.md` as the canonical guide.

```bash
make install && make dev
```

### Cursor

Open the repo in Cursor. Rules in `.cursor/rules/` point agents to `AGENTS.md`.

```bash
make install && make dev
```

### Codex

Point Codex at the repo root; it reads `AGENTS.md` directly.

```bash
make install && make dev
```

Platform tool versions: [platform-targets.json](docs/engineering/build-and-release/platform-targets.json).

## Development

```bash
npm run test        # run unit tests
npm run lint        # ESLint
npm run build       # production build
npm run typecheck   # TypeScript check
```

## Documentation

- [User docs](docs/user/README.md) — concepts, quick-start guide, troubleshooting
- [Engineering docs](docs/engineering/README.md) — architecture, build workflow, ADRs
- [AI features](docs/engineering/architecture/ai-features.md) — LLM integration details
- [Changelog](docs/CHANGELOG.md) (also [CHANGELOG.md](CHANGELOG.md) at repo root)
- [Versioning policy](docs/engineering/build-and-release/versioning.md)

## Contributing

See [CONTRIBUTING.md](docs/CONTRIBUTING.md).

## License

MIT — see [LICENSE](LICENSE).
