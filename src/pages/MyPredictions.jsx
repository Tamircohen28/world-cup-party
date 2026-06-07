import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getFlag, formatShortDateIDT } from '@/lib/flags';
import { getPredictionState } from '@/lib/predictions';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const STATUS_ICON = {
  revealed_exact: '🎯',
  revealed_correct: '✅',
  revealed_wrong: '❌',
  revealed_missed: '➖',
  locked: '⏳',
  too_early: '🔒',
  open: '📝',
  missed: '➖',
};

export default function MyPredictionsPage() {
  const navigate = useNavigate();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: matches = [] } = useQuery({
    queryKey: ['matches'],
    queryFn: () => base44.entities.Match.list('kickoff_utc', 200),
    initialData: [],
  });

  const { data: myPredictions = [] } = useQuery({
    queryKey: ['my-all-predictions', user?.id],
    queryFn: () => base44.entities.Prediction.filter({ user_id: user.id }),
    enabled: !!user,
    initialData: [],
  });

  const { data: myStats } = useQuery({
    queryKey: ['user-stats', user?.id],
    queryFn: async () => {
      const all = await base44.entities.UserStats.filter({ user_id: user.id });
      return all[0] || null;
    },
    enabled: !!user,
  });

  const predMap = useMemo(() => {
    const map = {};
    myPredictions.forEach(p => { map[p.match_id] = p; });
    return map;
  }, [myPredictions]);

  // Only show matches that have started, are live, or are within the prediction window
  const relevantMatches = useMemo(() => {
    return matches.filter(m => {
      const state = getPredictionState(m, predMap[m.id]);
      return state !== 'too_early';
    }).sort((a, b) => new Date(b.kickoff_utc) - new Date(a.kickoff_utc));
  }, [matches, predMap]);

  const totalEarned = myPredictions.reduce((s, p) => s + (p.points_earned || 0), 0);
  const exactCount = myPredictions.filter(p => p.points_breakdown?.exact_score).length;
  const correctCount = myPredictions.filter(p => p.points_breakdown?.correct_result).length;
  const missedCount = relevantMatches.filter(m => {
    const state = getPredictionState(m, predMap[m.id]);
    return state === 'missed' || (state === 'revealed' && !predMap[m.id]);
  }).length;

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-8">
      <button onClick={() => navigate(-1)} className="mb-4 p-2 -ml-2 rounded-xl hover:bg-muted transition-all">
        <ArrowLeft className="w-5 h-5" />
      </button>

      <h1 className="text-2xl font-display font-bold mb-1">My Predictions</h1>
      <p className="text-sm text-muted-foreground mb-5">{user?.full_name}</p>

      {/* Summary stats */}
      {myPredictions.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-4 mb-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total points</span>
            <span className="font-bold text-primary text-lg">{myStats?.total_points ?? totalEarned} pts</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Accuracy</span>
            <span className="text-sm font-semibold">
              {exactCount} exact · {correctCount} correct · {missedCount} missed
            </span>
          </div>
          {myStats?.rank && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Leaderboard rank</span>
              <span className="font-bold">#{myStats.rank}</span>
            </div>
          )}
        </div>
      )}

      {/* Predictions list */}
      <div className="space-y-3">
        {relevantMatches.map(match => {
          const pred = predMap[match.id];
          const state = getPredictionState(match, pred);
          const breakdown = pred?.points_breakdown;
          const isRevealed = state === 'revealed';

          let statusKey = state;
          if (isRevealed) {
            if (!pred) statusKey = 'revealed_missed';
            else if (breakdown?.exact_score) statusKey = 'revealed_exact';
            else if (breakdown?.correct_result) statusKey = 'revealed_correct';
            else statusKey = 'revealed_wrong';
          }

          const icon = STATUS_ICON[statusKey] || '❓';

          return (
            <div key={match.id} className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-start gap-3">
                <span className="text-xl shrink-0 mt-0.5">{icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-sm truncate">
                      {getFlag(match.home_team)} {match.home_team} vs {match.away_team} {getFlag(match.away_team)}
                    </p>
                    <span className="text-xs text-muted-foreground shrink-0">{formatShortDateIDT(match.kickoff_utc)}</span>
                  </div>

                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    {/* My prediction */}
                    {pred ? (
                      <span className="text-xs bg-muted px-2 py-0.5 rounded font-mono">
                        {pred.home_score} – {pred.away_score}
                      </span>
                    ) : state === 'missed' || (isRevealed && !pred) ? (
                      <span className="text-xs text-muted-foreground italic">missed</span>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">not yet predicted</span>
                    )}

                    {/* Actual score for revealed */}
                    {isRevealed && (
                      <span className="text-xs text-muted-foreground font-mono">
                        actual: {match.home_score ?? 0}–{match.away_score ?? 0}
                      </span>
                    )}

                    {/* Points */}
                    {isRevealed && pred && (
                      <span className={`text-xs font-bold ml-auto ${(pred.points_earned || 0) > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                        {breakdown?.exact_score ? '🎯 EXACT ' : breakdown?.correct_diff ? '✓ diff ' : breakdown?.correct_result ? '✓ result ' : '✗ '}
                        +{pred.points_earned || 0}pts
                      </span>
                    )}
                    {state === 'locked' && (
                      <span className="text-xs text-muted-foreground ml-auto">🔒 locked</span>
                    )}
                    {state === 'open' && (
                      <span className="text-xs text-primary ml-auto">window open</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {relevantMatches.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>No predictions available yet</p>
            <p className="text-sm mt-1">Prediction windows open 24h before each game</p>
          </div>
        )}
      </div>
    </div>
  );
}