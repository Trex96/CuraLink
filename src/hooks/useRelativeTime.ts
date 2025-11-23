import { useEffect, useRef, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

// Compute next update interval based on how old the timestamp is.
function getNextInterval(msFromNow: number): number {
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (msFromNow < minute) return 1_000; // update every second for < 1 min
  if (msFromNow < hour) return 30_000; // every 30s for < 1 hour
  if (msFromNow < day) return 60_000; // every minute for < 1 day
  return 5 * minute; // every 5 minutes thereafter
}

/**
 * useRelativeTime
 * Returns a live-updating relative time string like "2 minutes ago".
 * Optimizes re-renders using dynamic intervals and pauses updates when
 * the tab is hidden to avoid unnecessary work.
 */
export function useRelativeTime(dateInput: string | number | Date): string {
  const [text, setText] = useState<string>(() =>
    formatDistanceToNow(new Date(dateInput), { addSuffix: true })
  );
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    function scheduleNext() {
      const now = Date.now();
      const then = new Date(dateInput).getTime();
      const diff = Math.max(0, now - then);

      setText(formatDistanceToNow(then, { addSuffix: true }));

      const next = getNextInterval(diff);
      // If tab hidden, slow down updates to 1 minute
      const effectiveNext = document.hidden ? Math.max(next, 60_000) : next;

      timerRef.current = window.setTimeout(scheduleNext, effectiveNext);
    }

    scheduleNext();

    function onVisibilityChange() {
      // Re-schedule immediately when visibility changes
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      scheduleNext();
    }

    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [dateInput]);

  return text;
}

export default useRelativeTime;