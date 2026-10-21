/** Options for {@link matchDescriptors}. */
export interface MatchOptions {
  /** Ignore matches whose Hamming distance is above this (default 64 of 256 bits). */
  maxDistance?: number;
  /**
   * Keep a match only when the best distance is below `ratio` times the
   * second best (Lowe's ratio test; default 1, which disables it).
   */
  ratio?: number;
  /** Keep a match only when it's also the best match in the other direction (default `false`). */
  crossCheck?: boolean;
}

/** A descriptor match between two sets. */
export interface DescriptorMatch {
  /** Row in the query set. */
  query: number;
  /** Row in the train set. */
  train: number;
  /** Hamming distance in bits. */
  distance: number;
}
