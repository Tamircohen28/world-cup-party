import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getFlag, getStageColor, getStageName, formatIDT, formatDateIDT, DEFAULT_ITEMS } from '@/lib/flags';
import RsvpButtons from '@/components/games/RsvpButtons';
import ItemsList from '@/components/games/ItemsList';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, MapPin, Home as HomeIcon, Users, Clock, AlertTriangle, MessageCircle, CalendarPlus, Loader2 } from 'lucide-react';
import MessageFeed from '@/components/games/MessageFeed';
import MatchInsights from '@/components/games/MatchInsights';
import MatchBuzz from '@/components/games/MatchBuzz';
import SplitwisePanel from '@/components/games/SplitwisePanel';
import CountdownTimer from '@/components/games/CountdownTimer';
import ShareButton from '@/components/games/ShareButton';
import PredictionTab from '@/components/predictions/PredictionTab';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function GameDetailPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { matchId } = useParams();

  const [hostLocation, setHostLocation] = useState('');
  const [hostNotes, setHostNotes] = useState('');
  const [showHostForm, setShowHostForm] = useState(false);
  const [showStepDownWarning, setShowStepDownWarning] = useState(false);
  const [showReleaseItemsWarning, setShowReleaseItemsWarning] = useState(false);
  const [pendingRsvpStatus, setPendingRsvpStatus] = useState(null);
  const [calSyncing, setCalSyncing] = useState(false);
  const [calSynced, setCalSynced] = useState(false);
  const [activeTab, setActiveTab] = useState('party');

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

  const myRsvp = useMemo(() => {
    return allRsvps.find(r => r.user_id === user?.id);
  }, [allRsvps, user]);

  const attending = allRsvps.filter(r => r.status === 'attending');
  const maybe = allRsvps.filter(r => r.status === 'maybe');
  const notGoing = allRsvps.filter(r => r.status === 'not-attending');

  const isHost = watchParty?.host_user_id === user?.id;
  const isPast = match ? new Date(match.kickoff_utc) < new Date() : false;

  const handleAddToCalendar = async () => {
    setCalSyncing(true);
    try {
      const res = await base44.functions.invoke('syncGoogleCalendar', { matchId });
      if (res.data?.success) {
        setCalSynced(true);
        toast.success('Added to Google Calendar! 📅');
        if (res.data.htmlLink) window.open(res.data.htmlLink, '_blank');
      } else {
        toast.error(res.data?.error || 'Failed to add to calendar');
      }
    } catch (e) {
      toast.error('Could not connect to Google Calendar. Make sure it\'s connected in settings.');
    } finally {
      setCalSyncing(false);
    }
  };

  const myClaimedItems = useMemo(() => {
    return (watchParty?.items || []).filter(i => i.claimed_by === user?.id);
  }, [watchParty, user]);

  const rsvpMutation = useMutation({
    mutationFn: async (status) => {
      if (myRsvp) {
        await base44.entities.RSVP.update(myRsvp.id, { status });
      } else {
        await base44.entities.RSVP.create({
          match_id: matchId,
          user_id: user.id,
          user_name: user.full_name,
          status,
        });
      }
      // Create watch party if first attendee
      if (status === 'attending' && !watchParty) {
        const items = DEFAULT_ITEMS.map((item, i) => ({
          id: `item_${Date.now()}_${i}`,
          name: item.name,
          emoji: item.emoji,
          claimed_by: null,
          claimed_by_name: null,
          is_default: true,
        }));
        await base44.entities.WatchParty.create({
          match_id: matchId,
          items,
          attending_count: 1,
        });
      } else if (watchParty) {
        const count = attending.length + (status === 'attending' && myRsvp?.status !== 'attending' ? 1 : 0) - (status !== 'attending' && myRsvp?.status === 'attending' ? 1 : 0);
        await base44.entities.WatchParty.update(watchParty.id, { attending_count: Math.max(0, count) });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rsvps', matchId] });
      queryClient.invalidateQueries({ queryKey: ['watch-party', matchId] });
      queryClient.invalidateQueries({ queryKey: ['my-rsvps'] });
      queryClient.invalidateQueries({ queryKey: ['watch-parties'] });
    },
  });

  const handleRsvp = (status) => {
    if (status === 'not-attending' && isHost) {
      setShowStepDownWarning(true);
      return;
    }
    if (status === 'not-attending' && myClaimedItems.length > 0) {
      setPendingRsvpStatus(status);
      setShowReleaseItemsWarning(true);
      return;
    }
    rsvpMutation.mutate(status);
  };

  const handleStepDown = async () => {
    await base44.entities.WatchParty.update(watchParty.id, {
      host_user_id: null,
      host_display_name: null,
      host_location: null,
      host_notes: null,
    });
    // Release TV item
    const items = (watchParty.items || []).map(item =>
      item.name === 'TV / projector setup' && item.claimed_by === user.id
        ? { ...item, claimed_by: null, claimed_by_name: null }
        : item
    );
    await base44.entities.WatchParty.update(watchParty.id, { items });
    queryClient.invalidateQueries({ queryKey: ['watch-party', matchId] });
    queryClient.invalidateQueries({ queryKey: ['watch-parties'] });
    setShowStepDownWarning(false);
    toast.success('You stepped down as host');
  };

  const handleReleaseAndRsvp = async () => {
    const items = (watchParty.items || []).map(item =>
      item.claimed_by === user.id ? { ...item, claimed_by: null, claimed_by_name: null } : item
    );
    await base44.entities.WatchParty.update(watchParty.id, { items });
    rsvpMutation.mutate(pendingRsvpStatus);
    setShowReleaseItemsWarning(false);
    setPendingRsvpStatus(null);
  };

  const handleClaimHost = async () => {
    const updates = {
      host_user_id: user.id,
      host_display_name: user.full_name,
      host_location: hostLocation || 'TBD',
      host_notes: hostNotes || null,
    };
    // Auto-claim TV item
    const items = (watchParty.items || []).map(item =>
      item.name === 'TV / projector setup'
        ? { ...item, claimed_by: user.id, claimed_by_name: user.full_name }
        : item
    );
    await base44.entities.WatchParty.update(watchParty.id, { ...updates, items });
    queryClient.invalidateQueries({ queryKey: ['watch-party', matchId] });
    queryClient.invalidateQueries({ queryKey: ['watch-parties'] });
    setShowHostForm(false);
    toast.success('You\'re hosting! 🏠');
  };

  const handleClaimItem = async (itemId) => {
    const items = (watchParty.items || []).map(item =>
      item.id === itemId ? { ...item, claimed_by: user.id, claimed_by_name: user.full_name } : item
    );
    await base44.entities.WatchParty.update(watchParty.id, { items });
    queryClient.invalidateQueries({ queryKey: ['watch-party', matchId] });
  };

  const handleReleaseItem = async (itemId) => {
    const items = (watchParty.items || []).map(item =>
      item.id === itemId ? { ...item, claimed_by: null, claimed_by_name: null } : item
    );
    await base44.entities.WatchParty.update(watchParty.id, { items });
    queryClient.invalidateQueries({ queryKey: ['watch-party', matchId] });
  };

  const handleAddItem = async (name, emoji) => {
    const newItem = {
      id: `item_${Date.now()}`,
      name,
      emoji,
      claimed_by: null,
      claimed_by_name: null,
      is_default: false,
    };
    const items = [...(watchParty.items || []), newItem];
    await base44.entities.WatchParty.update(watchParty.id, { items });
    queryClient.invalidateQueries({ queryKey: ['watch-party', matchId] });
  };

  if (!match) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto pb-8">
      {/* Header */}
      <div className="relative bg-gradient-to-b from-primary/15 to-background px-4 pt-4 pb-6">
        <button onClick={() => navigate(-1)} className="mb-4 p-2 -ml-2 rounded-xl hover:bg-muted transition-all">
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center space-y-4">
          <Badge variant="outline" className={`${getStageColor(match.stage)} text-xs font-semibold`}>
            {match.group_name ? `Group ${match.group_name}` : getStageName(match.stage)}
            {match.matchday ? ` · Matchday ${match.matchday}` : ''}
          </Badge>

          {/* Teams */}
          <div className="flex items-center justify-center gap-6">
            <div className="text-center">
              <div className="text-4xl mb-1">{getFlag(match.home_team)}</div>
              <p className="font-bold text-sm">{match.home_team}</p>
            </div>
            <div className="text-center">
              {match.status === 'finished' || match.status === 'live' ? (
                <div className="text-3xl font-bold font-mono">
                  {match.home_score ?? 0} – {match.away_score ?? 0}
                </div>
              ) : (
                <span className="text-xl font-bold text-muted-foreground">vs</span>
              )}
              {match.status === 'live' && (
                <span className="flex items-center gap-1 justify-center text-red-400 text-xs font-bold mt-1">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />LIVE
                </span>
              )}
            </div>
            <div className="text-center">
              <div className="text-4xl mb-1">{getFlag(match.away_team)}</div>
              <p className="font-bold text-sm">{match.away_team}</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {formatIDT(match.kickoff_utc)} IDT
            </span>
            <span>·</span>
            <span>{formatDateIDT(match.kickoff_utc)}</span>
          </div>
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
            <MapPin className="w-3 h-3" />{match.stadium}
          </p>

          {/* Countdown */}
          {!isPast && <CountdownTimer kickoffUtc={match.kickoff_utc} />}

          {/* Share */}
          <div className="flex justify-center">
            <ShareButton match={match} watchParty={watchParty} />
          </div>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 px-4 mb-2">
        {['party', 'predict'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === tab
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'party' ? '🏠 Watch Party' : '🎯 Predict'}
          </button>
        ))}
      </div>

      {/* Predict tab */}
      {activeTab === 'predict' && match && user && (
        <div className="px-4 pb-8">
          <PredictionTab match={match} user={user} />
        </div>
      )}

      {activeTab === 'party' && <div className="px-4 space-y-6">
        {/* Match Buzz */}
        {!isPast && (
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">🔥 Pre-Match Buzz</h3>
            <MatchBuzz match={match} />
          </div>
        )}

        {/* Match Insights */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">📊 Match Insights</h3>
          <MatchInsights match={match} />
        </div>

        {/* RSVP */}
        {!isPast && (
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Your RSVP</h3>
            <RsvpButtons
              currentStatus={myRsvp?.status}
              onRsvp={handleRsvp}
              disabled={rsvpMutation.isPending}
            />
          </div>
        )}

        {/* Add to Google Calendar */}
        {!isPast && (
          <div>
            <button
              onClick={handleAddToCalendar}
              disabled={calSyncing}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                calSynced
                  ? 'bg-primary/10 text-primary border-primary/20'
                  : 'bg-muted text-muted-foreground border-border hover:border-primary/30 hover:text-foreground'
              }`}
            >
              {calSyncing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CalendarPlus className="w-4 h-4" />
              )}
              {calSynced ? '✓ Saved to Google Calendar' : 'Add to Google Calendar'}
            </button>
            <p className="text-[10px] text-center text-muted-foreground mt-1">Includes host, location & attendees</p>
          </div>
        )}

        {/* Host Section */}
        {watchParty && (
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              <HomeIcon className="w-4 h-4 inline mr-1" />Watch Party
            </h3>
            {watchParty.host_user_id ? (
              <div className="bg-card rounded-xl border border-border p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">🏠 {watchParty.host_display_name}</p>
                  {isHost && !isPast && (
                    <Button variant="ghost" size="sm" className="text-xs text-destructive" onClick={handleStepDown}>
                      Step Down
                    </Button>
                  )}
                </div>
                {watchParty.host_location && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />{watchParty.host_location}
                  </p>
                )}
                {watchParty.host_notes && (
                  <p className="text-sm text-muted-foreground">📝 {watchParty.host_notes}</p>
                )}
              </div>
            ) : !isPast ? (
              showHostForm ? (
                <div className="bg-card rounded-xl border border-border p-4 space-y-3">
                  <Input
                    placeholder="Location (e.g., My place, Rothschild 5)"
                    value={hostLocation}
                    onChange={(e) => setHostLocation(e.target.value)}
                  />
                  <Textarea
                    placeholder="Notes (optional - parking, bell number...)"
                    value={hostNotes}
                    onChange={(e) => setHostNotes(e.target.value)}
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleClaimHost} className="flex-1 bg-primary">I'm Hosting!</Button>
                    <Button variant="outline" onClick={() => setShowHostForm(false)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={() => setShowHostForm(true)}
                  className="w-full bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
                  size="lg"
                >
                  <HomeIcon className="w-4 h-4 mr-2" />
                  I'll Host This One!
                </Button>
              )
            ) : (
              <p className="text-sm text-muted-foreground">No host was set for this game</p>
            )}
          </div>
        )}

        {/* Attendees */}
        {allRsvps.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              <Users className="w-4 h-4 inline mr-1" />Who's Coming
            </h3>
            <div className="space-y-3">
              {attending.length > 0 && (
                <div>
                  <p className="text-xs text-primary font-semibold mb-2">✓ Attending ({attending.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {attending.map(r => (
                      <Badge key={r.id} className="bg-primary/10 text-primary border-primary/20 text-xs">
                        {r.user_name || 'Unknown'}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {maybe.length > 0 && (
                <div>
                  <p className="text-xs text-secondary font-semibold mb-2">? Maybe ({maybe.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {maybe.map(r => (
                      <Badge key={r.id} className="bg-secondary/10 text-secondary border-secondary/20 text-xs">
                        {r.user_name || 'Unknown'}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {notGoing.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground font-semibold mb-2">✗ Not Going ({notGoing.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {notGoing.map(r => (
                      <Badge key={r.id} variant="outline" className="text-xs text-muted-foreground">
                        {r.user_name || 'Unknown'}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Items */}
        {watchParty && (
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">🎒 Bring List</h3>
            <ItemsList
              items={watchParty.items}
              currentUserId={user?.id}
              currentUserName={user?.full_name}
              onClaimItem={handleClaimItem}
              onReleaseItem={handleReleaseItem}
              onAddItem={handleAddItem}
            />
          </div>
        )}

        {/* Splitwise Expenses */}
        {watchParty && (
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">💸 Party Expenses</h3>
            <SplitwisePanel
              matchId={matchId}
              matchLabel={`${match.home_team} vs ${match.away_team}`}
              watchPartyItems={watchParty?.items || []}
            />
          </div>
        )}

        {/* Message Feed */}
        {watchParty && user && (
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              <MessageCircle className="w-4 h-4 inline mr-1" />Group Chat
            </h3>
            <MessageFeed matchId={matchId} currentUser={user} />
          </div>
        )}
      </div>}

      {/* Warning Dialogs */}
      <AlertDialog open={showStepDownWarning} onOpenChange={setShowStepDownWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-secondary" />You're the Host
            </AlertDialogTitle>
            <AlertDialogDescription>
              You need to step down as host before changing your RSVP to "Not Going".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleStepDown} className="bg-destructive">Step Down & Leave</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showReleaseItemsWarning} onOpenChange={setShowReleaseItemsWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Release Your Items?</AlertDialogTitle>
            <AlertDialogDescription>
              You've claimed: {myClaimedItems.map(i => `${i.emoji} ${i.name}`).join(', ')}. 
              Do you want to release them?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setPendingRsvpStatus(null); }}>Keep Items</AlertDialogCancel>
            <AlertDialogAction onClick={handleReleaseAndRsvp}>Release & Skip</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}