import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getFlag, getStageName } from '@/lib/flags';
import { getPredictionState, getMaxPoints, deriveResult, STAGE_MULTIPLIER_LABEL, KNOCKOUT_STAGES } from '@/lib/predictions';
import { toast } from 'sonner';
import { Lock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PredictionReveal from './PredictionReveal';
import CountdownClock from './CountdownClock';
import LivePredictionsWidget from './LivePredictionsWidget';
import BonusPredictionsPanel, { BONUS_MAX_POINTS } from './BonusPredictionsPanel';

export default function PredictionTab({ match, user }) {
  const queryClient = useQueryClient();
  const [homeGoals, setHomeGoals] = useState(1);
  const [awayGoals, setAwayGoals] = useState(1);
  const [predictedWinner, setPredictedWinner] = useState('');
  const [bonusCorners, setBonusCorners] = useState(null);
  const [bonusYellows, setBonusYellows] = useState(null);
  const [bonusRedCard, setBonusRedCard] = useState(null);

  const isKnockout = KNOCKOUT_STAGES.includes(match.stage);
  const maxPoints = getMaxPoints(match.stage);
  const multiplierLabel = STAGE_MULTIPLIER_LABEL[match.stage] || '×1';

  const { data: myPrediction } = useQuery({
    queryKey: ['prediction', match.id, user?.id],
    queryFn: async () => {
      if (!user) return null;
      const preds = await base44.entities.Prediction.filter({ match_id: match.id, user_id: user.id });
      return preds[0] || null;
    },
    enabled: !!user && !!match,
  });

  // Sync form with existing prediction
  useEffect(() => {
    if (myPrediction) {
      setHomeGoals(myPrediction.home_score ?? 1);
      setAwayGoals(myPrediction.away_score ?? 1);
      setPredictedWinner(myPrediction.predicted_winner || '');
      setBonusCorners(myPrediction.bonus_corners_bucket ?? null);
      setBonusYellows(myPrediction.bonus_yellow_cards ?? null);
      setBonusRedCard(myPrediction.bonus_red_card ?? null);
    }
  }, [myPrediction]);

  const state = getPredictionState(match, myPrediction);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const derived = deriveResult(homeGoals, awayGoals);
      const data = {
        match_id: match.id,
        user_id: user.id,
        user_display_name: user.full_name,
        home_score: homeGoals,
        away_score: awayGoals,
        predicted_result: derived,
        predicted_winner: isKnockout ? (predictedWinner || (derived === 'draw' ? '' : derived === 'home' ? match.home_team : match.away_team)) : null,
        submitted_at: new Date().toISOString(),
        edit_count: (myPrediction?.edit_count || 0) + (myPrediction ? 1 : 0),
        bonus_corners_bucket: bonusCorners || null,
        bonus_yellow_cards: bonusYellows !== null && bonusYellows !== undefined ? bonusYellows : null,
        bonus_red_card: bonusRedCard !== null && bonusRedCard !== undefined ? bonusRedCard : null,
      };
      if (myPrediction) {
        await base44.entities.Prediction.update(myPrediction.id, data);
      } else {
        await base44.entities.Prediction.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prediction', match.id, user?.id] });
      toast.success(myPrediction ? '✏️ Prediction updated!' : '🔒 Prediction locked in!');
    },
  });

  const Stepper = ({ value, onChange, label }) => (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
      <div className="flex items-center gap-4">
        <button
          onClick={() => onChange(Math.max(0, value - 1))}
          className="w-10 h-10 rounded-full bg-muted hover:bg-muted/70 text-xl font-bold flex items-center justify-center transition-all active:scale-95"
        >−</button>
        <span className="text-4xl font-bold font-mono w-12 text-center tabular-nums">{value}</span>
        <button
          onClick={() => onChange(Math.min(15, value + 1))}
          className="w-10 h-10 rounded-full bg-primary/20 hover:bg-primary/30 text-primary text-xl font-bold flex items-center justify-center transition-all active:scale-95"
        >+</button>
      </div>
    </div>
  );

  // --- States ---

  if (state === 'revealed') {
    return <PredictionReveal match={match} user={user} myPrediction={myPrediction} />;
  }

  if (state === 'too_early') {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="text-4xl">⏳</div>
        <div>
          <p className="font-semibold text-lg">Teams not confirmed yet</p>
          <p className="text-sm text-muted-foreground mt-1">Predictions open as soon as both teams are known</p>
        </div>
      </div>
    );
  }

  if (state === 'missed') {
    return (
      <div className="text-center py-8 space-y-3">
        <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto" />
        <p className="font-semibold">You missed this one</p>
        <p className="text-sm text-muted-foreground">The prediction window closed at kickoff</p>
      </div>
    );
  }

  if (state === 'locked') {
    return (
      <div className="space-y-4">
        <div className="bg-card rounded-2xl border border-border p-5 text-center space-y-2">
          <Lock className="w-5 h-5 text-primary mx-auto" />
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Your locked prediction</p>
          <div className="flex items-center justify-center gap-4 py-2">
            <div className="text-center">
              <div className="text-2xl">{getFlag(match.home_team)}</div>
              <div className="text-3xl font-bold font-mono">{myPrediction.home_score}</div>
            </div>
            <span className="text-muted-foreground font-bold">–</span>
            <div className="text-center">
              <div className="text-3xl font-bold font-mono">{myPrediction.away_score}</div>
              <div className="text-2xl">{getFlag(match.away_team)}</div>
            </div>
          </div>
          {isKnockout && myPrediction.predicted_winner && (
            <p className="text-xs text-muted-foreground">Advances: {getFlag(myPrediction.predicted_winner)} {myPrediction.predicted_winner}</p>
          )}
          <p className="text-xs text-muted-foreground">{match.status === 'live' ? 'Game is live! See predictions below.' : 'Predictions reveal when the game ends'}</p>
        </div>
        {match.status === 'live' && (
          <LivePredictionsWidget match={match} currentUserId={user?.id} />
        )}
      </div>
    );
  }

  // state === 'open'
  const derived = deriveResult(homeGoals, awayGoals);
  const resultLabel = derived === 'home' ? `${match.home_team} wins` : derived === 'away' ? `${match.away_team} wins` : 'Draw';

  return (
    <div className="space-y-5">
      {/* Score steppers */}
      <div className="bg-card rounded-2xl border border-border p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center mb-5">Your Prediction</p>
        <div className="flex items-center justify-around">
          <Stepper value={homeGoals} onChange={setHomeGoals} label={`${getFlag(match.home_team)} ${match.home_team}`} />
          <span className="text-2xl font-bold text-muted-foreground pt-6">–</span>
          <Stepper value={awayGoals} onChange={setAwayGoals} label={`${match.away_team} ${getFlag(match.away_team)}`} />
        </div>
      </div>

      {/* Knockout: who advances picker */}
      {isKnockout && (
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Who advances?</p>
          <div className="grid grid-cols-2 gap-2">
            {[match.home_team, match.away_team].map(team => (
              <button
                key={team}
                onClick={() => setPredictedWinner(team)}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                  predictedWinner === team
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-muted border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {getFlag(team)} {team}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 text-center">Includes extra time & penalties</p>
        </div>
      )}

      {/* Bonus predictions */}
      <BonusPredictionsPanel
        corners={bonusCorners}
        setCorners={setBonusCorners}
        yellows={bonusYellows}
        setYellows={setBonusYellows}
        redCard={bonusRedCard}
        setRedCard={setBonusRedCard}
      />

      {/* Preview */}
      <div className="bg-primary/5 rounded-xl border border-primary/10 p-4 text-center space-y-1">
        <p className="text-sm font-bold">
          {getFlag(match.home_team)} {homeGoals} – {awayGoals} {getFlag(match.away_team)}
        </p>
        <p className="text-xs text-muted-foreground">{resultLabel}</p>
        <p className="text-xs text-primary font-semibold">
          Up to {maxPoints} pts score · +{BONUS_MAX_POINTS} bonus · {getStageName(match.stage)} {multiplierLabel}
        </p>
      </div>

      {/* Lock in button */}
      <Button
        onClick={() => saveMutation.mutate()}
        disabled={saveMutation.isPending || (isKnockout && !predictedWinner)}
        className="w-full bg-primary text-primary-foreground font-bold py-3 text-base rounded-xl"
        size="lg"
      >
        {saveMutation.isPending ? 'Saving...' : myPrediction ? '✏️ Update Prediction' : '🔒 Lock in Prediction'}
      </Button>

      {/* Window closes countdown */}
      <CountdownClock targetTime={new Date(match.kickoff_utc)} label="Window closes in" small />
      {myPrediction && (
        <p className="text-xs text-center text-muted-foreground">
          You can edit until kickoff · edited {myPrediction.edit_count || 0} time{myPrediction.edit_count !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}