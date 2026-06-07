# AI Features — Implementation Notes

## Overview

World Cup Party uses an LLM via Base44's `InvokeLLM` integration to generate per-match intelligence. The integration uses web-search grounding (`add_context_from_internet: true`) so responses reflect current news and squad updates rather than stale training data.

## Components

### `MatchBuzz` (`src/components/games/MatchBuzz.jsx`)

Generates pre-match hype content for every fixture where both teams are known.

**Prompt strategy:** Persona-framing ("you are a hype man") combined with strict JSON Schema output. The schema enforces `headline` (string), `storylines` (array of `{emoji, title, detail}`), and `fun_fact` (string), so the UI can render each field directly without defensive parsing.

**Caching:** 30-minute `staleTime` on the TanStack Query key `['match-buzz', matchId]`. Repeated opens of the same match page never re-call the LLM within the cache window.

**Resilience:** The component is wrapped in an `ErrorBoundary` in `GameDetail`. If the LLM call fails (network error, rate limit, malformed response), the boundary catches it and shows a recoverable error UI — the rest of the page is unaffected.

### `MatchInsights` (`src/components/games/MatchInsights.jsx`)

Generates structured statistical context per fixture.

**Output fields:**
| Field | Type | Description |
|-------|------|-------------|
| `home_form` / `away_form` | `string` | Last 5 results as `"W W D L W"` |
| `head_to_head` | `object` | Total meetings, win counts, last match |
| `group_standings` | `array` | Points table (group stage only) |
| `home_key_player` / `away_key_player` | `string` | Key player names |
| `stadium_fact` | `string` | One sentence about the venue |
| `betting_odds` | `object` | Indicative decimal odds |

**Caching:** 1-hour `staleTime`. Insights are considered stable enough not to need real-time refresh.

**Resilience:** Same `ErrorBoundary` wrapper as MatchBuzz.

## JSON Schema-constrained output

Both components pass a `response_json_schema` to `InvokeLLM`. This instructs the model to produce valid JSON matching the schema, enabling direct property access (`buzz.headline`, `insights.head_to_head.home_wins`) without error-prone string parsing.

```javascript
base44.integrations.Core.InvokeLLM({
  prompt: '...',
  add_context_from_internet: true,
  response_json_schema: {
    type: 'object',
    properties: {
      headline: { type: 'string' },
      // ...
    }
  }
})
```

## Error boundary pattern

```jsx
// GameDetail.jsx
<ErrorBoundary>
  <MatchBuzz match={match} />
</ErrorBoundary>

<ErrorBoundary>
  <MatchInsights match={match} />
</ErrorBoundary>
```

`ErrorBoundary` (`src/components/ErrorBoundary.jsx`) is a class component implementing `getDerivedStateFromError` + `componentDidCatch`. It accepts an optional `fallback` render prop for custom error UI, or uses a default inline error card with a "Try again" button that resets its state.

## Extending the AI features

To add a new AI-powered component:

1. Create `src/components/YourAIComponent.jsx`
2. Call `base44.integrations.Core.InvokeLLM({ prompt, add_context_from_internet, response_json_schema })`
3. Wrap the call in a TanStack Query with an appropriate `staleTime`
4. Export the component and wrap it in `<ErrorBoundary>` at the call site
5. Add the new query key prefix to `CLAUDE.md` hard constraints if it should never be invalidated eagerly
