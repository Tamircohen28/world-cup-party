import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getFlag } from '@/lib/flags';
import { Link } from 'react-router-dom';
import { Loader2, ChevronDown, ChevronUp } from 'lucide-react';

export default function PredictionReveal({ match, user, myPrediction }) {
  const [expanded, setExpanded] = useState(null);

  const { data: allPredictions = [], isLoading } = useQuery({
    queryKey: ['predictions-reveal', match.id],
    queryFn: () => base44.entities.Prediction.filter({ match_id: match.id }),
    enabled: match.status === 'finished',
  });

  const { data: myStats } = useQuery({
    queryKey: ['user-stats', user?.id],
    queryFn: async () => {
      const all = await base44.entities.UserStats.filter({ user_id: user.id });
      return all[0] || null;
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-sm py-4">
        <Loader2 className="w-4 h-4 animate-spin" />Revealing predictions...
      </div>
    );
  }

  // Sort by points earned DESC
  const sorted = [...allPredictions].sort((a, b) => (b.points_earned || 0) - (a.points_earned || 0));
  const myTotal = myPrediction?.points_earned ?? 0;

  return (
    <div className="space-y-4">
      {/* Final score */}
      <div className="bg-card rounded-2xl border border-border p-5 text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">⚽ Final Score</p>
        <div className="flex items-center justify-center gap-6">
          <div className="text-center">
            <div className="text-3xl">{getFlag(match.home_team)}</div>
            <p className="text-xs font-semibold mt-1">{match.home_team}</p>
          </div>
          <div className="text-4xl font-bold font-mono">
            {match.home_score ?? 0} – {match.away_score ?? 0}
          </div>
          <div className="text-center">
            <div className="text-3xl">{getFlag(match.away_team)}</div>
            <p className="text-xs font-semibold mt-1">{match.away_team}</p>
          </div>
        </div>
      </div>

      {/* Predictions list */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">🎯 The Predictions</p>
        {sorted.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">No predictions were made for this game</p>
        )}
        {sorted.map((pred, i) => {
          const isMe = pred.user_id === user?.id;
          const breakdown = pred.points_breakdown;
          const isExact = breakdown?.exact_score;
          const isExpanded = expanded === pred.id;

          return (
            <div
              key={pred.id}
              onClick={() => setExpanded(isExpanded ? null : pred.id)}
              className={`rounded-xl border p-3 cursor-pointer transition-all ${
                isMe ? 'border-primary/30 bg-primary/5' :
                isExact ? 'border-yellow-500/30 bg-yellow-500/5' :
                'border-border bg-card'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold w-6 text-muted-foreground text-center">
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                </span>
                <span className="flex-1 text-sm font-semibold truncate">
                  {pred.user_display_name || 'Unknown'}
                  {isMe && <span className="text-primary text-xs ml-1">(you)</span>}
                </span>
                <span className="font-mono text-sm font-bold">
                  {pred.home_score} – {pred.away_score}
                </span>
                <div className="flex items-center gap-1.5 ml-1">
                  {isExact ? (
                    <span className="text-xs font-bold text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded-full">🎯 EXACT</span>
                  ) : breakdown?.correct_result ? (
                    <span className="text-xs text-primary">✓ result</span>
                  ) : (
                    <span className="text-xs text-muted-foreground">✗</span>
                  )}
                  <span className={`text-xs font-bold ${(pred.points_earned || 0) > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                    +{pred.points_earned || 0}pts
                  </span>
                </div>
                {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
              </div>
              {isExpanded && breakdown && (
                <div className="mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground space-y-1 pl-9">
                  <p>Base: {breakdown.base_points}pts × {breakdown.stage_multiplier} = {breakdown.total}pts</p>
                  {breakdown.correct_result && <p className="text-primary">✓ Correct result</p>}
                  {breakdown.correct_diff && !breakdown.exact_score && <p className="text-primary">✓ Correct goal diff (+1 bonus)</p>}
                  {breakdown.exact_score && <p className="text-yellow-400">🎯 Exact score (+3 bonus)</p>}
                </div>
              )}
            </div>
          );
        })}

        {/* Missed indicator for current user if no prediction */}
        {!myPrediction && user && (
          <div className="rounded-xl border border-border bg-card p-3 flex items-center gap-3">
            <span className="text-sm font-bold w-6 text-muted-foreground text-center">–</span>
            <span className="flex-1 text-sm font-semibold text-muted-foreground">{user.full_name} <span className="text-primary text-xs">(you)</span></span>
            <span className="text-xs text-muted-foreground italic">missed</span>
            <span className="text-xs font-bold text-muted-foreground">+0pts</span>
          </div>
        )}
      </div>

      {/* Your summary */}
      <div className="bg-card rounded-xl border border-border p-4 text-center space-y-1">
        <p className="text-sm font-bold">
          You earned: <span className="text-primary">+{myTotal} pts</span>
        </p>
        {myStats && (
          <p className="text-xs text-muted-foreground">Tournament total: {myStats.total_points} pts · Rank #{myStats.rank || '—'}</p>
        )}
      </div>

      <Link to="/leaderboard" className="block">
        <div className="text-center text-sm text-primary font-semibold py-2 hover:underline">
          See Leaderboard →
        </div>
      </Link>
    </div>
  );
}