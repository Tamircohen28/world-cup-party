import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Users, Home as HomeIcon } from 'lucide-react';
import { getFlag, getStageColor, getStageBorderColor, getStageName, formatIDT } from '@/lib/flags';
import { Badge } from '@/components/ui/badge';

export default function MatchCard({ match, rsvp, watchParty }) {
  const isPast = new Date(match.kickoff_utc) < new Date();
  const isLive = match.status === 'live';
  
  return (
    <Link to={`/game/${match.id}`} className="block">
      <div className={`relative bg-card rounded-xl border border-border overflow-hidden transition-all hover:border-primary/30 active:scale-[0.98] ${isPast && !isLive ? 'opacity-60' : ''}`}>
        {/* Stage color left border */}
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${getStageBorderColor(match.stage).replace('border-l-', 'bg-')}`} />
        
        <div className="p-4 pl-5">
          {/* Top row: stage + time */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`text-[10px] px-2 py-0.5 font-semibold ${getStageColor(match.stage)}`}>
                {match.group_name ? `Group ${match.group_name}` : getStageName(match.stage)}
                {match.matchday ? ` · MD${match.matchday}` : ''}
              </Badge>
              {isLive && (
                <span className="flex items-center gap-1 text-red-400 text-xs font-bold">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  LIVE
                </span>
              )}
            </div>
            <span className="text-sm font-mono font-semibold text-primary">
              {formatIDT(match.kickoff_utc)}
            </span>
          </div>
          
          {/* Teams */}
          <div className="flex items-center justify-between">
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-lg">{getFlag(match.home_team)}</span>
                <span className={`font-semibold text-sm ${match.home_team === 'TBD' ? 'text-muted-foreground italic' : ''}`}>
                  {match.home_team}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">{getFlag(match.away_team)}</span>
                <span className={`font-semibold text-sm ${match.away_team === 'TBD' ? 'text-muted-foreground italic' : ''}`}>
                  {match.away_team}
                </span>
              </div>
            </div>
            
            {/* Score or RSVP status */}
            <div className="flex flex-col items-end gap-1">
              {match.status === 'finished' || isLive ? (
                <div className="text-2xl font-bold font-mono">
                  <span>{match.home_score ?? '-'}</span>
                  <span className="text-muted-foreground mx-1">:</span>
                  <span>{match.away_score ?? '-'}</span>
                </div>
              ) : rsvp ? (
                <Badge className={`text-xs ${
                  rsvp.status === 'attending' ? 'bg-primary/20 text-primary border-primary/30' :
                  rsvp.status === 'maybe' ? 'bg-secondary/20 text-secondary border-secondary/30' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {rsvp.status === 'attending' ? '✓ Going' : rsvp.status === 'maybe' ? '? Maybe' : '✗ Skip'}
                </Badge>
              ) : null}
            </div>
          </div>
          
          {/* Bottom row: venue + party info */}
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50">
            <div className="flex items-center gap-1 text-xs text-muted-foreground truncate">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{match.stadium}</span>
            </div>
            {watchParty && (
              <div className="flex items-center gap-2 text-xs">
                {watchParty.attending_count > 0 && (
                  <span className="flex items-center gap-1 text-primary">
                    <Users className="w-3 h-3" />
                    {watchParty.attending_count}
                  </span>
                )}
                {watchParty.host_display_name && (
                  <span className="flex items-center gap-1 text-secondary">
                    <HomeIcon className="w-3 h-3" />
                    {watchParty.host_display_name.split(' ')[0]}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}