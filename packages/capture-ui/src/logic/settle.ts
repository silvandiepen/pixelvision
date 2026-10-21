import type { SettledValue, SettledValueOptions } from "./settle.model";

/**
 * Creates a settled value: a new reported value is only shown once it has
 * been reported for `delayMs` without interruption, and a shown value
 * stays for at least `minHoldMs`. Use it for anything the person reads or
 * sees change colour, so a detector flickering a few times a second
 * doesn't make the interface flicker with it.
 *
 * @param initial - The value shown at first.
 * @param options - Delay before showing a change, and minimum show time.
 * @returns The settled value.
 *
 * @example
 * const hint = createSettledValue<LabelKey | undefined>(undefined, {
 *   delayMs: (v) => (v === "noFace" ? 1000 : 800),
 * });
 * show(hint.update(guidanceHint, performance.now()));
 */
export function createSettledValue<T>(
  initial: T,
  options: SettledValueOptions<T> = {},
): SettledValue<T> {
  const { delayMs = 800, minHoldMs = 1200 } = options;
  const delayFor = (value: T) => (typeof delayMs === "function" ? delayMs(value) : delayMs);
  let shown = initial;
  let shownAt = -Infinity;
  let pending: { value: T; since: number } | undefined;

  return {
    update(value, now) {
      if (Object.is(value, shown)) {
        pending = undefined;
        return shown;
      }
      if (!pending || !Object.is(pending.value, value)) pending = { value, since: now };
      if (now - pending.since >= delayFor(value) && now - shownAt >= minHoldMs) {
        shown = value;
        shownAt = now;
        pending = undefined;
      }
      return shown;
    },
    force(value, now) {
      shown = value;
      shownAt = now;
      pending = undefined;
      return shown;
    },
    get value() {
      return shown;
    },
    reset(value) {
      shown = value;
      shownAt = -Infinity;
      pending = undefined;
    },
  };
}
