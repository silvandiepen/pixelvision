/** Options for {@link detectYape}. */
export interface YapeOptions {
  /** Radius of the sampling circle in pixels, clamped to 3–7 (default 5). */
  radius?: number;
  /** Brightness tolerance for "similar to the centre" (default 7). */
  tau?: number;
  /** Pixels to skip at each edge; at least `radius + 1` (default 4). */
  border?: number;
}
