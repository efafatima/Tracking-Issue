import { useEffect, useCallback } from "react";

/**
 * useAutoRefresh
 * Calls fetchFn immediately on mount, then every intervalMs milliseconds.
 * Cleans up the interval on unmount.
 *
 * @param {Function} fetchFn   - stable callback (wrap in useCallback in the parent)
 * @param {number}   intervalMs - polling interval in ms (default 30 000)
 */
export function useAutoRefresh(fetchFn, intervalMs = 30000) {
  useEffect(() => {
    fetchFn();
    const id = setInterval(fetchFn, intervalMs);
    return () => clearInterval(id);
  }, [fetchFn, intervalMs]);
}

export default useAutoRefresh;