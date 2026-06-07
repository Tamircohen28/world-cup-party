import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Returns an .ics file containing all World Cup 2026 matches.
// No auth required — anyone with the link can download it.

const STAGE_LABELS = {
  group: 'Group Stage',
  r32: 'Round of 32',
  r16: 'Round of 16',
  qf: 'Quarter-final',
  sf: 'Semi-final',
  third: 'Third Place',
  final: 'FINAL',
};

function toIcsDate(isoString) {
  // 20260611T190000Z
  return isoString.replace(/[-:]/g, '').replace('.000', '');
}

function escapeIcs(str) {
  return (str || '').replace(/[\\;,]/g, c => '\\' + c).replace(/\n/g, '\\n');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const matches = await base44.asServiceRole.entities.Match.list('kickoff_utc', 200);

    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//World Cup 2026 Watch Party//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:World Cup 2026',
      'X-WR-TIMEZONE:Asia/Jerusalem',
    ];

    for (const m of matches) {
      const start = toIcsDate(m.kickoff_utc);
      // 105 minutes after kickoff as estimated end
      const endMs = new Date(m.kickoff_utc).getTime() + 105 * 60 * 1000;
      const end = toIcsDate(new Date(endMs).toISOString());

      const stageLabel = STAGE_LABELS[m.stage] || m.stage;
      const groupPart = m.group_name ? ` · Group ${m.group_name}` : '';
      const summary = m.home_team !== 'TBD' && m.away_team !== 'TBD'
        ? `⚽ ${m.home_team} vs ${m.away_team}`
        : `⚽ ${stageLabel}${groupPart}`;

      const desc = [
        stageLabel + groupPart,
        m.stadium ? `📍 ${m.stadium}` : '',
        `Match #${m.match_number || ''}`,
      ].filter(Boolean).join('\\n');

      lines.push('BEGIN:VEVENT');
      lines.push(`UID:wc2026-match-${m.id}@watchparty`);
      lines.push(`DTSTART:${start}`);
      lines.push(`DTEND:${end}`);
      lines.push(`SUMMARY:${escapeIcs(summary)}`);
      lines.push(`DESCRIPTION:${escapeIcs(desc)}`);
      if (m.stadium) lines.push(`LOCATION:${escapeIcs(m.stadium)}`);
      lines.push('END:VEVENT');
    }

    lines.push('END:VCALENDAR');

    const icsContent = lines.join('\r\n');

    return new Response(icsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="WorldCup2026.ics"',
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});