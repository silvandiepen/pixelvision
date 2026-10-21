/**
 * Identifies one camera run (one `start()` until the matching `stop()`). Async work holds the
 * token of the run it belongs to and checks it after every `await`, so work that outlives its run
 * stops instead of touching a stopped or restarted element.
 */
export interface RunToken {
  /** True until the run is cancelled or a newer run begins. */
  readonly current: boolean;
  /** Aborted when the run ends, for APIs that take an `AbortSignal`. */
  readonly signal: AbortSignal;
}

/** Hands out run tokens; beginning a new run or cancelling ends the previous one. */
export interface RunCounter {
  /**
   * Ends the current run, if any, and begins a new one.
   *
   * @returns The new run's token.
   */
  begin(): RunToken;
  /** Ends the current run without beginning another. Safe to call repeatedly. */
  cancel(): void;
}
