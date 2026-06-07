import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Called by a scheduled automation every 15 minutes.
// 1) Sends a 2h pre-match reminder to all attending RSVPs.
// 2) Sends a 24h prediction reminder to ALL users (once per match).

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const now = new Date();
    let totalSent = 0;

    const allMatches = await base44.asServiceRole.entities.Match.filter({ status: 'upcoming' });

    // ── 1. 2h pre-match reminder to attending RSVPs ───────────────────────
    const twoHourStart = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const twoHourEnd   = new Date(now.getTime() + 2 * 60 * 60 * 1000 + 15 * 60 * 1000);

    const soonMatches = allMatches.filter(m => {
      const kick = new Date(m.kickoff_utc);
      return kick >= twoHourStart && kick <= twoHourEnd;
    });

    for (const match of soonMatches) {
      const existing = await base44.asServiceRole.entities.Notification.filter({ match_id: match.id, type: 'reminder' });
      if (existing.length > 0) continue;

      const rsvps = await base44.asServiceRole.entities.RSVP.filter({ match_id: match.id, status: 'attending' });
      const kickoffHour = new Date(match.kickoff_utc).toLocaleTimeString('he-IL', {
        timeZone: 'Asia/Jerusalem', hour: '2-digit', minute: '2-digit',
      });
      const label = match.home_team !== 'TBD' && match.away_team !== 'TBD'
        ? `${match.home_team} vs ${match.away_team}` : 'an upcoming match';

      for (const rsvp of rsvps) {
        await base44.asServiceRole.entities.Notification.create({
          user_id: rsvp.user_id, type: 'reminder', match_id: match.id, actor_name: null,
          message: `⏰ ${label} kicks off at ${kickoffHour} IDT — see you there!`,
          is_read: false,
        });
        totalSent++;
      }
    }

    // ── 2. 24h prediction reminder to ALL users ───────────────────────────
    const h24Start = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const h24End   = new Date(now.getTime() + 24 * 60 * 60 * 1000 + 15 * 60 * 1000);

    const h24Matches = allMatches.filter(m => {
      const kick = new Date(m.kickoff_utc);
      return kick >= h24Start && kick <= h24End
        && m.home_team !== 'TBD' && m.away_team !== 'TBD';
    });

    for (const match of h24Matches) {
      // Deduplicate with a distinct type flag stored as message prefix
      const existing = await base44.asServiceRole.entities.Notification.filter({ match_id: match.id, type: 'reminder' });
      const alreadyPredictionReminder = existing.some(n => n.message?.startsWith('🎯'));
      if (alreadyPredictionReminder) continue;

      const allUsers = await base44.asServiceRole.entities.User.list();
      const kickoffHour = new Date(match.kickoff_utc).toLocaleTimeString('he-IL', {
        timeZone: 'Asia/Jerusalem', hour: '2-digit', minute: '2-digit',
      });

      for (const u of allUsers) {
        // Skip users who already predicted
        const pred = await base44.asServiceRole.entities.Prediction.filter({ match_id: match.id, user_id: u.id });
        if (pred.length > 0) continue;

        await base44.asServiceRole.entities.Notification.create({
          user_id: u.id, type: 'reminder', match_id: match.id, actor_name: null,
          message: `🎯 Submit your prediction for ${match.home_team} vs ${match.away_team} — kicks off in 24h at ${kickoffHour} IDT!`,
          is_read: false,
        });
        totalSent++;
      }
    }

    return Response.json({ sent: totalSent });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});