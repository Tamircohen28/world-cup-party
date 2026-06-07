import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getFlag, formatIDT, formatShortDateIDT } from '@/lib/flags';
import { ArrowLeft, Users, MapPin, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function HostDashboard() {
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: watchParties } = useQuery({
    queryKey: ['watch-parties'],
    queryFn: () => base44.entities.WatchParty.list('-created_date', 200),
    initialData: [],
  });

  const { data: matches } = useQuery({
    queryKey: ['matches'],
    queryFn: () => base44.entities.Match.list('kickoff_utc', 200),
    initialData: [],
  });

  const { data: allRsvps } = useQuery({
    queryKey: ['all-rsvps'],
    queryFn: () => base44.entities.RSVP.list('-created_date', 500),
    initialData: [],
  });

  const matchMap = useMemo(() => {
    const map = {};
    matches.forEach(m => { map[m.id] = m; });
    return map;
  }, [matches]);

  const myParties = useMemo(() => {
    return watchParties
      .filter(p => p.host_user_id === user?.id)
      .map(p => {
        const match = matchMap[p.match_id];
        const rsvps = allRsvps.filter(r => r.match_id === p.match_id && r.status === 'attending');
        const claimedItems = (p.items || []).filter(i => i.claimed_by);
        const unclaimedItems = (p.items || []).filter(i => !i.claimed_by);
        return { party: p, match, rsvps, claimedItems, unclaimedItems };
      })
      .filter(entry => entry.match)
      .sort((a, b) => new Date(a.match.kickoff_utc) - new Date(b.match.kickoff_utc));
  }, [watchParties, user, matchMap, allRsvps]);

  const upcoming = myParties.filter(e => new Date(e.match.kickoff_utc) > new Date());
  const past = myParties.filter(e => new Date(e.match.kickoff_utc) <= new Date());

  return (
    <div className="max-w-lg mx-auto px-4 pt-4 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/" className="p-2 -ml-2 rounded-xl hover:bg-muted transition-all">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-display font-bold">My Host Dashboard</h1>
          <p className="text-xs text-muted-foreground">{upcoming.length} upcoming {upcoming.length === 1 ? 'party' : 'parties'}</p>
        </div>
      </div>

      {myParties.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <div className="text-5xl mb-4">🏠</div>
          <p className="font-semibold">No parties hosted yet</p>
          <p className="text-sm mt-1">Go to a game page and volunteer to host!</p>
          <Link to="/games" className="inline-block mt-4 text-primary text-sm font-semibold">Browse Games →</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {upcoming.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Upcoming</h2>
              <div className="space-y-4">
                {upcoming.map(entry => (
                  <PartyCard key={entry.party.id} entry={entry} />
                ))}
              </div>
            </section>
          )}
          {past.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Past</h2>
              <div className="space-y-4 opacity-60">
                {past.map(entry => (
                  <PartyCard key={entry.party.id} entry={entry} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function PartyCard({ entry }) {
  const { party, match, rsvps, claimedItems, unclaimedItems } = entry;

  return (
    <Link to={`/game/${match.id}`} className="block">
      <div className="bg-card rounded-xl border border-border p-4 space-y-4 hover:border-primary/30 transition-all">
        {/* Match header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getFlag(match.home_team)}</span>
            <div>
              <p className="font-semibold text-sm">{match.home_team} vs {match.away_team}</p>
              <p className="text-xs text-muted-foreground">{formatShortDateIDT(match.kickoff_utc)} · {formatIDT(match.kickoff_utc)} IDT</p>
            </div>
            <span className="text-2xl">{getFlag(match.away_team)}</span>
          </div>
        </div>

        {/* Location */}
        {party.host_location && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <MapPin className="w-3 h-3" />{party.host_location}
          </p>
        )}

        {/* Headcount */}
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          <p className="text-sm font-semibold text-primary">{rsvps.length} attending</p>
          {rsvps.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {rsvps.map(r => (
                <Badge key={r.id} className="text-xs bg-primary/10 text-primary border-primary/20">
                  {r.user_name?.split(' ')[0] || '?'}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Items summary */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-4 h-4 text-muted-foreground" />
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Bring List ({claimedItems.length}/{claimedItems.length + unclaimedItems.length} claimed)
            </p>
          </div>
          <div className="space-y-1">
            {claimedItems.map(item => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <span>{item.emoji} {item.name}</span>
                <span className="text-xs text-primary font-medium">{item.claimed_by_name?.split(' ')[0]}</span>
              </div>
            ))}
            {unclaimedItems.map(item => (
              <div key={item.id} className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{item.emoji} {item.name}</span>
                <span className="text-xs">unclaimed</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}