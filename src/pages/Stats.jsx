import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trophy, Home as HomeIcon, Users, Star, Target } from 'lucide-react';
import { getFlag } from '@/lib/flags';

export default function StatsPage() {
  const { data: allRsvps = [] } = useQuery({
    queryKey: ['all-rsvps-stats'],
    queryFn: () => base44.entities.RSVP.list('-created_date', 500),
  });

  const { data: allParties = [] } = useQuery({
    queryKey: ['all-parties-stats'],
    queryFn: () => base44.entities.WatchParty.list('-created_date', 300),
  });

  const { data: matches = [] } = useQuery({
    queryKey: ['matches'],
    queryFn: () => base44.entities.Match.list('kickoff_utc', 200),
  });

  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  // Build per-user stats
  const userStats = useMemo(() => {
    const stats = {};

    allRsvps.forEach(r => {
      if (!stats[r.user_id]) {
        stats[r.user_id] = { userId: r.user_id, name: r.user_name || 'Unknown', attended: 0, maybe: 0, declined: 0, hosted: 0 };
      }
      if (r.status === 'attending') stats[r.user_id].attended++;
      else if (r.status === 'maybe') stats[r.user_id].maybe++;
      else if (r.status === 'not-attending') stats[r.user_id].declined++;
    });

    allParties.forEach(p => {
      if (!p.host_user_id) return;
      if (!stats[p.host_user_id]) {
        stats[p.host_user_id] = { userId: p.host_user_id, name: p.host_display_name || 'Unknown', attended: 0, maybe: 0, declined: 0, hosted: 0 };
      }
      stats[p.host_user_id].hosted++;
    });

    return Object.values(stats).sort((a, b) => b.attended - a.attended || b.hosted - a.hosted);
  }, [allRsvps, allParties]);

  // Top hosts by hosted count
  const topHosts = useMemo(() =>
    [...userStats].sort((a, b) => b.hosted - a.hosted).slice(0, 5),
    [userStats]
  );

  // Most attended games
  const topGames = useMemo(() => {
    const gameCounts = {};
    allRsvps.filter(r => r.status === 'attending').forEach(r => {
      gameCounts[r.match_id] = (gameCounts[r.match_id] || 0) + 1;
    });
    return Object.entries(gameCounts)
      .map(([matchId, count]) => ({ match: matches.find(m => m.id === matchId), count }))
      .filter(x => x.match)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [allRsvps, matches]);

  const myStats = currentUser ? userStats.find(s => s.userId === currentUser.id) : null;
  const myRank = currentUser ? userStats.findIndex(s => s.userId === currentUser.id) + 1 : null;

  // Prediction accuracy from UserStats
  const { data: allUserStats = [] } = useQuery({
    queryKey: ['all-user-stats'],
    queryFn: () => base44.entities.UserStats.list('-total_points', 200),
  });

  const predStats = useMemo(() => {
    const totals = allUserStats.reduce((acc, s) => ({
      predictions: acc.predictions + (s.predictions_count || 0),
      correctResults: acc.correctResults + (s.correct_results || 0),
      exactScores: acc.exactScores + (s.exact_scores || 0),
      totalPoints: acc.totalPoints + (s.total_points || 0),
    }), { predictions: 0, correctResults: 0, exactScores: 0, totalPoints: 0 });
    return {
      ...totals,
      accuracy: totals.predictions > 0 ? Math.round((totals.correctResults / totals.predictions) * 100) : 0,
    };
  }, [allUserStats]);

  return (
    <div className="max-w-lg mx-auto px-4 pt-4 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/" className="p-2 -ml-2 rounded-xl hover:bg-muted transition-all">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-display font-bold">📊 Group Stats</h1>
          <p className="text-xs text-muted-foreground">Who's watching the most</p>
        </div>
      </div>

      {/* My stats card */}
      {myStats && (
        <div className="bg-gradient-to-br from-primary/20 via-card to-secondary/10 rounded-2xl border border-primary/20 p-5 mb-6">
          <p className="text-xs text-primary font-semibold uppercase tracking-wider mb-2">Your Stats</p>
          <div className="grid grid-cols-4 gap-3 text-center">
            <div>
              <p className="text-2xl font-bold font-display text-primary">{myStats.attended}</p>
              <p className="text-[10px] text-muted-foreground">Attending</p>
            </div>
            <div>
              <p className="text-2xl font-bold font-display text-secondary">{myStats.hosted}</p>
              <p className="text-[10px] text-muted-foreground">Hosted</p>
            </div>
            <div>
              <p className="text-2xl font-bold font-display text-muted-foreground">{myStats.maybe}</p>
              <p className="text-[10px] text-muted-foreground">Maybe</p>
            </div>
            <div>
              <p className="text-2xl font-bold font-display">{myRank ? `#${myRank}` : '—'}</p>
              <p className="text-[10px] text-muted-foreground">Rank</p>
            </div>
          </div>
        </div>
      )}

      {/* Group prediction accuracy */}
      {predStats.predictions > 0 && (
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-primary" />
            <h2 className="font-semibold text-sm">Group Prediction Accuracy</h2>
          </div>
          <div className="bg-card rounded-2xl border border-border p-4 grid grid-cols-4 gap-3 text-center">
            <div>
              <p className="text-xl font-bold text-primary">{predStats.accuracy}%</p>
              <p className="text-[10px] text-muted-foreground">Accuracy</p>
            </div>
            <div>
              <p className="text-xl font-bold text-secondary">{predStats.exactScores}</p>
              <p className="text-[10px] text-muted-foreground">Exact scores</p>
            </div>
            <div>
              <p className="text-xl font-bold">{predStats.correctResults}</p>
              <p className="text-[10px] text-muted-foreground">Correct results</p>
            </div>
            <div>
              <p className="text-xl font-bold">{predStats.predictions}</p>
              <p className="text-[10px] text-muted-foreground">Predictions</p>
            </div>
          </div>
          {allUserStats.length > 0 && (
            <div className="mt-3 space-y-2">
              {[...allUserStats]
                .sort((a, b) => (b.total_points || 0) - (a.total_points || 0))
                .slice(0, 5)
                .map((s, i) => {
                  const acc = s.predictions_count > 0 ? Math.round((s.correct_results / s.predictions_count) * 100) : 0;
                  const isMe = s.user_id === currentUser?.id;
                  return (
                    <div key={s.user_id} className={`flex items-center gap-3 p-2.5 rounded-xl border text-sm ${
                      isMe ? 'bg-primary/10 border-primary/20' : 'bg-card border-border'
                    }`}>
                      <span className="w-5 text-center font-bold text-muted-foreground text-xs">{i === 0 ? '🎯' : `${i+1}`}</span>
                      <span className="flex-1 font-medium truncate">{s.display_name || 'Unknown'}{isMe ? ' (you)' : ''}</span>
                      <span className="text-muted-foreground text-xs">{s.predictions_count || 0} preds</span>
                      <span className="font-bold text-primary">{acc}%</span>
                      <span className="font-bold text-secondary w-14 text-right">{s.total_points || 0} pts</span>
                    </div>
                  );
                })}
            </div>
          )}
        </section>
      )}

      {/* Attendance leaderboard */}
      <section className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-primary" />
          <h2 className="font-semibold text-sm">Attendance Leaderboard</h2>
        </div>
        <div className="space-y-2">
          {userStats.slice(0, 10).map((s, i) => {
            const isMe = s.userId === currentUser?.id;
            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null;
            return (
              <div key={s.userId} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                isMe ? 'bg-primary/10 border-primary/20' : 'bg-card border-border'
              }`}>
                <span className="w-6 text-center text-sm font-bold text-muted-foreground">
                  {medal || `${i + 1}`}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{s.name}{isMe ? ' (you)' : ''}</p>
                  <p className="text-[10px] text-muted-foreground">{s.hosted > 0 ? `Hosted ${s.hosted}x` : 'No hosting yet'}</p>
                </div>
                <div className="flex items-center gap-3 text-center shrink-0">
                  <div>
                    <p className="text-sm font-bold text-primary">{s.attended}</p>
                    <p className="text-[9px] text-muted-foreground">going</p>
                  </div>
                  {s.hosted > 0 && (
                    <div>
                      <p className="text-sm font-bold text-secondary">{s.hosted}</p>
                      <p className="text-[9px] text-muted-foreground">hosted</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Top hosts */}
      {topHosts.some(h => h.hosted > 0) && (
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <HomeIcon className="w-4 h-4 text-secondary" />
            <h2 className="font-semibold text-sm">Top Hosts</h2>
          </div>
          <div className="space-y-2">
            {topHosts.filter(h => h.hosted > 0).map((s, i) => (
              <div key={s.userId} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
                <span className="text-lg">{i === 0 ? '🏠' : '🏡'}</span>
                <p className="flex-1 text-sm font-medium truncate">{s.name}</p>
                <span className="text-secondary font-bold text-sm">{s.hosted} parties</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Most popular games */}
      {topGames.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 text-secondary" />
            <h2 className="font-semibold text-sm">Most Popular Games</h2>
          </div>
          <div className="space-y-2">
            {topGames.map(({ match, count }) => (
              <Link key={match.id} to={`/game/${match.id}`}>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:border-primary/20 transition-all">
                  <span>{getFlag(match.home_team)}</span>
                  <p className="flex-1 text-sm font-medium truncate">{match.home_team} vs {match.away_team}</p>
                  <span>{getFlag(match.away_team)}</span>
                  <span className="text-primary font-bold text-sm">{count} 👥</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {userStats.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No stats yet — start RSVPing to games!</p>
        </div>
      )}
    </div>
  );
}