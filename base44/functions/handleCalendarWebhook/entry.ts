import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Google Calendar webhook handler — called when calendar events change.
 * When the attendee status on the Calendar event changes, sync back to RSVP entity.
 */
Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const base44 = createClientFromRequest(req);

    const state = body?.data?._provider_meta?.['x-goog-resource-state'];
    if (state === 'sync') return Response.json({ status: 'sync_ack' });

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googlecalendar');
    const authHeader = { Authorization: `Bearer ${accessToken}` };

    // Load sync token
    const existing = await base44.asServiceRole.entities.SyncState.list();
    const syncRecord = existing[0] || null;

    let url = 'https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=50';
    if (syncRecord?.sync_token) {
      url += `&syncToken=${syncRecord.sync_token}`;
    } else {
      url += '&timeMin=' + new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    }

    let res = await fetch(url, { headers: authHeader });
    if (res.status === 410) {
      url = 'https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=50'
        + '&timeMin=' + new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      res = await fetch(url, { headers: authHeader });
    }
    if (!res.ok) return Response.json({ status: 'api_error' });

    const allItems = [];
    let pageData = await res.json();
    let newSyncToken = null;
    while (true) {
      allItems.push(...(pageData.items || []));
      if (pageData.nextSyncToken) newSyncToken = pageData.nextSyncToken;
      if (!pageData.nextPageToken) break;
      const nextRes = await fetch(url + `&pageToken=${pageData.nextPageToken}`, { headers: authHeader });
      if (!nextRes.ok) break;
      pageData = await nextRes.json();
    }

    // For each changed event, look up CalendarSync mapping and update RSVP
    for (const event of allItems) {
      if (!event.id) continue;

      // Find our CalendarSync record for this Google event
      const syncs = await base44.asServiceRole.entities.CalendarSync.filter({ cal_event_id: event.id });
      if (!syncs.length) continue;

      const sync = syncs[0];

      // Determine the event owner's RSVP status from the event status
      // Google Calendar event status: confirmed, cancelled, tentative
      let newStatus = null;
      if (event.status === 'cancelled') {
        newStatus = 'not-attending';
      } else if (event.status === 'tentative') {
        newStatus = 'maybe';
      } else if (event.status === 'confirmed') {
        newStatus = 'attending';
      }

      if (!newStatus) continue;

      // Find and update the user's RSVP in our app
      const rsvps = await base44.asServiceRole.entities.RSVP.filter({
        user_id: sync.user_id,
        match_id: sync.match_id,
      });

      if (rsvps.length > 0 && rsvps[0].status !== newStatus) {
        await base44.asServiceRole.entities.RSVP.update(rsvps[0].id, { status: newStatus });

        // Create a notification for the user
        const match = await base44.asServiceRole.entities.Match.filter({ id: sync.match_id });
        const matchName = match[0] ? `${match[0].home_team} vs ${match[0].away_team}` : 'a match';
        await base44.asServiceRole.entities.Notification.create({
          user_id: sync.user_id,
          type: 'rsvp_change',
          match_id: sync.match_id,
          message: `Your RSVP for ${matchName} was updated to "${newStatus}" via Google Calendar.`,
          is_read: false,
        });
      }
    }

    // Save sync token
    if (newSyncToken) {
      if (syncRecord) {
        await base44.asServiceRole.entities.SyncState.update(syncRecord.id, { sync_token: newSyncToken });
      } else {
        await base44.asServiceRole.entities.SyncState.create({ sync_token: newSyncToken });
      }
    }

    return Response.json({ status: 'ok', processed: allItems.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});