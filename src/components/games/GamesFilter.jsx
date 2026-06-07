import React, { useState, useMemo } from 'react';
import { Search, X, ChevronDown } from 'lucide-react';
import { getFlag } from '@/lib/flags';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function GamesFilter({ matches, filter, setFilter, searchQuery, setSearchQuery }) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Derive unique team list from matches
  const allTeams = useMemo(() => {
    const teams = new Set();
    matches.forEach(m => {
      if (m.home_team !== 'TBD') teams.add(m.home_team);
      if (m.away_team !== 'TBD') teams.add(m.away_team);
    });
    return [...teams].sort();
  }, [matches]);

  const hasAdvancedFilter = filter.team || filter.dayOfWeek !== null || filter.hour !== null;

  return (
    <div className="space-y-3 mb-4">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search team or country..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-9 py-2 bg-muted rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Advanced filter toggle */}
      <button
        onClick={() => setShowAdvanced(v => !v)}
        className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${hasAdvancedFilter ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
      >
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
        {hasAdvancedFilter ? '✦ Filters active' : 'More filters'}
        {hasAdvancedFilter && (
          <button
            onClick={(e) => { e.stopPropagation(); setFilter(f => ({ ...f, team: null, dayOfWeek: null, hour: null })); }}
            className="ml-1 text-destructive"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </button>

      {showAdvanced && (
        <div className="bg-card rounded-xl border border-border p-4 space-y-4">
          {/* Team picker */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">Team / Country</p>
            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto scrollbar-none">
              {allTeams.map(team => (
                <button
                  key={team}
                  onClick={() => setFilter(f => ({ ...f, team: f.team === team ? null : team }))}
                  className={`px-2.5 py-1 rounded-full text-xs flex items-center gap-1 transition-all border ${
                    filter.team === team
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span>{getFlag(team)}</span>
                  <span>{team}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Day of week picker */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">Day of Week</p>
            <div className="flex gap-1.5">
              {DAYS_OF_WEEK.map((day, i) => (
                <button
                  key={day}
                  onClick={() => setFilter(f => ({ ...f, dayOfWeek: f.dayOfWeek === i ? null : i }))}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    filter.dayOfWeek === i
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Hour picker */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">Kickoff Time (IDT)</p>
            <div className="flex flex-wrap gap-1.5">
              {['18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '00:00', '01:00', '02:00', '03:00'].map(h => (
                <button
                  key={h}
                  onClick={() => setFilter(f => ({ ...f, hour: f.hour === h ? null : h }))}
                  className={`px-3 py-1 rounded-full text-xs font-mono transition-all border ${
                    filter.hour === h
                      ? 'bg-secondary text-secondary-foreground border-secondary'
                      : 'bg-muted border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}