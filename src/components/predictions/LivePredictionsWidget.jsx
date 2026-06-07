import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getFlag } from '@/lib/flags';
import { Zap } from 'lucide-react';

// Points calculation mirrored from backend for live preview
function calcLivePoints(pred, match) {
  if (!match.home_score == null || match.away_score == null) return null;
  const stage = match.stage || 'group';
  const multipliers = { group: 1, r32: 1.5, r16: 2, qf: 3, sf: 4, third: 4, final: 5 };
  const mult = multipliers[stage] || 1;

  const actual = { home: match.home_score ?? 0, away: match.away_score ?? 0 };
  const predicted = { home: pred.home_score ?? 0, away: pred.away_score ?? 0 };

  const actualResult = actual.home > actual.away ? 'home' : actual.away > actual.home ? 'away' : 'draw';
  const predictedResult = predicted.home > predicted.away ? 'home' : predicted.away > predicted.home ? 'away' : 'draw';

  const correctResult = actualResult === predictedResult;
  const exactScore = actual.home === predicted.home && actual.away === predicted.away;
  const correctDiff = !exactScore && (actual.home - actual.away) === (predicted.home - predicted.away);

  let base = 0;
  if (exactScore) base = 5;
  else if (correctDiff) base = 4;
  else if (correctResult) base = 3;

  return Math.round(base * mult * 10) / 10;
}

export default function LivePredictionsWidget({ match, currentUserId }) {
  const { data: predictions = [] } = useQuery({
    queryKey: ['predictions-live', match.id],
    queryFn: () => base44.entities.Prediction.filter({ match_id: match.id }),
    refetchInterval: 30_000,
  });

  if (predictions.length === 0) return null;

  // Compute live points and sort
  const withPoints = predictions
    .map(p => ({ ...p, livePoints: calcLivePoints(p, match) ?? 0 }))
    .sort((a, b) => b.livePoints - a.livePoints);

  return (
    <div className="space-y-3">
      {/* Live score banner */}
      <div className="flex items-center justify-center gap-4 bg-red-500/10 border border-red-500/20 rounded-xl py-3">
        <span className="flex items-center gap-1 text-red-400 text-xs font-bold">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />LIVE
        </span>
        <div className="flex items-center gap-3">
          <span className="text-xl">{getFlag(match.home_team)}</span>
          <span className="text-2xl font-bold font-mono tabular-nums">
            {match.home_score ?? 0} – {match.away_score ?? 0}
          </span>
          <span className="text-xl">{getFlag(match.away_team)}</span>
        </div>
      </div>

      {/* Predictions with live points */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
          <Zap className="w-3 h-3 text-yellow-400" />Live predictions
        </p>
        {withPoints.map((pred, i) => {
          const isMe = pred.user_id === currentUserId;
          return (
            <div
              key={pred.id}
              className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-all ${
                isMe ? 'border-primary/30 bg-primary/5' : 'border-border bg-card'
              }`}
            >
              <span className="text-xs font-bold text-muted-foreground w-5 text-center">
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
              </span>
              <span className="flex-1 text-sm font-semibold truncate">
                {pred.user_display_name || 'Unknown'}
                {isMe && <span className="text-primary text-xs ml-1">(you)</span>}
              </span>
              <span className="font-mono text-xs text-muted-foreground">
                {pred.home_score}–{pred.away_score}
              </span>
              <span className={`text-xs font-bold min-w-[42px] text-right ${pred.livePoints > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                +{pred.livePoints}pts
              </span>
            </div>
          );
        })}
      </div>
      <p className="text-[10px] text-center text-muted-foreground">Points update as the score changes · final on whistle</p>
    </div>
  );
}