import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getFlag, formatIDT, getStageName } from '@/lib/flags';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export default function CalendarView({ matches, rsvpMap }) {
  // Tournament runs Jun–Jul 2026
  const [viewMonth, setViewMonth] = useState(5); // 0-indexed, June = 5
  const [viewYear] = useState(2026);

  const firstDay = new Date(viewYear, viewMonth, 1);
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const startDow = firstDay.getDay(); // 0 = Sunday

  // Map date string 'YYYY-MM-DD' (IDT) -> matches
  const matchesByDate = useMemo(() => {
    const map = {};
    matches.forEach(m => {
      // Convert to IDT (UTC+3)
      const d = new Date(new Date(m.kickoff_utc).getTime() + 3 * 60 * 60 * 1000);
      const key = d.toISOString().slice(0, 10);
      if (!map[key]) map[key] = [];
      map[key].push(m);
    });
    return map;
  }, [matches]);

  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const canGoPrev = viewMonth > 5; // can't go before June 2026
  const canGoNext = viewMonth < 6; // can't go after July 2026

  // Build grid cells
  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const [selectedDay, setSelectedDay] = useState(null);

  const selectedKey = selectedDay
    ? `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`
    : null;
  const selectedMatches = selectedKey ? (matchesByDate[selectedKey] || []) : [];

  return (
    <div>
      {/* Month nav */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => { setViewMonth(m => m - 1); setSelectedDay(null); }}
          disabled={!canGoPrev}
          className="p-2 rounded-lg hover:bg-muted disabled:opacity-30 transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h3 className="font-display font-bold text-base">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </h3>
        <button
          onClick={() => { setViewMonth(m => m + 1); setSelectedDay(null); }}
          disabled={!canGoNext}
          className="p-2 rounded-lg hover:bg-muted disabled:opacity-30 transition-all"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_NAMES.map(d => (
          <div key={d} className="text-center text-[10px] font-semibold text-muted-foreground py-1">{d}</div>
        ))}
      </div>

      {/* Cells */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} />;
          const key = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayMatches = matchesByDate[key] || [];
          const isToday = key === todayKey;
          const isSelected = day === selectedDay;
          const hasAttending = dayMatches.some(m => rsvpMap[m.id]?.status === 'attending');
          const hasMatch = dayMatches.length > 0;

          return (
            <button
              key={key}
              onClick={() => setSelectedDay(day === selectedDay ? null : day)}
              className={`relative flex flex-col items-center py-1.5 rounded-xl transition-all ${
                isSelected ? 'bg-primary text-primary-foreground' :
                isToday ? 'bg-primary/15 text-primary' :
                hasMatch ? 'hover:bg-muted' : 'opacity-40'
              }`}
              disabled={!hasMatch}
            >
              <span className="text-xs font-semibold">{day}</span>
              {hasMatch && (
                <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
                  {dayMatches.slice(0, 3).map(m => (
                    <span
                      key={m.id}
                      className={`w-1.5 h-1.5 rounded-full ${
                        isSelected ? 'bg-primary-foreground' :
                        rsvpMap[m.id]?.status === 'attending' ? 'bg-primary' :
                        rsvpMap[m.id]?.status === 'maybe' ? 'bg-secondary' :
                        'bg-muted-foreground/40'
                      }`}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected day matches */}
      {selectedMatches.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {MONTH_NAMES[viewMonth]} {selectedDay} — {selectedMatches.length} game{selectedMatches.length > 1 ? 's' : ''}
          </p>
          {selectedMatches.map(m => {
            const rsvp = rsvpMap[m.id];
            return (
              <Link key={m.id} to={`/game/${m.id}`} className="block">
                <div className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border hover:border-primary/30 transition-all">
                  <span className="text-lg">{getFlag(m.home_team)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{m.home_team} vs {m.away_team}</p>
                    <p className="text-xs text-muted-foreground">{formatIDT(m.kickoff_utc)} IDT</p>
                  </div>
                  <span className="text-lg">{getFlag(m.away_team)}</span>
                  {rsvp && (
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      rsvp.status === 'attending' ? 'bg-primary/20 text-primary' :
                      rsvp.status === 'maybe' ? 'bg-secondary/20 text-secondary' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {rsvp.status === 'attending' ? '✓' : rsvp.status === 'maybe' ? '?' : '✗'}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}