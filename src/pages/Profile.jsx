import React, { useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { User, LogOut, Trophy, Camera, X, Loader2, Home as HomeIcon, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getFlag } from '@/lib/flags';
import { toast } from 'sonner';

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [lightbox, setLightbox] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: rsvps = [] } = useQuery({
    queryKey: ['my-rsvps'],
    queryFn: async () => {
      const u = await base44.auth.me();
      return base44.entities.RSVP.filter({ user_id: u.id });
    },
  });

  const { data: allParties = [] } = useQuery({
    queryKey: ['watch-parties'],
    queryFn: () => base44.entities.WatchParty.list('-created_date', 200),
  });

  const { data: matches = [] } = useQuery({
    queryKey: ['matches'],
    queryFn: () => base44.entities.Match.list('kickoff_utc', 200),
  });

  const { data: myStats } = useQuery({
    queryKey: ['user-stats', user?.id],
    queryFn: async () => {
      const all = await base44.entities.UserStats.filter({ user_id: user.id });
      return all[0] || null;
    },
    enabled: !!user?.id,
  });

  const attendingCount = rsvps.filter(r => r.status === 'attending').length;
  const hostedParties = allParties.filter(p => p.host_user_id === user?.id);

  // Favorite teams: teams the user attended the most
  const teamCounts = {};
  rsvps.filter(r => r.status === 'attending').forEach(r => {
    const match = matches.find(m => m.id === r.match_id);
    if (!match) return;
    teamCounts[match.home_team] = (teamCounts[match.home_team] || 0) + 1;
    teamCounts[match.away_team] = (teamCounts[match.away_team] || 0) + 1;
  });
  const favoriteTeams = Object.entries(teamCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([team]) => team);

  const predAccuracy = myStats?.predictions_count > 0
    ? Math.round((myStats.correct_results / myStats.predictions_count) * 100)
    : null;

  // Compute watch-party earned badges from live data
  const itemsClaimedCount = allParties.reduce((sum, p) => {
    return sum + (p.items || []).filter(i => i.claimed_by === user?.id && !i.is_default).length;
  }, 0);
  const defaultItemsClaimed = allParties.reduce((sum, p) => {
    return sum + (p.items || []).filter(i => i.claimed_by === user?.id).length;
  }, 0);

  const watchPartyBadges = [];
  const h = hostedParties.length;
  if (h >= 1) watchPartyBadges.push({ emoji: '🏠', label: 'Host', desc: 'Hosted a watch party' });
  if (h >= 3) watchPartyBadges.push({ emoji: '🏡', label: 'Regular Host', desc: 'Hosted 3+ parties' });
  if (h >= 5) watchPartyBadges.push({ emoji: '👑', label: 'Super Host', desc: 'Hosted 5+ parties' });
  if (h >= 10) watchPartyBadges.push({ emoji: '🌟', label: 'Legendary Host', desc: 'Hosted 10+ parties' });
  if (attendingCount >= 5) watchPartyBadges.push({ emoji: '📺', label: 'Die-Hard Fan', desc: 'Attended 5+ games' });
  if (attendingCount >= 15) watchPartyBadges.push({ emoji: '⚽', label: 'World Cup Veteran', desc: 'Attended 15+ games' });
  if (defaultItemsClaimed >= 3) watchPartyBadges.push({ emoji: '🎒', label: 'Contributor', desc: 'Claimed 3+ items' });
  if (itemsClaimedCount >= 2) watchPartyBadges.push({ emoji: '🥤', label: 'Top Contributor', desc: 'Brought the most custom items' });

  // Merge prediction badges from UserStats
  const predBadgeObjects = (myStats?.badges || []).map(b => {
    const [emoji, ...rest] = b.split(' ');
    return { emoji, label: rest.join(' '), desc: b };
  });

  const allBadges = [...watchPartyBadges, ...predBadgeObjects];

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const newPhoto = { url: file_url, uploaded_at: new Date().toISOString(), caption: '' };
      const existing = user.photos || [];
      await base44.auth.updateMe({ photos: [...existing, newPhoto] });
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
      toast.success('Photo added! 📸');
    } catch {
      toast.error('Failed to upload photo');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDeletePhoto = async (index) => {
    const photos = (user.photos || []).filter((_, i) => i !== index);
    await base44.auth.updateMe({ photos });
    queryClient.invalidateQueries({ queryKey: ['current-user'] });
    setLightbox(null);
  };

  const photos = user?.photos || [];

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-8 space-y-6">
      <h1 className="text-2xl font-display font-bold">Profile</h1>

      {/* User card */}
      <div className="bg-gradient-to-br from-primary/10 to-secondary/5 rounded-2xl border border-primary/20 p-6 text-center">
        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
          <User className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-lg font-bold">{user?.full_name || '...'}</h2>
        <p className="text-sm text-muted-foreground">{user?.email}</p>

        <div className="grid grid-cols-4 gap-3 mt-5 text-center">
          <div>
            <p className="text-xl font-bold text-primary">{attendingCount}</p>
            <p className="text-[10px] text-muted-foreground">Attending</p>
          </div>
          <div>
            <p className="text-xl font-bold text-secondary">{hostedParties.length}</p>
            <p className="text-[10px] text-muted-foreground">Hosted</p>
          </div>
          <div>
            <p className="text-xl font-bold text-primary">{myStats?.total_points ?? 0}</p>
            <p className="text-[10px] text-muted-foreground">Pred pts</p>
          </div>
          <div>
            <p className="text-xl font-bold">{predAccuracy !== null ? `${predAccuracy}%` : '—'}</p>
            <p className="text-[10px] text-muted-foreground">Accuracy</p>
          </div>
        </div>
      </div>

      {/* Badges */}
      {allBadges.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-secondary" />Badges
            <span className="text-xs text-muted-foreground font-normal ml-1">{allBadges.length} earned</span>
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {allBadges.map((b, i) => (
              <div key={i} className="flex items-center gap-3 bg-card rounded-xl border border-border px-3 py-2.5">
                <span className="text-2xl leading-none">{b.emoji}</span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold leading-tight">{b.label}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Favorite teams */}
      {favoriteTeams.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Star className="w-4 h-4 text-secondary" />Favorite Teams
          </h3>
          <div className="flex flex-wrap gap-2">
            {favoriteTeams.map(team => (
              <Badge key={team} className="bg-card border border-border text-foreground text-sm px-3 py-1">
                {getFlag(team)} {team}
              </Badge>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-1.5">Based on games you attended</p>
        </div>
      )}

      {/* Hosting history */}
      {hostedParties.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <HomeIcon className="w-4 h-4 text-primary" />Hosting History
          </h3>
          <div className="space-y-2">
            {hostedParties.map(party => {
              const match = matches.find(m => m.id === party.match_id);
              return (
                <Link key={party.id} to={`/game/${party.match_id}`}>
                  <div className="flex items-center gap-3 bg-card rounded-xl border border-border p-3 hover:border-primary/20 transition-all">
                    {match && (
                      <>
                        <span className="text-lg">{getFlag(match.home_team)}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{match.home_team} vs {match.away_team}</p>
                          {party.host_location && (
                            <p className="text-xs text-muted-foreground truncate">📍 {party.host_location}</p>
                          )}
                        </div>
                        <span className="text-lg">{getFlag(match.away_team)}</span>
                      </>
                    )}
                    {!match && <p className="text-sm text-muted-foreground">Match #{party.match_id?.slice(0, 6)}</p>}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Photo gallery */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Camera className="w-4 h-4 text-primary" />Watch Party Photos
          </h3>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline disabled:opacity-50"
          >
            {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
            Add photo
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
        </div>

        {photos.length === 0 ? (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full py-10 rounded-xl border-2 border-dashed border-border text-muted-foreground hover:border-primary/30 hover:text-foreground transition-all text-sm"
          >
            {uploading ? 'Uploading...' : '📸 Tap to add your first watch party photo'}
          </button>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {photos.map((photo, i) => (
              <button
                key={i}
                onClick={() => setLightbox(i)}
                className="aspect-square rounded-xl overflow-hidden bg-muted hover:opacity-90 transition-all"
              >
                <img src={photo.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox !== null && photos[lightbox] && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <div className="relative max-w-lg w-full" onClick={e => e.stopPropagation()}>
            <img src={photos[lightbox].url} alt="" className="w-full rounded-2xl" />
            <button
              onClick={() => handleDeletePhoto(lightbox)}
              className="absolute top-3 right-3 bg-destructive text-destructive-foreground rounded-full p-1.5 hover:opacity-80 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="border-t border-border pt-4">
        <Button
          variant="outline"
          className="w-full text-destructive border-destructive/20 hover:bg-destructive/10"
          onClick={() => base44.auth.logout()}
        >
          <LogOut className="w-4 h-4 mr-2" />Sign Out
        </Button>
      </div>
    </div>
  );
}