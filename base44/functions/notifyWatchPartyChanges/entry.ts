import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Called by entity automation on WatchParty create/update events.
// Notifies all attending RSVPs when a party is created or when host notes/location change.

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const { event, data, old_data, changed_fields } = body;
    const watchParty = data;

    if (!watchParty || !watchParty.match_id) {
      return Response.json({ skipped: true, reason: 'No watch party data' });
    }

    // For updates: only notify if host_user_id, host_notes, or host_location changed
    if (event?.type === 'update') {
      const relevantFields = ['host_user_id', 'host_notes', 'host_location', 'host_display_name'];
      const hasRelevantChange = relevantFields.some(f => (changed_fields || []).includes(f));
      if (!hasRelevantChange) {
        return Response.json({ skipped: true, reason: 'No relevant fields changed' });
      }
    }

    // Get all attending RSVPs for this match
    const rsvps = await base44.asServiceRole.entities.RSVP.filter({
      match_id: watchParty.match_id,
      status: 'attending',
    });

    if (rsvps.length === 0) {
      return Response.json({ sent: 0, reason: 'No attending RSVPs' });
    }

    // Fetch match details for the label
    const matches = await base44.asServiceRole.entities.Match.list('kickoff_utc', 200);
    const match = matches.find(m => m.id === watchParty.match_id);
    const label = match && match.home_team !== 'TBD' && match.away_team !== 'TBD'
      ? `${match.home_team} vs ${match.away_team}`
      : 'your upcoming match';

    let message;
    if (event?.type === 'create') {
      const hostName = watchParty.host_display_name || 'Someone';
      message = `🏠 ${hostName} is hosting the ${label} watch party!`;
    } else {
      // update — figure out what changed
      const hostChanged = (changed_fields || []).includes('host_user_id') || (changed_fields || []).includes('host_display_name');
      if (hostChanged && watchParty.host_user_id) {
        const hostName = watchParty.host_display_name || 'Someone';
        message = `🏠 ${hostName} just volunteered to host ${label}!`;
      } else if (hostChanged && !watchParty.host_user_id) {
        message = `⚠️ The host for ${label} stepped down — who's volunteering?`;
      } else {
        const hostName = watchParty.host_display_name || 'The host';
        message = `📝 ${hostName} updated the party details for ${label}.`;
      }
    }

    let sent = 0;
    for (const rsvp of rsvps) {
      // Don't notify the host themselves
      if (rsvp.user_id === watchParty.host_user_id) continue;
      await base44.asServiceRole.entities.Notification.create({
        user_id: rsvp.user_id,
        type: event?.type === 'create' ? 'host_assigned' : 'host_left',
        match_id: watchParty.match_id,
        actor_name: watchParty.host_display_name || null,
        message,
        is_read: false,
      });
      sent++;
    }

    return Response.json({ sent, event: event?.type });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});