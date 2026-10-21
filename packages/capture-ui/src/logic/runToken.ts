import type { RunCounter } from "./runToken.model";

/**
 * Creates a run counter: each {@link RunCounter.begin} aborts the previous run's token, so
 * only the newest run's work is current.
 *
 * @returns The counter.
 *
 * @example
 * const runs = createRunCounter();
 * const token = runs.begin();
 * const cascades = await loadCascades();
 * if (!token.current) return; // stopped while loading
 */
export function createRunCounter(): RunCounter {
  let controller: AbortController | undefined;
  return {
    begin() {
      controller?.abort();
      const own = new AbortController();
      controller = own;
      return {
        get current() {
          return !own.signal.aborted;
        },
        signal: own.signal,
      };
    },
    cancel() {
      controller?.abort();
      controller = undefined;
    },
  };
}
