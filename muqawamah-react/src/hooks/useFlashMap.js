import { useCallback, useRef, useState } from 'react';

/**
 * useFlashMap
 * Track transient "flash" flags by key (e.g. matchId/teamId) when values change.
 *
 * Usage:
 *   const { isFlashing, flashKeys } = useFlashMap(900)
 *   flashKeys(['abc'])
 *   <span className={isFlashing('abc') ? 'value-flash' : ''} />
 */
export function useFlashMap(durationMs = 900) {
  const [map, setMap] = useState(() => ({}));
  const timers = useRef(new Map());

  const flashKeys = useCallback(
    (keys = []) => {
      const list = Array.isArray(keys) ? keys : [keys];
      if (!list.length) return;

      setMap((prev) => {
        const next = { ...prev };
        list.forEach((k) => {
          if (!k) return;
          next[k] = true;
        });
        return next;
      });

      list.forEach((k) => {
        if (!k) return;
        const existing = timers.current.get(k);
        if (existing) clearTimeout(existing);
        const id = setTimeout(() => {
          timers.current.delete(k);
          setMap((prev) => {
            if (!prev[k]) return prev;
            const next = { ...prev };
            delete next[k];
            return next;
          });
        }, durationMs);
        timers.current.set(k, id);
      });
    },
    [durationMs]
  );

  const isFlashing = useCallback((key) => Boolean(key && map[key]), [map]);

  return { isFlashing, flashKeys };
}


