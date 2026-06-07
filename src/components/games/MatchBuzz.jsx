import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, Zap, Newspaper } from 'lucide-react';
import { getFlag } from '@/lib/flags';

export default function MatchBuzz({ match }) {
  const isKnownTeams = match.home_team !== 'TBD' && match.away_team !== 'TBD';

  const { data: buzz, isLoading } = useQuery({
    queryKey: ['match-buzz', match.id],
    queryFn: () => base44.integrations.Core.InvokeLLM({
      prompt: `You are a hype man for a World Cup watch party app. For the upcoming FIFA World Cup 2026 match: ${match.home_team} vs ${match.away_team}.

Return a JSON object with:
- headline: a punchy, exciting 1-sentence hype headline for the match (max 12 words)
- storylines: array of exactly 3 objects, each with { emoji: string, title: string (3-5 words), detail: string (1-2 sentences of context/news) }. These should be the hottest talking points, recent news, injury updates, or hype facts heading into this match.
- fun_fact: one surprising or little-known fact about either team or a player in this match.

Use current knowledge and real news. Be punchy, energetic and fan-friendly.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          headline: { type: 'string' },
          storylines: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                emoji: { type: 'string' },
                title: { type: 'string' },
                detail: { type: 'string' },
              }
            }
          },
          fun_fact: { type: 'string' },
        }
      }
    }),
    enabled: !!match && isKnownTeams,
    staleTime: 1000 * 60 * 30, // cache 30 min
  });

  if (!isKnownTeams) return null;

  return (
    <div className="space-y-3">
      {isLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground text-sm py-3">
          <Loader2 className="w-4 h-4 animate-spin" />
          Fetching the latest buzz...
        </div>
      ) : buzz ? (
        <>
          {/* Headline */}
          {buzz.headline && (
            <div className="bg-gradient-to-r from-secondary/20 to-primary/10 rounded-xl border border-secondary/20 p-4">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-3.5 h-3.5 text-secondary" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-secondary">Match Hype</span>
              </div>
              <p className="font-bold text-sm leading-snug">{buzz.headline}</p>
            </div>
          )}

          {/* Storylines */}
          {buzz.storylines?.length > 0 && (
            <div className="space-y-2">
              {buzz.storylines.map((s, i) => (
                <div key={i} className="bg-card rounded-xl border border-border p-3 flex gap-3">
                  <span className="text-2xl shrink-0 leading-none mt-0.5">{s.emoji}</span>
                  <div>
                    <p className="text-xs font-bold mb-0.5">{s.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{s.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Fun fact */}
          {buzz.fun_fact && (
            <div className="flex gap-2 items-start text-xs text-muted-foreground bg-muted/50 rounded-xl p-3">
              <Newspaper className="w-3.5 h-3.5 shrink-0 mt-0.5 text-primary" />
              <p><span className="font-semibold text-foreground">Did you know? </span>{buzz.fun_fact}</p>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}