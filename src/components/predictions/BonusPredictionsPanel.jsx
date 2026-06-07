import React from 'react';

const CORNER_BUCKETS = ['0-5', '6-8', '9-11', '12+'];
const CORNER_BUCKET_LABELS = {
  '0-5': '🐢 Quiet (0–5)',
  '6-8': '⚽ Normal (6–8)',
  '9-11': '🌀 Active (9–11)',
  '12+': '💥 Corner Fest (12+)',
};

const YELLOW_OPTIONS = [0, 1, 2, 3, 4, 5, 6];

// Points system:
// Correct corners bucket → +3 pts
// Correct yellow cards (exact) → +3 pts  (within 1 → +1 pt)
// Red card prediction (correct yes/no) → +2 pts

export const BONUS_MAX_POINTS = 8;

export default function BonusPredictionsPanel({ corners, setCorners, yellows, setYellows, redCard, setRedCard }) {
  return (
    <div className="bg-card rounded-2xl border border-border p-5 space-y-5">
      <div className="flex items-center gap-2">
        <span className="text-lg">🎲</span>
        <div>
          <p className="text-sm font-bold">Bonus Predictions</p>
          <p className="text-xs text-muted-foreground">Up to +{BONUS_MAX_POINTS} bonus points</p>
        </div>
      </div>

      {/* Corners bucket */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <span className="text-base">⛳</span>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Corners</p>
          <span className="ml-auto text-xs text-primary font-bold">+3 pts</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {CORNER_BUCKETS.map(bucket => (
            <button
              key={bucket}
              onClick={() => setCorners(corners === bucket ? null : bucket)}
              className={`py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                corners === bucket
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-muted border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              {CORNER_BUCKET_LABELS[bucket]}
            </button>
          ))}
        </div>
      </div>

      {/* Yellow cards */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <span className="text-base">🟨</span>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Yellow Cards</p>
          <span className="ml-auto text-xs text-primary font-bold">+3 pts (exact) / +1 pt (±1)</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {YELLOW_OPTIONS.map(n => (
            <button
              key={n}
              onClick={() => setYellows(yellows === n ? null : n)}
              className={`w-10 h-10 rounded-xl text-sm font-bold border transition-all ${
                yellows === n
                  ? 'bg-secondary text-secondary-foreground border-secondary'
                  : 'bg-muted border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              {n === 6 ? '6+' : n}
            </button>
          ))}
          <button
            onClick={() => setYellows(yellows === null ? undefined : null)}
            className={`px-3 h-10 rounded-xl text-xs font-semibold border transition-all ${
              yellows === null || yellows === undefined
                ? 'bg-muted border-border text-muted-foreground'
                : 'bg-muted border-transparent text-muted-foreground hover:border-border'
            }`}
          >
            Skip
          </button>
        </div>
      </div>

      {/* Red card */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <span className="text-base">🟥</span>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Any Red Card?</p>
          <span className="ml-auto text-xs text-primary font-bold">+2 pts</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setRedCard(true)}
            className={`py-2.5 rounded-xl text-sm font-bold border transition-all ${
              redCard === true
                ? 'bg-destructive/80 text-white border-destructive'
                : 'bg-muted border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            🟥 Yes
          </button>
          <button
            onClick={() => setRedCard(false)}
            className={`py-2.5 rounded-xl text-sm font-bold border transition-all ${
              redCard === false
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-muted border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            ✅ No
          </button>
          <button
            onClick={() => setRedCard(null)}
            className={`py-2.5 rounded-xl text-xs font-semibold border transition-all ${
              redCard === null || redCard === undefined
                ? 'bg-muted border-border text-muted-foreground'
                : 'bg-muted border-transparent text-muted-foreground hover:border-border'
            }`}
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}