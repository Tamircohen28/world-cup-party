import React, { useState, useEffect } from 'react';

export default function CountdownClock({ targetTime, label, small }) {
  const [diff, setDiff] = useState(null);

  useEffect(() => {
    const calc = () => {
      const ms = new Date(targetTime) - new Date();
      if (ms <= 0) return setDiff(null);
      const h = Math.floor(ms / (1000 * 60 * 60));
      const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((ms % (1000 * 60)) / 1000);
      setDiff({ h, m, s });
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [targetTime]);

  if (!diff) return null;

  if (small) {
    return (
      <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
        <span>⏱</span>
        <span>{label}: <span className="font-mono font-semibold text-foreground">
          {diff.h > 0 ? `${diff.h}h ` : ''}{diff.m}m {diff.h === 0 ? `${diff.s}s` : ''}
        </span></span>
      </p>
    );
  }

  return (
    <div className="text-center">
      <p className="text-xs text-muted-foreground mb-2">{label}</p>
      <div className="flex items-center justify-center gap-3">
        {diff.h > 0 && (
          <>
            <div className="text-center">
              <div className="text-2xl font-bold font-mono tabular-nums">{String(diff.h).padStart(2, '0')}</div>
              <div className="text-[10px] text-muted-foreground">hrs</div>
            </div>
            <span className="text-muted-foreground font-bold">:</span>
          </>
        )}
        <div className="text-center">
          <div className="text-2xl font-bold font-mono tabular-nums">{String(diff.m).padStart(2, '0')}</div>
          <div className="text-[10px] text-muted-foreground">min</div>
        </div>
        <span className="text-muted-foreground font-bold">:</span>
        <div className="text-center">
          <div className="text-2xl font-bold font-mono tabular-nums">{String(diff.s).padStart(2, '0')}</div>
          <div className="text-[10px] text-muted-foreground">sec</div>
        </div>
      </div>
    </div>
  );
}