import React, { useState, useEffect } from 'react';

export default function CountdownTimer({ kickoffUtc }) {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const calc = () => {
      const diff = new Date(kickoffUtc) - new Date();
      if (diff <= 0) return setTimeLeft(null);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ days, hours, minutes, seconds });
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [kickoffUtc]);

  if (!timeLeft) return null;

  const units = timeLeft.days > 0
    ? [{ v: timeLeft.days, l: 'days' }, { v: timeLeft.hours, l: 'hrs' }, { v: timeLeft.minutes, l: 'min' }]
    : [{ v: timeLeft.hours, l: 'hrs' }, { v: timeLeft.minutes, l: 'min' }, { v: timeLeft.seconds, l: 'sec' }];

  return (
    <div className="flex items-center justify-center gap-3 py-3">
      {units.map(({ v, l }, i) => (
        <React.Fragment key={l}>
          {i > 0 && <span className="text-muted-foreground/50 font-bold text-lg">:</span>}
          <div className="text-center min-w-[3rem]">
            <div className="text-2xl font-bold font-mono text-primary tabular-nums">
              {String(v).padStart(2, '0')}
            </div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{l}</div>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}