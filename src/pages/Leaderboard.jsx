import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { Trophy, ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function LeaderboardPage() {
  const [expanded, setExpanded] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: allStats = [], isLoading } = useQuery({
    queryKey: ['all-user-stats'],
    queryFn: () => base44.entities.UserStats.list('-total_points', 200),
    refetchInterval: 30000,
  });

  const sorted = useMemo(() => {
    return [...allStats].sort((a, b) => {
      if (b.total_points !== a.total_points) return b.total_points - a.total_points;
      if (b.exact_scores !== a.exact_scores) return b.exact_scores - a.exact_scores;
      return b.correct_results - a.correct_results;
    });
  }, [allStats]);

  const myEntry = sorted.find(s => s.user_id === user?.id);
  const myRank = myEntry ? (sorted.findIndex(s => s.user_id === user?.id) + 1) : null;
  const leader = sorted[0];

  const RankDelta = ({ current, previous }) => {
    if (!previous || current === previous) return <Minus className="w-3.5 h-3.5 text-muted-foreground" />;
    if (current < previous) return (
      <span className="flex items-center gap-0.5 text-green-500 text-xs font-bold">
        <TrendingUp className="w-3 h-3" />+{previous - current}
      </span>
    );
    return (
      <span className="flex items-center gap-0.5 text-red-400 text-xs font-bold">
        <TrendingDown className="w-3 h-3" />-{current - previous}
      </span>
    );
  };

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="w-6 h-6 text-secondary" />
        <div>
          <h1 className="text-2xl font-display font-bold">Leaderboard</h1>
          <p className="text-xs text-muted-foreground">World Cup 2026 Predictions</p>
        </div>
      </div>

      {/* My position hero */}
      {myEntry && myRank && (
        <div className="bg-gradient-to-br from-primary/10 to-secondary/5 rounded-2xl border border-primary/20 p-4 mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Your rank</p>
            <p className="text-3xl font-bold font-display text-primary">#{myRank}</p>
            {myRank > 1 && leader && (
              <p className="text-xs text-muted-foreground mt-1">
                {leader.total_points - myEntry.total_points} pts behind {leader.display_name?.split(' ')[0]}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Total points</p>
            <p className="text-3xl font-bold font-display text-primary">{myEntry.total_points}</p>
          </div>
        </div>
      )}

      {/* Ranked list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((entry, i) => {
            const rank = i + 1;
            const isMe = entry.user_id === user?.id;
            const isExpanded = expanded === entry.user_id;

            return (
              <div
                key={entry.user_id}
                onClick={() => setExpanded(isExpanded ? null : entry.user_id)}
                className={`rounded-xl border cursor-pointer transition-all ${
                  isMe ? 'border-primary/30 bg-primary/5' : 'border-border bg-card hover:border-border/80'
                }`}
              >
                <div className="flex items-center gap-3 p-3">
                  {/* Rank */}
                  <span className={`w-8 text-center font-bold text-sm shrink-0 ${
                    rank === 1 ? 'text-yellow-400' : rank === 2 ? 'text-slate-300' : rank === 3 ? 'text-amber-600' : 'text-muted-foreground'
                  }`}>
                    {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}
                  </span>

                  {/* Name + badges */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-sm truncate">{entry.display_name || 'Unknown'}</span>
                      {isMe && <span className="text-primary text-[10px] font-bold">(you)</span>}
                    </div>
                    {entry.badges?.length > 0 && (
                      <div className="flex gap-1 mt-0.5 flex-wrap">
                        {entry.badges.slice(0, 3).map((b, j) => (
                          <span key={j} className="text-[10px] bg-muted px-1.5 py-0.5 rounded-full">{b.split(' ')[0]}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Rank delta */}
                  <div className="shrink-0">
                    <RankDelta current={rank} previous={entry.previous_rank} />
                  </div>

                  {/* Points */}
                  <span className="font-bold text-primary font-mono shrink-0 w-16 text-right">{entry.total_points} pts</span>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
                </div>

                {isExpanded && (
                  <div className="px-4 pb-3 pt-1 border-t border-border/40 grid grid-cols-3 gap-3 text-center">
                    <div>
                      <p className="text-lg font-bold text-primary">{entry.exact_scores || 0}</p>
                      <p className="text-[10px] text-muted-foreground">Exact scores</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-secondary">{entry.correct_results || 0}</p>
                      <p className="text-[10px] text-muted-foreground">Correct results</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold">{entry.predictions_count || 0}</p>
                      <p className="text-[10px] text-muted-foreground">Predictions</p>
                    </div>
                    {entry.badges?.length > 0 && (
                      <div className="col-span-3 flex flex-wrap gap-1.5 justify-center pt-1">
                        {entry.badges.map((b, j) => (
                          <span key={j} className="text-xs bg-secondary/10 text-secondary px-2 py-0.5 rounded-full">{b}</span>
                        ))}
                      </div>
                    )}
                    <div className="col-span-3">
                      <Link to="/my-predictions" className="text-xs text-primary hover:underline">
                        View predictions →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {sorted.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Trophy className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-semibold">No predictions yet</p>
              <p className="text-sm mt-1">Start predicting to appear on the leaderboard</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}