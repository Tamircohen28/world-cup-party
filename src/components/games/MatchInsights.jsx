import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, TrendingUp, Swords, BarChart3, Info } from 'lucide-react';
import { getFlag } from '@/lib/flags';

export default function MatchInsights({ match }) {
  const isKnownTeams = match.home_team !== 'TBD' && match.away_team !== 'TBD';

  const { data: insights, isLoading } = useQuery({
    queryKey: ['match-insights', match.id],
    queryFn: () => base44.integrations.Core.InvokeLLM({
      prompt: `For the FIFA World Cup 2026 match: ${match.home_team} vs ${match.away_team} (${match.stage === 'group' ? `Group ${match.group_name}, Matchday ${match.matchday}` : match.stage.toUpperCase()}, at ${match.stadium}).

Return a JSON object with:
- home_form: last 5 matches results as a short string like "W W D L W" (most recent last), for ${match.home_team}
- away_form: same for ${match.away_team}
- head_to_head: object with { total_matches: number, home_wins: number, away_wins: number, draws: number, last_match: string (short description of last meeting) }
- group_standings: array of { team: string, played: number, points: number, gd: number } sorted by points (only if group stage, else null)
- home_key_player: string, name of a key player to watch for ${match.home_team}
- away_key_player: string, name of a key player to watch for ${match.away_team}
- stadium_fact: one interesting sentence about ${match.stadium}
- betting_odds: object with { home_win: string, draw: string, away_win: string } as decimal odds strings (e.g. "2.10")

Use the most recent available data. Be accurate.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          home_form: { type: 'string' },
          away_form: { type: 'string' },
          head_to_head: {
            type: 'object',
            properties: {
              total_matches: { type: 'number' },
              home_wins: { type: 'number' },
              away_wins: { type: 'number' },
              draws: { type: 'number' },
              last_match: { type: 'string' },
            }
          },
          group_standings: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                team: { type: 'string' },
                played: { type: 'number' },
                points: { type: 'number' },
                gd: { type: 'number' },
              }
            }
          },
          home_key_player: { type: 'string' },
          away_key_player: { type: 'string' },
          stadium_fact: { type: 'string' },
          betting_odds: {
            type: 'object',
            properties: {
              home_win: { type: 'string' },
              draw: { type: 'string' },
              away_win: { type: 'string' },
            }
          },
        }
      }
    }),
    enabled: !!match && isKnownTeams,
    staleTime: 1000 * 60 * 60, // cache for 1 hour
  });

  if (!isKnownTeams) return null;

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-sm py-4">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading match insights...
      </div>
    );
  }

  if (!insights) return null;

  return (
    <div className="space-y-4">

      {/* Form + Key Players */}
      <div className="grid grid-cols-2 gap-3">
        <FormCard
          team={match.home_team}
          form={insights.home_form}
          keyPlayer={insights.home_key_player}
        />
        <FormCard
          team={match.away_team}
          form={insights.away_form}
          keyPlayer={insights.away_key_player}
        />
      </div>

      {/* Head to Head */}
      {insights.head_to_head && (
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-3">
            <Swords className="w-4 h-4 text-muted-foreground" />
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Head to Head</p>
          </div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-center">
              <p className="text-xl font-bold text-primary">{insights.head_to_head.home_wins}</p>
              <p className="text-[10px] text-muted-foreground">{match.home_team.split(' ')[0]} wins</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-muted-foreground">{insights.head_to_head.draws}</p>
              <p className="text-[10px] text-muted-foreground">Draws</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-secondary">{insights.head_to_head.away_wins}</p>
              <p className="text-[10px] text-muted-foreground">{match.away_team.split(' ')[0]} wins</p>
            </div>
          </div>
          {/* Win % bar */}
          <div className="flex rounded-full overflow-hidden h-2 mb-2">
            {insights.head_to_head.total_matches > 0 && (() => {
              const total = insights.head_to_head.total_matches;
              const hw = Math.round((insights.head_to_head.home_wins / total) * 100);
              const d  = Math.round((insights.head_to_head.draws / total) * 100);
              const aw = 100 - hw - d;
              return (
                <>
                  <div className="bg-primary" style={{ width: `${hw}%` }} />
                  <div className="bg-muted-foreground/30" style={{ width: `${d}%` }} />
                  <div className="bg-secondary" style={{ width: `${aw}%` }} />
                </>
              );
            })()}
          </div>
          {insights.head_to_head.last_match && (
            <p className="text-xs text-muted-foreground">Last meeting: {insights.head_to_head.last_match}</p>
          )}
        </div>
      )}

      {/* Group Standings */}
      {insights.group_standings?.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Group {match.group_name} Standings
            </p>
          </div>
          <div className="space-y-2">
            {insights.group_standings.map((row, i) => {
              const isHome = row.team === match.home_team;
              const isAway = row.team === match.away_team;
              return (
                <div key={i} className={`flex items-center gap-3 text-sm rounded-lg px-2 py-1 ${
                  isHome ? 'bg-primary/10' : isAway ? 'bg-secondary/10' : ''
                }`}>
                  <span className="text-muted-foreground w-4 text-xs">{i + 1}</span>
                  <span className="text-base">{getFlag(row.team)}</span>
                  <span className="flex-1 font-medium text-xs truncate">{row.team}</span>
                  <span className="text-muted-foreground text-xs w-5 text-center">{row.played}</span>
                  <span className={`font-bold text-xs w-6 text-center ${isHome ? 'text-primary' : isAway ? 'text-secondary' : ''}`}>{row.points}pt</span>
                  <span className="text-muted-foreground text-xs w-8 text-right">{row.gd > 0 ? `+${row.gd}` : row.gd}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Odds */}
      {insights.betting_odds && (
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Odds</p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-primary/10 rounded-lg p-2">
              <p className="text-xs text-muted-foreground mb-1">{match.home_team.split(' ')[0]}</p>
              <p className="font-bold text-primary">{insights.betting_odds.home_win}</p>
            </div>
            <div className="bg-muted rounded-lg p-2">
              <p className="text-xs text-muted-foreground mb-1">Draw</p>
              <p className="font-bold">{insights.betting_odds.draw}</p>
            </div>
            <div className="bg-secondary/10 rounded-lg p-2">
              <p className="text-xs text-muted-foreground mb-1">{match.away_team.split(' ')[0]}</p>
              <p className="font-bold text-secondary">{insights.betting_odds.away_win}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stadium fact */}
      {insights.stadium_fact && (
        <div className="flex gap-2 items-start text-xs text-muted-foreground bg-muted/50 rounded-xl p-3">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <p>{insights.stadium_fact}</p>
        </div>
      )}
    </div>
  );
}

function FormCard({ team, form, keyPlayer }) {
  const results = (form || '').trim().split(/\s+/);
  return (
    <div className="bg-card rounded-xl border border-border p-3">
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-lg">{getFlag(team)}</span>
        <p className="text-xs font-semibold truncate">{team}</p>
      </div>
      {/* Form dots */}
      <div className="flex gap-1 mb-2">
        {results.map((r, i) => (
          <span key={i} className={`w-5 h-5 rounded-full text-[9px] font-bold flex items-center justify-center ${
            r === 'W' ? 'bg-primary text-primary-foreground' :
            r === 'L' ? 'bg-destructive/40 text-destructive-foreground' :
            'bg-muted text-muted-foreground'
          }`}>{r}</span>
        ))}
      </div>
      {keyPlayer && (
        <p className="text-[10px] text-muted-foreground">⭐ {keyPlayer}</p>
      )}
    </div>
  );
}