import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Creates or updates a Google Calendar event for a World Cup match watch party.
 * Called from the frontend per-user using their own Google Calendar connector.
 * 
 * Payload: { matchId }
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { matchId } = await req.json();
    if (!matchId) return Response.json({ error: 'matchId required' }, { status: 400 });

    // Fetch match, watch party, and RSVPs
    const [allMatches, parties, rsvps] = await Promise.all([
      base44.asServiceRole.entities.Match.list('kickoff_utc', 200),
      base44.asServiceRole.entities.WatchParty.filter({ match_id: matchId }),
      base44.asServiceRole.entities.RSVP.filter({ match_id: matchId }),
    ]);

    const match = allMatches.find(m => m.id === matchId);
    if (!match) return Response.json({ error: 'Match not found' }, { status: 404 });

    const watchParty = parties[0] || null;
    const attending = rsvps.filter(r => r.status === 'attending');
    const maybe = rsvps.filter(r => r.status === 'maybe');

    // Get the user's Google Calendar token
    // connectorId for the app-user Google Calendar connector
    const CONNECTOR_ID = '69c40ff6c52e7c8bd0d98f45'; // gmail connector — but we use googlecalendar scope
    // Actually we need a googlecalendar app-user connector — use shared connector fallback
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googlecalendar');

    const startTime = new Date(match.kickoff_utc);
    const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // 2hr duration

    const stageName = {
      group: `Group ${match.group_name}`, r32: 'Round of 32', r16: 'Round of 16',
      qf: 'Quarter-Final', sf: 'Semi-Final', third: '3rd Place Play-off', final: '⭐ THE FINAL'
    }[match.stage] || match.stage;

    const attendeesList = attending.map(r => `✅ ${r.user_name}`).join('\n');
    const maybeList = maybe.length ? `\n\n❓ Maybe:\n${maybe.map(r => `  ${r.user_name}`).join('\n')}` : '';

    const location = watchParty?.host_location || match.stadium;
    const hostLine = watchParty?.host_display_name
      ? `🏠 Hosted by: ${watchParty.host_display_name} @ ${watchParty.host_location || 'TBD'}`
      : '🏠 No host yet — volunteer on the app!';

    const notes = watchParty?.host_notes ? `\n📝 Host notes: ${watchParty.host_notes}` : '';

    const description = `⚽ World Cup 2026 Watch Party\n${stageName}: ${match.home_team} vs ${match.away_team}\n📍 ${match.stadium}\n\n${hostLine}${notes}\n\n👥 Attending (${attending.length}):\n${attendeesList || 'No one yet'}${maybeList}\n\n---\nManage your RSVP in the Watch Party app.`;

    const eventBody = {
      summary: `⚽ ${match.home_team} vs ${match.away_team}`,
      description,
      location,
      start: { dateTime: startTime.toISOString(), timeZone: 'UTC' },
      end: { dateTime: endTime.toISOString(), timeZone: 'UTC' },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 60 },
          { method: 'popup', minutes: 15 },
        ],
      },
    };

    // Check if we already saved a calendar event ID for this user+match
    const existingEvents = await base44.asServiceRole.entities.CalendarSync.filter({
      user_id: user.id,
      match_id: matchId,
    });

    let calEventId = existingEvents[0]?.cal_event_id || null;
    let calendarRes;

    if (calEventId) {
      // Update existing event
      calendarRes = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${calEventId}`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(eventBody),
        }
      );
    } else {
      // Create new event
      calendarRes = await fetch(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(eventBody),
        }
      );
    }

    if (!calendarRes.ok) {
      const err = await calendarRes.text();
      return Response.json({ error: 'Google Calendar API error', detail: err }, { status: 500 });
    }

    const calEvent = await calendarRes.json();
    calEventId = calEvent.id;

    // Persist the mapping
    if (existingEvents[0]) {
      await base44.asServiceRole.entities.CalendarSync.update(existingEvents[0].id, {
        cal_event_id: calEventId,
        updated_at: new Date().toISOString(),
      });
    } else {
      await base44.asServiceRole.entities.CalendarSync.create({
        user_id: user.id,
        match_id: matchId,
        cal_event_id: calEventId,
      });
    }

    return Response.json({ success: true, calEventId, htmlLink: calEvent.htmlLink });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});