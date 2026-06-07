import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Runs every 15 min. Handles two notification types:
// 1. Prediction window just opened (match is now within 24h)
// 2. Last chance: 1h before kickoff, notify users who haven't predicted yet

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const now = new Date();

    const matches = await base44.asServiceRole.entities.Match.filter({ status: 'upcoming' });
    let sent = 0;

    // Get all UserStats to know who exists in the system
    const allStats = await base44.asServiceRole.entities.UserStats.list('-total_points', 200);
    const allUserIds = allStats.map(s => s.user_id);

    // Also get all RSVPs to know who is attending
    const allRsvps = await base44.asServiceRole.entities.RSVP.filter({ status: 'attending' });

    for (const match of matches) {
      const kick = new Date(match.kickoff_utc);
      const msToKick = kick - now;
      const hoursToKick = msToKick / (1000 * 60 * 60);

      if (hoursToKick < 0) continue;
      const label = match.home_team !== 'TBD' && match.away_team !== 'TBD'
        ? `${match.home_team} vs ${match.away_team}`
        : 'an upcoming match';

      // 1. Window just opened (between 24h and 24h+15min before kickoff)
      if (hoursToKick <= 24 && hoursToKick > 23.75) {
        // Check if we already sent this notification
        const existing = await base44.asServiceRole.entities.Notification.filter({
          match_id: match.id,
          type: 'reminder',
        });
        const alreadySentOpen = existing.some(n => n.message?.includes('Predict'));
        if (!alreadySentOpen) {
          for (const userId of allUserIds) {
            await base44.asServiceRole.entities.Notification.create({
              user_id: userId,
              type: 'reminder',
              match_id: match.id,
              message: `⚽ Predict ${label} — prediction window now open!`,
              is_read: false,
            });
            sent++;
          }
        }
      }

      // 2. Last chance: 1h to 1h15min before kickoff, for users who haven't predicted
      if (hoursToKick <= 1 && hoursToKick > 0.75) {
        const predictions = await base44.asServiceRole.entities.Prediction.filter({ match_id: match.id });
        const predictedUserIds = new Set(predictions.map(p => p.user_id));
        const attendingThisMatch = allRsvps.filter(r => r.match_id === match.id).map(r => r.user_id);
        const targets = attendingThisMatch.filter(uid => !predictedUserIds.has(uid));
        for (const userId of targets) {
          await base44.asServiceRole.entities.Notification.create({
            user_id: userId,
            type: 'reminder',
            match_id: match.id,
            message: `⏰ Last chance! Predict ${label} — kicks off in 1 hour`,
            is_read: false,
          });
          sent++;
        }
      }
    }

    return Response.json({ sent });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});