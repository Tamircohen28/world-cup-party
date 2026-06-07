// Shared prediction utilities

export const STAGE_MULTIPLIER = {
  group: 1, r32: 1.5, r16: 2, qf: 3, sf: 4, third: 4, final: 5
};

export const STAGE_MULTIPLIER_LABEL = {
  group: '×1', r32: '×1.5', r16: '×2', qf: '×3', sf: '×4', third: '×4', final: '×5'
};

export const KNOCKOUT_STAGES = ['r32', 'r16', 'qf', 'sf', 'third', 'final'];

export function getPredictionState(match, myPrediction) {
  const now = new Date();
  const kick = new Date(match.kickoff_utc);

  if (match.status === 'finished') return 'revealed';
  if (match.status === 'live') return myPrediction ? 'locked' : 'missed';
  if (now >= kick) return myPrediction ? 'locked' : 'missed';
  // Open as soon as teams are known (not TBD); lock at kickoff
  if (match.home_team === 'TBD' || match.away_team === 'TBD') return 'too_early';
  return 'open';
}

export function getMaxPoints(stage) {
  return 5 * (STAGE_MULTIPLIER[stage] || 1);
}

export function deriveResult(home, away) {
  if (home > away) return 'home';
  if (away > home) return 'away';
  return 'draw';
}

export const BADGE_DESCRIPTIONS = {
  '🎯 Sniper': '3+ exact scores',
  '🔮 Oracle': '5+ exact scores',
  '🔥 On Fire': '4 correct results in a row',
  '⚡ Hot Streak': '6 correct results in a row',
  '🏆 Champion': '#1 after the Final',
  '🐣 First Blood': 'First exact score in the group',
  '💯 Perfect Week': 'Every game correct in a matchday',
  '🕐 Early Bird': 'Predicted within 1h of window opening (3×)',
  '😴 Last Minute': 'Predicted within 5min of kickoff (3×)',
};