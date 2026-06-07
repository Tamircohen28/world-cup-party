// Country name to flag emoji mapping for World Cup 2026
const FLAGS = {
  "Mexico": "🇲🇽",
  "South Africa": "🇿🇦",
  "South Korea": "🇰🇷",
  "Czech Republic": "🇨🇿",
  "Canada": "🇨🇦",
  "Bosnia & Herzegovina": "🇧🇦",
  "Qatar": "🇶🇦",
  "Switzerland": "🇨🇭",
  "Brazil": "🇧🇷",
  "Morocco": "🇲🇦",
  "Haiti": "🇭🇹",
  "Scotland": "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  "USA": "🇺🇸",
  "Paraguay": "🇵🇾",
  "Australia": "🇦🇺",
  "Turkey": "🇹🇷",
  "Germany": "🇩🇪",
  "Curaçao": "🇨🇼",
  "Ivory Coast": "🇨🇮",
  "Ecuador": "🇪🇨",
  "Netherlands": "🇳🇱",
  "Japan": "🇯🇵",
  "Sweden": "🇸🇪",
  "Tunisia": "🇹🇳",
  "Belgium": "🇧🇪",
  "Egypt": "🇪🇬",
  "Iran": "🇮🇷",
  "New Zealand": "🇳🇿",
  "Spain": "🇪🇸",
  "Cape Verde": "🇨🇻",
  "Saudi Arabia": "🇸🇦",
  "Uruguay": "🇺🇾",
  "France": "🇫🇷",
  "Senegal": "🇸🇳",
  "Iraq": "🇮🇶",
  "Norway": "🇳🇴",
  "Argentina": "🇦🇷",
  "Algeria": "🇩🇿",
  "Austria": "🇦🇹",
  "Jordan": "🇯🇴",
  "England": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  "Cameroon": "🇨🇲",
  "Serbia": "🇷🇸",
  "Panama": "🇵🇦",
  "Portugal": "🇵🇹",
  "Peru": "🇵🇪",
  "Colombia": "🇨🇴",
  "Honduras": "🇭🇳",
  "TBD": "🏳️"
};

export function getFlag(teamName) {
  if (!teamName) return "🏳️";
  return FLAGS[teamName] || "🏳️";
}

export function getStageColor(stage) {
  const colors = {
    group: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    r32: "bg-teal-500/20 text-teal-400 border-teal-500/30",
    r16: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    qf: "bg-red-500/20 text-red-400 border-red-500/30",
    sf: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    third: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    final: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
  };
  return colors[stage] || colors.group;
}

export function getStageBorderColor(stage) {
  const colors = {
    group: "border-l-blue-500",
    r32: "border-l-teal-500",
    r16: "border-l-orange-500",
    qf: "border-l-red-500",
    sf: "border-l-purple-500",
    third: "border-l-amber-500",
    final: "border-l-yellow-400"
  };
  return colors[stage] || colors.group;
}

export function getStageName(stage) {
  const names = {
    group: "Group Stage",
    r32: "Round of 32",
    r16: "Round of 16",
    qf: "Quarter-Finals",
    sf: "Semi-Finals",
    third: "3rd Place",
    final: "Final"
  };
  return names[stage] || stage;
}

export function formatIDT(utcString) {
  const date = new Date(utcString);
  return date.toLocaleTimeString('en-IL', { 
    hour: '2-digit', 
    minute: '2-digit', 
    timeZone: 'Asia/Jerusalem',
    hour12: false 
  });
}

export function formatDateIDT(utcString) {
  const date = new Date(utcString);
  return date.toLocaleDateString('en-US', { 
    weekday: 'long',
    month: 'long', 
    day: 'numeric',
    timeZone: 'Asia/Jerusalem'
  });
}

export function formatShortDateIDT(utcString) {
  const date = new Date(utcString);
  return date.toLocaleDateString('en-US', { 
    weekday: 'short',
    month: 'short', 
    day: 'numeric',
    timeZone: 'Asia/Jerusalem'
  });
}

export const DEFAULT_ITEMS = [
  { name: "Beer", emoji: "🍺" },
  { name: "Soft drinks", emoji: "🥤" },
  { name: "Pizza", emoji: "🍕" },
  { name: "Chips & snacks", emoji: "🍟" },
  { name: "Dip / hummus", emoji: "🧀" },
  { name: "Napkins & plates", emoji: "🧻" },
  { name: "TV / projector setup", emoji: "📺" }
];