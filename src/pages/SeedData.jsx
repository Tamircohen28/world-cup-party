import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { ALL_MATCHES } from '@/lib/matchData';
import { Button } from '@/components/ui/button';
import { Loader2, Database, Check } from 'lucide-react';

export default function SeedDataPage() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleSeed = async () => {
    setLoading(true);
    setProgress(0);
    
    // Check if already seeded
    const existing = await base44.entities.Match.list('kickoff_utc', 1);
    if (existing.length > 0) {
      setDone(true);
      setLoading(false);
      return;
    }

    // Seed in batches of 20
    const batchSize = 20;
    for (let i = 0; i < ALL_MATCHES.length; i += batchSize) {
      const batch = ALL_MATCHES.slice(i, i + batchSize);
      await base44.entities.Match.bulkCreate(batch);
      setProgress(Math.min(i + batchSize, ALL_MATCHES.length));
    }

    setDone(true);
    setLoading(false);
  };

  return (
    <div className="max-w-lg mx-auto px-4 pt-12 text-center space-y-6">
      <div className="text-6xl">⚽</div>
      <h1 className="text-3xl font-display font-bold">World Cup 2026</h1>
      <p className="text-muted-foreground">Seed all 104 matches into the database</p>
      
      {done ? (
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2 text-primary">
            <Check className="w-6 h-6" />
            <span className="font-semibold">All 104 matches seeded!</span>
          </div>
          <Button onClick={() => window.location.href = '/'} className="bg-primary">
            Go to Home
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <Button
            onClick={handleSeed}
            disabled={loading}
            size="lg"
            className="bg-primary hover:bg-primary/90"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Seeding {progress}/{ALL_MATCHES.length}...
              </>
            ) : (
              <>
                <Database className="w-4 h-4 mr-2" />
                Seed Match Data
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground">
            This will add all group stage + knockout matches
          </p>
        </div>
      )}
    </div>
  );
}