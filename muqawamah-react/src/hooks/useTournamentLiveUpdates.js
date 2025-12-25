import { useEffect, useMemo, useRef } from 'react';
import { supabaseClient } from '../lib/supabaseClient';

const DEFAULT_TABLES = [
  'matches',
  'teams',
  'players',
  'goals',
  'cards',
  'match_likes',
  'match_predictions'
];

/**
 * useTournamentLiveUpdates
 *
 * - Uses Supabase Realtime (websocket) to listen for Postgres changes.
 * - Debounces bursts of events into a single `onUpdate()` call.
 * - Adds a fallback poll interval (default 10s) for robustness.
 *
 * Notes:
 * - Realtime requires the tables to be enabled for replication in Supabase (Realtime).
 * - Filters only work on columns available in the table (e.g. `category` on `matches`/`teams`).
 */
export function useTournamentLiveUpdates({
  enabled = true,
  channelKey,
  tables = DEFAULT_TABLES,
  filtersByTable = {},
  schema = 'public',
  debounceMs = 600,
  pollIntervalMs = 10_000,
  pollWhenHidden = false,
  onUpdate
}) {
  const latestOnUpdate = useRef(onUpdate);
  latestOnUpdate.current = onUpdate;

  const stableTables = useMemo(() => {
    const t = Array.isArray(tables) ? tables : DEFAULT_TABLES;
    // de-dupe + stable order
    return Array.from(new Set(t)).sort();
  }, [tables]);

  const stableFiltersByTable = useMemo(() => {
    // ensure stable string keys
    const out = {};
    Object.entries(filtersByTable || {}).forEach(([k, v]) => {
      if (v) out[k] = String(v);
    });
    return out;
  }, [filtersByTable]);

  useEffect(() => {
    if (!enabled) return undefined;
    if (typeof latestOnUpdate.current !== 'function') return undefined;
    if (!stableTables.length) return undefined;

    let cancelled = false;
    let debounceId = null;

    const trigger = () => {
      if (cancelled) return;
      if (debounceId) clearTimeout(debounceId);
      debounceId = setTimeout(() => {
        if (cancelled) return;
        try {
          latestOnUpdate.current?.();
        } catch {
          // ignore
        }
      }, debounceMs);
    };

    const channelName =
      channelKey ||
      `tournament-live:${schema}:${stableTables.join(',')}:${Object.entries(stableFiltersByTable)
        .map(([k, v]) => `${k}=${v}`)
        .join('|') || 'nofilter'}`;

    const channel = supabaseClient.channel(channelName);
    stableTables.forEach((table) => {
      const filter = stableFiltersByTable[table];
      const cfg = { event: '*', schema, table };
      if (filter) cfg.filter = filter;
      channel.on('postgres_changes', cfg, trigger);
    });

    const subscription = channel.subscribe();

    let pollId = null;
    if (pollIntervalMs && pollIntervalMs > 0) {
      pollId = setInterval(() => {
        if (cancelled) return;
        if (!pollWhenHidden && typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
        trigger();
      }, pollIntervalMs);
    }

    const onVis = () => {
      if (cancelled) return;
      if (typeof document === 'undefined') return;
      if (document.visibilityState === 'visible') trigger();
    };
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', onVis);
    }

    return () => {
      cancelled = true;
      if (debounceId) clearTimeout(debounceId);
      if (pollId) clearInterval(pollId);
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', onVis);
      }
      try {
        subscription?.unsubscribe?.();
      } catch {
        // ignore
      }
      try {
        supabaseClient.removeChannel?.(channel);
      } catch {
        // ignore
      }
    };
  }, [
    enabled,
    channelKey,
    schema,
    debounceMs,
    pollIntervalMs,
    pollWhenHidden,
    stableTables,
    stableFiltersByTable
  ]);
}


