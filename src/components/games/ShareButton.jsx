import React, { useState } from 'react';
import { Share2, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function ShareButton({ match, watchParty }) {
  const [copied, setCopied] = useState(false);

  const url = `${window.location.origin}/game/${match.id}`;
  const hostPart = watchParty?.host_display_name
    ? ` @ ${watchParty.host_display_name}'s place`
    : '';
  const text = `⚽ Watch Party: ${match.home_team} vs ${match.away_team}${hostPart} — RSVP here: ${url}`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: `Watch Party: ${match.home_team} vs ${match.away_team}`, text, url });
        return;
      } catch {
        // fallback to copy
      }
    }
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Invite link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted hover:bg-accent text-muted-foreground hover:text-foreground text-sm font-medium transition-all border border-border"
    >
      {copied ? <Check className="w-4 h-4 text-primary" /> : <Share2 className="w-4 h-4" />}
      {copied ? 'Copied!' : 'Share'}
    </button>
  );
}