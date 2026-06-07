# Concepts

## Matches

The app comes pre-loaded with all 104 World Cup 2026 fixtures across the group stage, Round of 32, Round of 16, quarter-finals, semi-finals, third-place play-off, and the final. Kickoff times are stored in UTC and displayed in your local timezone.

## Watch Parties

A **watch party** is a specific gathering for a specific match. Any user can create a watch party for any match — but there is only one watch party per match (first-come, first-served hosting).

### RSVP statuses

| Status | Meaning |
|--------|---------|
| Attending | You're going |
| Maybe | You might go |
| Not attending | You won't be there |
| No response | You haven't replied yet |

### Bring-items list

The host can define an items list (food, drinks, equipment). Any attendee can claim an item, marking it as covered. Default items (chips, drinks, etc.) are suggested automatically.

## Predictions

You can submit a **score prediction** for any match before its **prediction deadline** (kickoff time).

### What you predict

- Final scoreline (e.g. Brazil 2–1 France)
- **Bonus bets** (optional, extra points):
  - Corner bucket: total corners in the match (0–5 / 6–8 / 9–11 / 12+)
  - Yellow cards: exact count of yellow cards shown
  - Red card: whether any red card will be shown

### How points are calculated

| Outcome | Points | Stage multiplier |
|---------|--------|-----------------|
| Correct result (win/draw/loss) | 3 | × stage |
| Correct goal difference | +2 bonus | × stage |
| Exact scoreline | +4 bonus | × stage |
| Correct corners bucket | +1 | — |
| Correct yellow cards | +1 | — |
| Correct red-card prediction | +1 | — |

Stage multipliers: Group ×1, R32 ×1.5, R16 ×2, QF ×3, SF ×4, Final ×5.

### Badges

Achievement badges are awarded automatically based on your stats:

| Badge | Condition |
|-------|-----------|
| 🎯 Sniper | 3+ exact scorelines |
| 🔮 Oracle | 5+ exact scorelines |
| 🔥 On Fire | 4+ correct predictions in a row |
| ⚡ Hot Streak | 6+ correct predictions in a row |
| 📊 Analyst | 10+ correct results total |
| 🗳️ Committed | 20+ predictions submitted |

## Leaderboard

The leaderboard ranks all users by total points. It updates automatically after each match result is entered. You can also see per-match prediction breakdowns.

## Notifications

The app sends reminders before matches you've RSVP'd to, and alerts when a watch party is updated (location, items, etc.). Notification delivery requires the Base44 notification connector to be configured.
