// All 104 World Cup 2026 matches pre-computed from openfootball data
// Times converted to UTC ISO strings

function parseTime(dateStr, timeStr) {
  // timeStr format: "HH:MM UTC-N" or "HH:MM UTC+N"
  const [time, utcOffset] = timeStr.split(' ');
  const [hours, minutes] = time.split(':').map(Number);
  const offsetMatch = utcOffset.match(/UTC([+-])(\d+)/);
  const sign = offsetMatch[1] === '+' ? -1 : 1;
  const offsetHours = parseInt(offsetMatch[2]);
  
  const utcHours = hours + (sign * offsetHours);
  const date = new Date(`${dateStr}T${String(utcHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00Z`);
  
  // Handle day overflow
  if (utcHours >= 24) {
    date.setUTCDate(date.getUTCDate());
  }
  
  return date.toISOString();
}

function getMatchday(round) {
  const num = parseInt(round.replace('Matchday ', ''));
  if (num >= 1 && num <= 7) return 1;
  if (num >= 8 && num <= 13) return 2;
  if (num >= 14 && num <= 16) return 3;
  return null;
}

export const ALL_MATCHES = [
  // Group A
  { match_number: 1, home_team: "Mexico", away_team: "South Africa", kickoff_utc: "2026-06-11T19:00:00Z", stage: "group", group_name: "A", matchday: 1, stadium: "Mexico City" },
  { match_number: 2, home_team: "South Korea", away_team: "Czech Republic", kickoff_utc: "2026-06-12T02:00:00Z", stage: "group", group_name: "A", matchday: 1, stadium: "Guadalajara" },
  { match_number: 3, home_team: "Czech Republic", away_team: "South Africa", kickoff_utc: "2026-06-18T16:00:00Z", stage: "group", group_name: "A", matchday: 2, stadium: "Atlanta" },
  { match_number: 4, home_team: "Mexico", away_team: "South Korea", kickoff_utc: "2026-06-19T01:00:00Z", stage: "group", group_name: "A", matchday: 2, stadium: "Guadalajara" },
  { match_number: 5, home_team: "Czech Republic", away_team: "Mexico", kickoff_utc: "2026-06-25T01:00:00Z", stage: "group", group_name: "A", matchday: 3, stadium: "Mexico City" },
  { match_number: 6, home_team: "South Africa", away_team: "South Korea", kickoff_utc: "2026-06-25T01:00:00Z", stage: "group", group_name: "A", matchday: 3, stadium: "Monterrey" },
  // Group B
  { match_number: 7, home_team: "Canada", away_team: "Bosnia & Herzegovina", kickoff_utc: "2026-06-12T19:00:00Z", stage: "group", group_name: "B", matchday: 1, stadium: "Toronto" },
  { match_number: 8, home_team: "Qatar", away_team: "Switzerland", kickoff_utc: "2026-06-13T19:00:00Z", stage: "group", group_name: "B", matchday: 1, stadium: "San Francisco" },
  { match_number: 9, home_team: "Switzerland", away_team: "Bosnia & Herzegovina", kickoff_utc: "2026-06-18T19:00:00Z", stage: "group", group_name: "B", matchday: 2, stadium: "Los Angeles" },
  { match_number: 10, home_team: "Canada", away_team: "Qatar", kickoff_utc: "2026-06-18T22:00:00Z", stage: "group", group_name: "B", matchday: 2, stadium: "Vancouver" },
  { match_number: 11, home_team: "Switzerland", away_team: "Canada", kickoff_utc: "2026-06-24T19:00:00Z", stage: "group", group_name: "B", matchday: 3, stadium: "Vancouver" },
  { match_number: 12, home_team: "Bosnia & Herzegovina", away_team: "Qatar", kickoff_utc: "2026-06-24T19:00:00Z", stage: "group", group_name: "B", matchday: 3, stadium: "Seattle" },
  // Group C
  { match_number: 13, home_team: "Brazil", away_team: "Morocco", kickoff_utc: "2026-06-13T22:00:00Z", stage: "group", group_name: "C", matchday: 1, stadium: "New Jersey" },
  { match_number: 14, home_team: "Haiti", away_team: "Scotland", kickoff_utc: "2026-06-14T01:00:00Z", stage: "group", group_name: "C", matchday: 1, stadium: "Boston" },
  { match_number: 15, home_team: "Scotland", away_team: "Morocco", kickoff_utc: "2026-06-19T22:00:00Z", stage: "group", group_name: "C", matchday: 2, stadium: "Boston" },
  { match_number: 16, home_team: "Brazil", away_team: "Haiti", kickoff_utc: "2026-06-20T00:30:00Z", stage: "group", group_name: "C", matchday: 2, stadium: "Philadelphia" },
  { match_number: 17, home_team: "Scotland", away_team: "Brazil", kickoff_utc: "2026-06-24T22:00:00Z", stage: "group", group_name: "C", matchday: 3, stadium: "Miami" },
  { match_number: 18, home_team: "Morocco", away_team: "Haiti", kickoff_utc: "2026-06-24T22:00:00Z", stage: "group", group_name: "C", matchday: 3, stadium: "Atlanta" },
  // Group D
  { match_number: 19, home_team: "USA", away_team: "Paraguay", kickoff_utc: "2026-06-13T01:00:00Z", stage: "group", group_name: "D", matchday: 1, stadium: "Los Angeles" },
  { match_number: 20, home_team: "Australia", away_team: "Turkey", kickoff_utc: "2026-06-14T04:00:00Z", stage: "group", group_name: "D", matchday: 1, stadium: "Vancouver" },
  { match_number: 21, home_team: "USA", away_team: "Australia", kickoff_utc: "2026-06-19T19:00:00Z", stage: "group", group_name: "D", matchday: 2, stadium: "Seattle" },
  { match_number: 22, home_team: "Turkey", away_team: "Paraguay", kickoff_utc: "2026-06-20T03:00:00Z", stage: "group", group_name: "D", matchday: 2, stadium: "San Francisco" },
  { match_number: 23, home_team: "Turkey", away_team: "USA", kickoff_utc: "2026-06-26T02:00:00Z", stage: "group", group_name: "D", matchday: 3, stadium: "Los Angeles" },
  { match_number: 24, home_team: "Paraguay", away_team: "Australia", kickoff_utc: "2026-06-26T02:00:00Z", stage: "group", group_name: "D", matchday: 3, stadium: "San Francisco" },
  // Group E
  { match_number: 25, home_team: "Germany", away_team: "Curaçao", kickoff_utc: "2026-06-14T17:00:00Z", stage: "group", group_name: "E", matchday: 1, stadium: "Houston" },
  { match_number: 26, home_team: "Ivory Coast", away_team: "Ecuador", kickoff_utc: "2026-06-14T23:00:00Z", stage: "group", group_name: "E", matchday: 1, stadium: "Philadelphia" },
  { match_number: 27, home_team: "Germany", away_team: "Ivory Coast", kickoff_utc: "2026-06-20T20:00:00Z", stage: "group", group_name: "E", matchday: 2, stadium: "Toronto" },
  { match_number: 28, home_team: "Ecuador", away_team: "Curaçao", kickoff_utc: "2026-06-21T00:00:00Z", stage: "group", group_name: "E", matchday: 2, stadium: "Kansas City" },
  { match_number: 29, home_team: "Curaçao", away_team: "Ivory Coast", kickoff_utc: "2026-06-25T20:00:00Z", stage: "group", group_name: "E", matchday: 3, stadium: "Philadelphia" },
  { match_number: 30, home_team: "Ecuador", away_team: "Germany", kickoff_utc: "2026-06-25T20:00:00Z", stage: "group", group_name: "E", matchday: 3, stadium: "New Jersey" },
  // Group F
  { match_number: 31, home_team: "Netherlands", away_team: "Japan", kickoff_utc: "2026-06-14T20:00:00Z", stage: "group", group_name: "F", matchday: 1, stadium: "Dallas" },
  { match_number: 32, home_team: "Sweden", away_team: "Tunisia", kickoff_utc: "2026-06-15T02:00:00Z", stage: "group", group_name: "F", matchday: 1, stadium: "Monterrey" },
  { match_number: 33, home_team: "Netherlands", away_team: "Sweden", kickoff_utc: "2026-06-20T17:00:00Z", stage: "group", group_name: "F", matchday: 2, stadium: "Houston" },
  { match_number: 34, home_team: "Tunisia", away_team: "Japan", kickoff_utc: "2026-06-21T04:00:00Z", stage: "group", group_name: "F", matchday: 2, stadium: "Monterrey" },
  { match_number: 35, home_team: "Japan", away_team: "Sweden", kickoff_utc: "2026-06-25T23:00:00Z", stage: "group", group_name: "F", matchday: 3, stadium: "Dallas" },
  { match_number: 36, home_team: "Tunisia", away_team: "Netherlands", kickoff_utc: "2026-06-25T23:00:00Z", stage: "group", group_name: "F", matchday: 3, stadium: "Kansas City" },
  // Group G
  { match_number: 37, home_team: "Belgium", away_team: "Egypt", kickoff_utc: "2026-06-15T19:00:00Z", stage: "group", group_name: "G", matchday: 1, stadium: "Seattle" },
  { match_number: 38, home_team: "Iran", away_team: "New Zealand", kickoff_utc: "2026-06-16T01:00:00Z", stage: "group", group_name: "G", matchday: 1, stadium: "Los Angeles" },
  { match_number: 39, home_team: "Belgium", away_team: "Iran", kickoff_utc: "2026-06-21T19:00:00Z", stage: "group", group_name: "G", matchday: 2, stadium: "Los Angeles" },
  { match_number: 40, home_team: "New Zealand", away_team: "Egypt", kickoff_utc: "2026-06-22T01:00:00Z", stage: "group", group_name: "G", matchday: 2, stadium: "Vancouver" },
  { match_number: 41, home_team: "Egypt", away_team: "Iran", kickoff_utc: "2026-06-27T03:00:00Z", stage: "group", group_name: "G", matchday: 3, stadium: "Seattle" },
  { match_number: 42, home_team: "New Zealand", away_team: "Belgium", kickoff_utc: "2026-06-27T03:00:00Z", stage: "group", group_name: "G", matchday: 3, stadium: "Vancouver" },
  // Group H
  { match_number: 43, home_team: "Spain", away_team: "Cape Verde", kickoff_utc: "2026-06-15T16:00:00Z", stage: "group", group_name: "H", matchday: 1, stadium: "Atlanta" },
  { match_number: 44, home_team: "Saudi Arabia", away_team: "Uruguay", kickoff_utc: "2026-06-15T22:00:00Z", stage: "group", group_name: "H", matchday: 1, stadium: "Miami" },
  { match_number: 45, home_team: "Spain", away_team: "Saudi Arabia", kickoff_utc: "2026-06-21T16:00:00Z", stage: "group", group_name: "H", matchday: 2, stadium: "Atlanta" },
  { match_number: 46, home_team: "Uruguay", away_team: "Cape Verde", kickoff_utc: "2026-06-21T22:00:00Z", stage: "group", group_name: "H", matchday: 2, stadium: "Miami" },
  { match_number: 47, home_team: "Cape Verde", away_team: "Saudi Arabia", kickoff_utc: "2026-06-27T00:00:00Z", stage: "group", group_name: "H", matchday: 3, stadium: "Houston" },
  { match_number: 48, home_team: "Uruguay", away_team: "Spain", kickoff_utc: "2026-06-27T00:00:00Z", stage: "group", group_name: "H", matchday: 3, stadium: "Guadalajara" },
  // Group I
  { match_number: 49, home_team: "France", away_team: "Senegal", kickoff_utc: "2026-06-16T19:00:00Z", stage: "group", group_name: "I", matchday: 1, stadium: "New Jersey" },
  { match_number: 50, home_team: "Iraq", away_team: "Norway", kickoff_utc: "2026-06-16T22:00:00Z", stage: "group", group_name: "I", matchday: 1, stadium: "Boston" },
  { match_number: 51, home_team: "France", away_team: "Iraq", kickoff_utc: "2026-06-22T21:00:00Z", stage: "group", group_name: "I", matchday: 2, stadium: "Philadelphia" },
  { match_number: 52, home_team: "Norway", away_team: "Senegal", kickoff_utc: "2026-06-23T00:00:00Z", stage: "group", group_name: "I", matchday: 2, stadium: "New Jersey" },
  { match_number: 53, home_team: "Norway", away_team: "France", kickoff_utc: "2026-06-26T19:00:00Z", stage: "group", group_name: "I", matchday: 3, stadium: "Boston" },
  { match_number: 54, home_team: "Senegal", away_team: "Iraq", kickoff_utc: "2026-06-26T19:00:00Z", stage: "group", group_name: "I", matchday: 3, stadium: "Toronto" },
  // Group J
  { match_number: 55, home_team: "Argentina", away_team: "Algeria", kickoff_utc: "2026-06-17T01:00:00Z", stage: "group", group_name: "J", matchday: 1, stadium: "Kansas City" },
  { match_number: 56, home_team: "Austria", away_team: "Jordan", kickoff_utc: "2026-06-17T04:00:00Z", stage: "group", group_name: "J", matchday: 1, stadium: "San Francisco" },
  { match_number: 57, home_team: "Argentina", away_team: "Austria", kickoff_utc: "2026-06-22T23:00:00Z", stage: "group", group_name: "J", matchday: 2, stadium: "Miami" },
  { match_number: 58, home_team: "Jordan", away_team: "Algeria", kickoff_utc: "2026-06-23T02:00:00Z", stage: "group", group_name: "J", matchday: 2, stadium: "Houston" },
  { match_number: 59, home_team: "Jordan", away_team: "Argentina", kickoff_utc: "2026-06-27T00:00:00Z", stage: "group", group_name: "J", matchday: 3, stadium: "Dallas" },
  { match_number: 60, home_team: "Algeria", away_team: "Austria", kickoff_utc: "2026-06-27T00:00:00Z", stage: "group", group_name: "J", matchday: 3, stadium: "Kansas City" },
  // Group K
  { match_number: 61, home_team: "England", away_team: "Cameroon", kickoff_utc: "2026-06-17T19:00:00Z", stage: "group", group_name: "K", matchday: 1, stadium: "New Jersey" },
  { match_number: 62, home_team: "Serbia", away_team: "Panama", kickoff_utc: "2026-06-17T22:00:00Z", stage: "group", group_name: "K", matchday: 1, stadium: "Philadelphia" },
  { match_number: 63, home_team: "England", away_team: "Serbia", kickoff_utc: "2026-06-23T19:00:00Z", stage: "group", group_name: "K", matchday: 2, stadium: "Boston" },
  { match_number: 64, home_team: "Panama", away_team: "Cameroon", kickoff_utc: "2026-06-23T22:00:00Z", stage: "group", group_name: "K", matchday: 2, stadium: "Atlanta" },
  { match_number: 65, home_team: "Cameroon", away_team: "Serbia", kickoff_utc: "2026-06-27T22:00:00Z", stage: "group", group_name: "K", matchday: 3, stadium: "New Jersey" },
  { match_number: 66, home_team: "Panama", away_team: "England", kickoff_utc: "2026-06-27T22:00:00Z", stage: "group", group_name: "K", matchday: 3, stadium: "Miami" },
  // Group L
  { match_number: 67, home_team: "Portugal", away_team: "Peru", kickoff_utc: "2026-06-18T01:00:00Z", stage: "group", group_name: "L", matchday: 1, stadium: "Dallas" },
  { match_number: 68, home_team: "Colombia", away_team: "Honduras", kickoff_utc: "2026-06-18T01:00:00Z", stage: "group", group_name: "L", matchday: 1, stadium: "Atlanta" },
  { match_number: 69, home_team: "Portugal", away_team: "Colombia", kickoff_utc: "2026-06-24T01:00:00Z", stage: "group", group_name: "L", matchday: 2, stadium: "Dallas" },
  { match_number: 70, home_team: "Honduras", away_team: "Peru", kickoff_utc: "2026-06-24T01:00:00Z", stage: "group", group_name: "L", matchday: 2, stadium: "Houston" },
  { match_number: 71, home_team: "Peru", away_team: "Colombia", kickoff_utc: "2026-06-28T01:00:00Z", stage: "group", group_name: "L", matchday: 3, stadium: "San Francisco" },
  { match_number: 72, home_team: "Honduras", away_team: "Portugal", kickoff_utc: "2026-06-28T01:00:00Z", stage: "group", group_name: "L", matchday: 3, stadium: "Kansas City" },
  // Round of 32 (placeholder teams)
  { match_number: 73, home_team: "TBD", away_team: "TBD", kickoff_utc: "2026-06-29T19:00:00Z", stage: "r32", group_name: null, matchday: null, stadium: "TBD" },
  { match_number: 74, home_team: "TBD", away_team: "TBD", kickoff_utc: "2026-06-29T22:00:00Z", stage: "r32", group_name: null, matchday: null, stadium: "TBD" },
  { match_number: 75, home_team: "TBD", away_team: "TBD", kickoff_utc: "2026-06-30T01:00:00Z", stage: "r32", group_name: null, matchday: null, stadium: "TBD" },
  { match_number: 76, home_team: "TBD", away_team: "TBD", kickoff_utc: "2026-06-30T19:00:00Z", stage: "r32", group_name: null, matchday: null, stadium: "TBD" },
  { match_number: 77, home_team: "TBD", away_team: "TBD", kickoff_utc: "2026-06-30T22:00:00Z", stage: "r32", group_name: null, matchday: null, stadium: "TBD" },
  { match_number: 78, home_team: "TBD", away_team: "TBD", kickoff_utc: "2026-07-01T01:00:00Z", stage: "r32", group_name: null, matchday: null, stadium: "TBD" },
  { match_number: 79, home_team: "TBD", away_team: "TBD", kickoff_utc: "2026-07-01T19:00:00Z", stage: "r32", group_name: null, matchday: null, stadium: "TBD" },
  { match_number: 80, home_team: "TBD", away_team: "TBD", kickoff_utc: "2026-07-01T22:00:00Z", stage: "r32", group_name: null, matchday: null, stadium: "TBD" },
  { match_number: 81, home_team: "TBD", away_team: "TBD", kickoff_utc: "2026-07-02T01:00:00Z", stage: "r32", group_name: null, matchday: null, stadium: "TBD" },
  { match_number: 82, home_team: "TBD", away_team: "TBD", kickoff_utc: "2026-07-02T19:00:00Z", stage: "r32", group_name: null, matchday: null, stadium: "TBD" },
  { match_number: 83, home_team: "TBD", away_team: "TBD", kickoff_utc: "2026-07-02T22:00:00Z", stage: "r32", group_name: null, matchday: null, stadium: "TBD" },
  { match_number: 84, home_team: "TBD", away_team: "TBD", kickoff_utc: "2026-07-03T01:00:00Z", stage: "r32", group_name: null, matchday: null, stadium: "TBD" },
  { match_number: 85, home_team: "TBD", away_team: "TBD", kickoff_utc: "2026-07-03T19:00:00Z", stage: "r32", group_name: null, matchday: null, stadium: "TBD" },
  { match_number: 86, home_team: "TBD", away_team: "TBD", kickoff_utc: "2026-07-03T22:00:00Z", stage: "r32", group_name: null, matchday: null, stadium: "TBD" },
  { match_number: 87, home_team: "TBD", away_team: "TBD", kickoff_utc: "2026-07-04T01:00:00Z", stage: "r32", group_name: null, matchday: null, stadium: "TBD" },
  { match_number: 88, home_team: "TBD", away_team: "TBD", kickoff_utc: "2026-07-04T22:00:00Z", stage: "r32", group_name: null, matchday: null, stadium: "TBD" },
  // Round of 16
  { match_number: 89, home_team: "TBD", away_team: "TBD", kickoff_utc: "2026-07-05T19:00:00Z", stage: "r16", group_name: null, matchday: null, stadium: "TBD" },
  { match_number: 90, home_team: "TBD", away_team: "TBD", kickoff_utc: "2026-07-05T22:00:00Z", stage: "r16", group_name: null, matchday: null, stadium: "TBD" },
  { match_number: 91, home_team: "TBD", away_team: "TBD", kickoff_utc: "2026-07-06T01:00:00Z", stage: "r16", group_name: null, matchday: null, stadium: "TBD" },
  { match_number: 92, home_team: "TBD", away_team: "TBD", kickoff_utc: "2026-07-06T19:00:00Z", stage: "r16", group_name: null, matchday: null, stadium: "TBD" },
  { match_number: 93, home_team: "TBD", away_team: "TBD", kickoff_utc: "2026-07-06T22:00:00Z", stage: "r16", group_name: null, matchday: null, stadium: "TBD" },
  { match_number: 94, home_team: "TBD", away_team: "TBD", kickoff_utc: "2026-07-07T01:00:00Z", stage: "r16", group_name: null, matchday: null, stadium: "TBD" },
  { match_number: 95, home_team: "TBD", away_team: "TBD", kickoff_utc: "2026-07-07T19:00:00Z", stage: "r16", group_name: null, matchday: null, stadium: "TBD" },
  { match_number: 96, home_team: "TBD", away_team: "TBD", kickoff_utc: "2026-07-07T22:00:00Z", stage: "r16", group_name: null, matchday: null, stadium: "TBD" },
  // Quarter-Finals
  { match_number: 97, home_team: "TBD", away_team: "TBD", kickoff_utc: "2026-07-10T19:00:00Z", stage: "qf", group_name: null, matchday: null, stadium: "TBD" },
  { match_number: 98, home_team: "TBD", away_team: "TBD", kickoff_utc: "2026-07-10T22:00:00Z", stage: "qf", group_name: null, matchday: null, stadium: "TBD" },
  { match_number: 99, home_team: "TBD", away_team: "TBD", kickoff_utc: "2026-07-11T19:00:00Z", stage: "qf", group_name: null, matchday: null, stadium: "TBD" },
  { match_number: 100, home_team: "TBD", away_team: "TBD", kickoff_utc: "2026-07-11T22:00:00Z", stage: "qf", group_name: null, matchday: null, stadium: "TBD" },
  // Semi-Finals
  { match_number: 101, home_team: "TBD", away_team: "TBD", kickoff_utc: "2026-07-15T01:00:00Z", stage: "sf", group_name: null, matchday: null, stadium: "TBD" },
  { match_number: 102, home_team: "TBD", away_team: "TBD", kickoff_utc: "2026-07-16T01:00:00Z", stage: "sf", group_name: null, matchday: null, stadium: "TBD" },
  // 3rd Place
  { match_number: 103, home_team: "TBD", away_team: "TBD", kickoff_utc: "2026-07-18T22:00:00Z", stage: "third", group_name: null, matchday: null, stadium: "TBD" },
  // Final
  { match_number: 104, home_team: "TBD", away_team: "TBD", kickoff_utc: "2026-07-19T22:00:00Z", stage: "final", group_name: null, matchday: null, stadium: "New Jersey" }
];