import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getFlag, formatIDT, formatShortDateIDT } from '@/lib/flags';
import { Home as HomeIcon, ChevronRight, Trophy, CalendarDays, Users, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function HomePage() {
  const { data: matches } = useQuery({
    queryKey: ['matches'],
    queryFn: () => base44.entities.Match.list('kickoff_utc', 200),
    initialData: [],
  });

  const { data: rsvps } = useQuery({
    queryKey: ['my-rsvps'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.RSVP.filter({ user_id: user.id });
    },
    initialData: [],
  });

  const { data: watchParties } = useQuery({
    queryKey: ['watch-parties'],
    queryFn: () => base44.entities.WatchParty.list('-created_date', 200),
    initialData: [],
  });

  const now = new Date();
  const openingDate = new Date('2026-06-11T19:00:00Z');
  const daysUntil = Math.max(0, Math.ceil((openingDate - now) / (1000 * 60 * 60 * 24)));

  const rsvpMap = useMemo(() => {
    const map = {};
    rsvps.forEach(r => { map[r.match_id] = r; });
    return map;
  }, [rsvps]);

  const partyMap = useMemo(() => {
    const map = {};
    watchParties.forEach(p => { map[p.match_id] = p; });
    return map;
  }, [watchParties]);

  const upcomingAttending = useMemo(() => {
    return matches
      .filter(m => new Date(m.kickoff_utc) > now && rsvpMap[m.id]?.status === 'attending')
      .sort((a, b) => new Date(a.kickoff_utc) - new Date(b.kickoff_utc));
  }, [matches, rsvpMap]);

  const nextGame = upcomingAttending[0];
  const nextParty = nextGame ? partyMap[nextGame.id] : null;

  const myRsvpAttending = rsvps.filter(r => r.status === 'attending').length;
  const myRsvpHosting = watchParties.filter(p => {
    try { return p.host_user_id; } catch { return false; }
  }).length;
  const pendingGames = matches.filter(m => new Date(m.kickoff_utc) > now && !rsvpMap[m.id]).length;

  // Upcoming games this week without RSVP
  const oneWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const thisWeekNoRsvp = matches.filter(m => {
    const d = new Date(m.kickoff_utc);
    return d > now && d < oneWeek && !rsvpMap[m.id];
  });

  // Games attending with no host
  const noHostGames = upcomingAttending.filter(m => !partyMap[m.id]?.host_user_id);

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">⚽ Watch Party</h1>
          <p className="text-sm text-muted-foreground">World Cup 2026</p>
        </div>
        <div className="text-right">
          <Badge className="bg-secondary/20 text-secondary border-secondary/30 font-mono text-xs">
            {daysUntil > 0 ? `${daysUntil} days to go` : '🏆 It\'s on!'}
          </Badge>
        </div>
      </div>

      {/* Summary card: next game + status + active parties */}
      {nextGame ? (
        <div className="space-y-2">
          {/* Next game hero */}
          <Link to={`/game/${nextGame.id}`} className="block">
            <div className="relative bg-gradient-to-br from-primary/20 via-card to-secondary/10 rounded-2xl p-5 border border-primary/20 overflow-hidden">
              <div className="absolute top-2 right-3 text-[60px] opacity-5">⚽</div>
              {/* Status badge */}
              {nextGame.status === 'live' ? (
                <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />Live Now
                </p>
              ) : (
                <p className="text-xs text-primary font-semibold uppercase tracking-wider mb-2">Your Next Game</p>
              )}
              <div className="flex items-center gap-4 mb-3">
                <div className="text-center">
                  <div className="text-3xl">{getFlag(nextGame.home_team)}</div>
                  <p className="text-xs font-semibold mt-1">{nextGame.home_team}</p>
                </div>
                <div className="text-center px-3">
                  {nextGame.status === 'live' || nextGame.status === 'finished' ? (
                    <span className="text-2xl font-bold font-mono">{nextGame.home_score ?? 0}–{nextGame.away_score ?? 0}</span>
                  ) : (
                    <span className="text-lg font-bold text-muted-foreground">vs</span>
                  )}
                </div>
                <div className="text-center">
                  <div className="text-3xl">{getFlag(nextGame.away_team)}</div>
                  <p className="text-xs font-semibold mt-1">{nextGame.away_team}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <span className="font-mono font-bold text-primary">{formatIDT(nextGame.kickoff_utc)}</span>
                  <span className="text-muted-foreground"> · {formatShortDateIDT(nextGame.kickoff_utc)}</span>
                </div>
                {nextParty?.host_display_name ? (
                  <Badge className="bg-secondary/20 text-secondary text-xs">
                    <HomeIcon className="w-3 h-3 mr-1" />
                    @ {nextParty.host_display_name.split(' ')[0]}'s
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs text-muted-foreground">No host yet</Badge>
                )}
              </div>
              <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/30" />
            </div>
          </Link>

          {/* Active watch parties I'm attending */}
          {upcomingAttending.length > 0 && (
            <div className="bg-card rounded-xl border border-border divide-y divide-border overflow-hidden">
              {upcomingAttending.slice(0, 3).map(match => {
                const party = partyMap[match.id];
                const isLive = match.status === 'live';
                return (
                  <Link key={match.id} to={`/game/${match.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-all">
                    <span className="text-base">{getFlag(match.home_team)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{match.home_team} vs {match.away_team}</p>
                      <p className="text-xs text-muted-foreground">{formatShortDateIDT(match.kickoff_utc)} · {formatIDT(match.kickoff_utc)}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {isLive && (
                        <span className="flex items-center gap-1 text-red-400 text-[10px] font-bold">
                          <Zap className="w-3 h-3" />LIVE
                        </span>
                      )}
                      {party?.attending_count > 0 && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Users className="w-3 h-3" />{party.attending_count}
                        </span>
                      )}
                      {party?.host_display_name && (
                        <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] px-1.5 py-0">
                          🏠
                        </Badge>
                      )}
                    </div>
                  </Link>
                );
              })}
              {upcomingAttending.length > 3 && (
                <Link to="/games" className="flex items-center justify-center py-2.5 text-xs text-primary font-semibold hover:bg-muted/50 transition-all">
                  +{upcomingAttending.length - 3} more games →
                </Link>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-card rounded-2xl p-6 border border-border text-center">
          <Trophy className="w-10 h-10 mx-auto text-secondary mb-3" />
          <h2 className="font-semibold">No upcoming games yet</h2>
          <p className="text-sm text-muted-foreground mt-1">RSVP to games to see your next watch party here</p>
          <Link to="/games" className="inline-block mt-3 text-primary text-sm font-semibold">
            Browse Games →
          </Link>
        </div>
      )}

      {/* Nudges */}
      {thisWeekNoRsvp.length > 0 && (
        <Link to="/games" className="block">
          <div className="bg-secondary/10 border border-secondary/20 rounded-xl p-4">
            <p className="text-sm font-semibold text-secondary">
              📅 {thisWeekNoRsvp.length} game{thisWeekNoRsvp.length > 1 ? 's' : ''} this week — you haven't responded yet
            </p>
          </div>
        </Link>
      )}

      {noHostGames.length > 0 && (
        <Link to={`/game/${noHostGames[0].id}`} className="block">
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
            <p className="text-sm font-semibold text-orange-400">
              🏠 {noHostGames.length} game{noHostGames.length > 1 ? 's' : ''} you're attending {noHostGames.length > 1 ? 'have' : 'has'} no host — volunteer?
            </p>
          </div>
        </Link>
      )}

      {/* Host Dashboard + Calendar Export CTAs */}
      <div className="grid grid-cols-2 gap-3">
        <Link to="/host-dashboard" className="flex items-center gap-2 bg-card rounded-xl p-3 border border-border hover:border-primary/30 transition-all">
          <HomeIcon className="w-4 h-4 text-primary shrink-0" />
          <div>
            <p className="text-xs font-semibold">My Parties</p>
            <p className="text-[10px] text-muted-foreground">Host dashboard</p>
          </div>
        </Link>
        <button
          onClick={async () => {
            const res = await base44.functions.invoke('exportCalendar', {});
            const blob = new Blob([res.data], { type: 'text/calendar' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = 'WorldCup2026.ics'; a.click();
            URL.revokeObjectURL(url);
          }}
          className="flex items-center gap-2 bg-card rounded-xl p-3 border border-border hover:border-primary/30 transition-all text-left"
        >
          <CalendarDays className="w-4 h-4 text-secondary shrink-0" />
          <div>
            <p className="text-xs font-semibold">Add to Calendar</p>
            <p className="text-[10px] text-muted-foreground">Download .ics</p>
          </div>
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card rounded-xl p-4 border border-border text-center">
          <p className="text-2xl font-bold font-display text-primary">{myRsvpAttending}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Attending</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border text-center">
          <p className="text-2xl font-bold font-display text-secondary">{myRsvpHosting}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Hosting</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border text-center">
          <p className="text-2xl font-bold font-display text-muted-foreground">{pendingGames}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Pending</p>
        </div>
      </div>


    </div>
  );
}