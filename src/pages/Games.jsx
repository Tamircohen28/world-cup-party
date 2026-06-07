import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import MatchCard from '@/components/games/MatchCard';
import CalendarView from '@/components/games/CalendarView';
import GamesFilter from '@/components/games/GamesFilter';
import { formatDateIDT } from '@/lib/flags';
import { Loader2, List, CalendarDays } from 'lucide-react';

const STAGE_TABS = [
  { key: 'all', label: 'All' },
  { key: 'group', label: 'Group Stage' },
  { key: 'r32', label: 'R32' },
  { key: 'r16', label: 'R16' },
  { key: 'qf', label: 'QF' },
  { key: 'sf', label: 'SF' },
  { key: 'final', label: '🏆 Final' },
];

const QUICK_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'this-week', label: 'This Week' },
  { key: 'attending', label: 'Attending' },
  { key: 'no-host', label: '🏠 No Host' },
];

export default function GamesPage() {
  const [filter, setFilter] = useState('all');
  const [stageTab, setStageTab] = useState('all');
  const [viewMode, setViewMode] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [advancedFilter, setAdvancedFilter] = useState({ team: null, dayOfWeek: null, hour: null });

  const { data: matches, isLoading } = useQuery({
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

  const now = new Date();
  const oneWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const filteredMatches = useMemo(() => {
    return matches.filter(m => {
      const d = new Date(m.kickoff_utc);

      // Stage tab
      if (stageTab !== 'all') {
        if (stageTab === 'final' && m.stage !== 'final' && m.stage !== 'third') return false;
        else if (stageTab !== 'final' && m.stage !== stageTab) return false;
      }

      // Quick filter
      const quickPass = (() => {
        switch (filter) {
          case 'this-week': return d > now && d < oneWeek;
          case 'attending': return rsvpMap[m.id]?.status === 'attending';
          case 'no-host': return d > now && rsvpMap[m.id]?.status === 'attending' && !partyMap[m.id]?.host_user_id;
          default: return true;
        }
      })();
      if (!quickPass) return false;

      // Search query
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!m.home_team.toLowerCase().includes(q) && !m.away_team.toLowerCase().includes(q)) return false;
      }

      // Team filter
      if (advancedFilter.team) {
        if (m.home_team !== advancedFilter.team && m.away_team !== advancedFilter.team) return false;
      }

      // Day of week filter (in IDT timezone)
      if (advancedFilter.dayOfWeek !== null) {
        const dayInIDT = new Date(d.toLocaleString('en-US', { timeZone: 'Asia/Jerusalem' })).getDay();
        if (dayInIDT !== advancedFilter.dayOfWeek) return false;
      }

      // Hour filter (in IDT)
      if (advancedFilter.hour !== null) {
        const timeInIDT = d.toLocaleTimeString('en-IL', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jerusalem', hour12: false });
        if (timeInIDT !== advancedFilter.hour) return false;
      }

      return true;
    }).sort((a, b) => new Date(a.kickoff_utc) - new Date(b.kickoff_utc));
  }, [matches, filter, stageTab, rsvpMap, partyMap, searchQuery, advancedFilter]);

  // Group by date
  const grouped = useMemo(() => {
    const groups = {};
    filteredMatches.forEach(m => {
      const dateKey = formatDateIDT(m.kickoff_utc);
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(m);
    });
    return groups;
  }, [filteredMatches]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-display font-bold">Games</h1>
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`p-1.5 rounded-md transition-all ${viewMode === 'calendar' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <CalendarDays className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stage tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none mb-2">
        {STAGE_TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setStageTab(t.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
              stageTab === t.key
                ? 'bg-card border-primary text-primary shadow-sm'
                : 'bg-muted border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Calendar view */}
      {viewMode === 'calendar' && (
        <CalendarView matches={matches} rsvpMap={rsvpMap} />
      )}

      {viewMode === 'list' && <>
      {/* Advanced filter + search */}
      <GamesFilter
        matches={matches}
        filter={advancedFilter}
        setFilter={setAdvancedFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Quick filters */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 -mx-4 px-4 scrollbar-none">
        {QUICK_FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              filter === f.key
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Match list */}
      <div className="space-y-6">
        {Object.entries(grouped).map(([date, games]) => (
          <div key={date}>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 sticky top-0 bg-background/95 backdrop-blur-sm py-1 z-10">
              {date}
            </h3>
            <div className="space-y-3">
              {games.map(match => (
                <MatchCard
                  key={match.id}
                  match={match}
                  rsvp={rsvpMap[match.id]}
                  watchParty={partyMap[match.id]}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {filteredMatches.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No games match this filter</p>
        </div>
      )}
      </>}
    </div>
  );
}