import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { DEFAULT_ITEMS } from '@/lib/flags';
import { toast } from 'sonner';

/**
 * Encapsulates all data-fetching and mutations for the GameDetail page.
 * Returns match, watchParty, RSVPs, current user, and mutation handlers.
 */
export function useGameDetail(matchId) {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: match } = useQuery({
    queryKey: ['match', matchId],
    queryFn: async () => {
      const allMatches = await base44.entities.Match.list('kickoff_utc', 200);
      return allMatches.find(m => m.id === matchId) || null;
    },
    enabled: !!matchId,
  });

  const { data: watchParty } = useQuery({
    queryKey: ['watch-party', matchId],
    queryFn: async () => {
      const parties = await base44.entities.WatchParty.filter({ match_id: matchId });
      return parties[0] || null;
    },
    enabled: !!matchId,
  });

  const { data: allRsvps } = useQuery({
    queryKey: ['rsvps', matchId],
    queryFn: () => base44.entities.RSVP.filter({ match_id: matchId }),
    initialData: [],
    enabled: !!matchId,
  });

  const myRsvp = useMemo(
    () => allRsvps.find(r => r.user_id === user?.id),
    [allRsvps, user],
  );

  const myClaimedItems = useMemo(
    () => (watchParty?.items || []).filter(i => i.claimed_by === user?.id),
    [watchParty, user],
  );

  const attending = allRsvps.filter(r => r.status === 'attending');
  const maybe    = allRsvps.filter(r => r.status === 'maybe');
  const notGoing = allRsvps.filter(r => r.status === 'not-attending');
  const isHost   = watchParty?.host_user_id === user?.id;
  const isPast   = match ? new Date(match.kickoff_utc) < new Date() : false;

  // ── RSVP mutation ──────────────────────────────────────────────────────────
  const rsvpMutation = useMutation({
    mutationFn: async (status) => {
      const count =
        attending.length +
        (status === 'attending' && myRsvp?.status !== 'attending' ? 1 : 0) -
        (status !== 'attending' && myRsvp?.status === 'attending' ? 1 : 0);

      if (myRsvp) {
        await base44.entities.RSVP.update(myRsvp.id, { status });
      } else {
        await base44.entities.RSVP.create({
          match_id: matchId,
          user_id: user.id,
          user_display_name: user.full_name,
          status,
        });
      }
      if (watchParty) {
        await base44.entities.WatchParty.update(watchParty.id, { attending_count: count });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rsvps', matchId] });
      queryClient.invalidateQueries({ queryKey: ['my-rsvps'] });
      queryClient.invalidateQueries({ queryKey: ['watch-party', matchId] });
      queryClient.invalidateQueries({ queryKey: ['watch-parties'] });
    },
  });

  // ── Host claim / step-down ─────────────────────────────────────────────────
  const handleBecomeHost = async (location, notes) => {
    const updates = { host_user_id: user.id, host_display_name: user.full_name, host_location: location, host_notes: notes };
    const items = (watchParty?.items?.length
      ? watchParty.items
      : DEFAULT_ITEMS.map((it, idx) => ({ id: `default_${idx}`, ...it, claimed_by: null, claimed_by_name: null, is_default: true }))
    ).map(item =>
      item.name === 'TV / projector setup'
        ? { ...item, claimed_by: user.id, claimed_by_name: user.full_name }
        : item
    );

    if (watchParty) {
      await base44.entities.WatchParty.update(watchParty.id, { ...updates, items });
    } else {
      await base44.entities.WatchParty.create({ match_id: matchId, ...updates, items, attending_count: attending.length });
    }
    queryClient.invalidateQueries({ queryKey: ['watch-party', matchId] });
    queryClient.invalidateQueries({ queryKey: ['watch-parties'] });
    toast.success("You're hosting! 🏠");
  };

  const handleStepDown = async () => {
    const clearedItems = (watchParty?.items || []).map(i =>
      i.claimed_by === user?.id ? { ...i, claimed_by: null, claimed_by_name: null } : i,
    );
    await base44.entities.WatchParty.update(watchParty.id, {
      host_user_id: null, host_display_name: null, host_location: null, host_notes: null, items: clearedItems,
    });
    queryClient.invalidateQueries({ queryKey: ['watch-party', matchId] });
    queryClient.invalidateQueries({ queryKey: ['watch-parties'] });
    toast.success('Stepped down from hosting');
  };

  // ── Items ──────────────────────────────────────────────────────────────────
  const handleClaimItem = async (itemId) => {
    const items = (watchParty.items || []).map(item =>
      item.id === itemId ? { ...item, claimed_by: user.id, claimed_by_name: user.full_name } : item,
    );
    await base44.entities.WatchParty.update(watchParty.id, { items });
    queryClient.invalidateQueries({ queryKey: ['watch-party', matchId] });
  };

  const handleReleaseItem = async (itemId) => {
    const items = (watchParty.items || []).map(item =>
      item.id === itemId ? { ...item, claimed_by: null, claimed_by_name: null } : item,
    );
    await base44.entities.WatchParty.update(watchParty.id, { items });
    queryClient.invalidateQueries({ queryKey: ['watch-party', matchId] });
  };

  const handleAddItem = async (name, emoji) => {
    const newItem = { id: `item_${Date.now()}`, name, emoji, claimed_by: null, claimed_by_name: null, is_default: false };
    const items = [...(watchParty.items || []), newItem];
    await base44.entities.WatchParty.update(watchParty.id, { items });
    queryClient.invalidateQueries({ queryKey: ['watch-party', matchId] });
  };

  return {
    user, match, watchParty, allRsvps, myRsvp, myClaimedItems,
    attending, maybe, notGoing, isHost, isPast,
    rsvpMutation,
    handleBecomeHost, handleStepDown,
    handleClaimItem, handleReleaseItem, handleAddItem,
  };
}
