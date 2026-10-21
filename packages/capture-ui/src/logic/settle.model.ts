/** Options for {@link createSettledValue}. */
export interface SettledValueOptions<T> {
  /**
   * How long a new value must keep being reported before it is shown, in
   * ms (default 800). A function gives each value its own delay, e.g. a
   * longer one for "no face" so brief detection gaps never show.
   */
  delayMs?: number | ((value: T) => number);
  /** How long a shown value stays at least, in ms (default 1200). */
  minHoldMs?: number;
}

/**
 * A value that only changes once the reported value has been steady for a
 * while, and then stays for a while: what the person sees doesn't flip
 * with every flickering detection.
 */
export interface SettledValue<T> {
  /** Reports this detection's value at time `now` (ms) and returns the shown value. */
  update: (value: T, now: number) => T;
  /** Shows a value straight away (e.g. success or error), from `now`. */
  force: (value: T, now: number) => T;
  /** The shown value. */
  readonly value: T;
  /** Shows `value` and forgets any pending change. */
  reset: (value: T) => void;
}
