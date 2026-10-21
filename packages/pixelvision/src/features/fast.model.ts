/** Options for {@link detectFast}. */
export interface FastOptions {
  /**
   * Minimum brightness difference between the centre and the circle
   * pixels, 0–255 (default 20). Lower finds more, weaker corners.
   */
  threshold?: number;
  /** Pixels to skip at each edge; at least 3 (default 3). */
  border?: number;
}
