// Central source of truth for domain constants.
// Import from here instead of redefining inline in components.

export const STAGE_KEYS = ['group', 'r32', 'r16', 'qf', 'sf', 'third', 'final'];

export const KNOCKOUT_STAGE_KEYS = ['r32', 'r16', 'qf', 'sf', 'third', 'final'];

export const STAGE_MULTIPLIER = {
  group: 1, r32: 1.5, r16: 2, qf: 3, sf: 4, third: 4, final: 5,
};

export const STAGE_MULTIPLIER_LABEL = {
  group: '×1', r32: '×1.5', r16: '×2', qf: '×3', sf: '×4', third: '×4', final: '×5',
};

export const IDT_TIMEZONE = 'Asia/Jerusalem';

export const DEFAULT_WATCH_PARTY_ITEMS = [
  { name: 'Beer', emoji: '🍺' },
  { name: 'Soft drinks', emoji: '🥤' },
  { name: 'Pizza', emoji: '🍕' },
  { name: 'Chips & snacks', emoji: '🍟' },
  { name: 'Dip / hummus', emoji: '🧀' },
  { name: 'Napkins & plates', emoji: '🧻' },
  { name: 'TV / projector setup', emoji: '📺' },
];

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

export const CORNER_BUCKETS = ['0-5', '6-8', '9-11', '12+'];

export const RSVP_STATUS = {
  ATTENDING: 'attending',
  MAYBE: 'maybe',
  NOT_ATTENDING: 'not-attending',
};
