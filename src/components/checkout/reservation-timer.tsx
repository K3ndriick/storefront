'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

type Props = {
  expiresAt: Date;
};

export function ReservationTimer({ expiresAt }: Props) {
  const getSecondsLeft = () =>
    Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));

  const [secondsLeft, setSecondsLeft] = useState(getSecondsLeft);

  useEffect(() => {
    // Recalculate immediately in case of any delay between prop creation and mount
    setSecondsLeft(getSecondsLeft());

    const interval = setInterval(() => {
      const remaining = getSecondsLeft();
      setSecondsLeft(remaining);
      if (remaining === 0) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const isExpired  = secondsLeft === 0;
  const isUrgent   = secondsLeft <= 120 && !isExpired; // under 2 minutes

  if (isExpired) {
    return (
      <div className="flex items-center gap-2 text-sm text-destructive border border-destructive/30 bg-destructive/5 px-4 py-3">
        <Clock className="w-4 h-4 shrink-0" />
        <span>Your reservation has expired. Please go back and try again.</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 text-sm px-4 py-3 border ${
      isUrgent
        ? 'text-yellow-700 border-yellow-300 bg-yellow-50'
        : 'text-muted-foreground border-border bg-muted/30'
    }`}>
      <Clock className={`w-4 h-4 shrink-0 ${isUrgent ? 'text-yellow-600' : ''}`} />
      <span>
        Items reserved for{' '}
        <span className={`font-mono font-semibold ${isUrgent ? 'text-yellow-700' : ''}`}>
          {formatted}
        </span>
        {isUrgent && ' — complete your payment soon'}
      </span>
    </div>
  );
}
