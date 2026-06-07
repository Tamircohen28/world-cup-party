import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SW_BASE = 'https://secure.splitwise.com/api/v3.0';
const GROUP_NAME = '⚽ World Cup Watch Party 2026';

async function swFetch(accessToken, path, options = {}) {
  const res = await fetch(`${SW_BASE}${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  return res.json();
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action, groupId, description, amount, items, matchLabel } = body;

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('splitwise');

    // ── Get or create the single shared group ──────────────────────────────
    if (action === 'getOrCreateGroup') {
      const data = await swFetch(accessToken, '/get_groups');
      const existing = (data.groups || []).find(
        g => g.name === GROUP_NAME && !g.updated_at?.includes('deleted')
      );
      if (existing) return Response.json({ group: existing });

      const created = await swFetch(accessToken, '/create_group', {
        method: 'POST',
        body: JSON.stringify({ name: GROUP_NAME }),
      });
      if (created.errors && Object.keys(created.errors).length > 0) {
        return Response.json({ error: JSON.stringify(created.errors) }, { status: 400 });
      }
      return Response.json({ group: created.group });
    }

    // ── Add a single manual expense ────────────────────────────────────────
    if (action === 'addExpense') {
      if (!groupId || !description || !amount) {
        return Response.json({ error: 'Missing groupId, description or amount' }, { status: 400 });
      }
      const meData = await swFetch(accessToken, '/get_current_user');
      const swUserId = meData.user?.id;
      if (!swUserId) return Response.json({ error: 'Could not get Splitwise user' }, { status: 400 });

      const groupData = await swFetch(accessToken, `/get_group/${groupId}`);
      const memberCount = (groupData.group?.members || []).length || 1;
      const share = (parseFloat(amount) / memberCount).toFixed(2);

      const result = await swFetch(accessToken, '/create_expense', {
        method: 'POST',
        body: JSON.stringify({
          cost: parseFloat(amount).toFixed(2),
          description,
          group_id: groupId,
          split_equally: true,
          users__0__user_id: swUserId,
          users__0__paid_share: parseFloat(amount).toFixed(2),
          users__0__owed_share: share,
        }),
      });
      if (result.errors && Object.keys(result.errors).length > 0) {
        return Response.json({ error: JSON.stringify(result.errors) }, { status: 400 });
      }
      return Response.json({ expense: result.expenses?.[0] });
    }

    // ── Sync claimed watch-party items as expenses ─────────────────────────
    // items: [{ name, emoji, claimed_by_name }]
    // Each claimed item is logged as a $0.00 placeholder expense so all members
    // can see who brought what. The claimer marks it "paid"; others owe $0.
    // Users should then edit the real amount inside Splitwise.
    if (action === 'syncClaimedItems') {
      if (!groupId || !items?.length) {
        return Response.json({ error: 'Missing groupId or items' }, { status: 400 });
      }

      const meData = await swFetch(accessToken, '/get_current_user');
      const swUserId = meData.user?.id;
      if (!swUserId) return Response.json({ error: 'Could not get Splitwise user' }, { status: 400 });

      // Fetch existing expenses so we don't create duplicates
      const existing = await swFetch(accessToken, `/get_expenses?group_id=${groupId}&limit=100`);
      const existingDescs = new Set(
        (existing.expenses || [])
          .filter(e => !e.deleted_at && !e.payment)
          .map(e => e.description)
      );

      const claimedItems = items.filter(i => i.claimed_by_name);
      const created = [];

      for (const item of claimedItems) {
        const label = `${matchLabel ? `[${matchLabel}] ` : ''}${item.emoji || ''} ${item.name} (by ${item.claimed_by_name})`.trim();
        if (existingDescs.has(label)) continue; // already synced

        const result = await swFetch(accessToken, '/create_expense', {
          method: 'POST',
          body: JSON.stringify({
            cost: '0.01', // Splitwise requires cost > 0; user edits actual amount later
            description: label,
            group_id: groupId,
            split_equally: true,
            users__0__user_id: swUserId,
            users__0__paid_share: '0.01',
            users__0__owed_share: '0.01',
          }),
        });
        if (result.expenses?.[0]) created.push(result.expenses[0]);
      }

      return Response.json({ synced: created.length, total: claimedItems.length });
    }

    // ── List expenses ──────────────────────────────────────────────────────
    if (action === 'getExpenses') {
      if (!groupId) return Response.json({ error: 'Missing groupId' }, { status: 400 });
      const data = await swFetch(accessToken, `/get_expenses?group_id=${groupId}&limit=50`);
      const expenses = (data.expenses || []).filter(e => !e.deleted_at && !e.payment);
      return Response.json({ expenses });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});