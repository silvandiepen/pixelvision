/** One weak classifier: compares pixel sets across three pyramid levels. */
export interface BbfFeature {
  size: number;
  /** Positive pixels: column, row and pyramid level (0 = full, 1 = half, 2 = quarter; -1 unused). */
  px: readonly number[];
  py: readonly number[];
  pz: readonly number[];
  /** Negative pixels, same layout. */
  nx: readonly number[];
  ny: readonly number[];
  nz: readonly number[];
}

/** One stage of a BBF cascade. */
export interface BbfStage {
  count: number;
  threshold: number;
  feature: readonly BbfFeature[];
  /** Score pairs per feature: `[ifFalse, ifTrue]`. */
  alpha: readonly number[];
}

/** A Brightness Binary Feature cascade (libccv / jsfeat format). */
export interface BbfCascade {
  count: number;
  width: number;
  height: number;
  stage_classifier: readonly BbfStage[];
}

/** Options for {@link detectBbf}. */
export interface BbfOptions {
  /** Scales per octave (default 4). More finds more sizes, slower. */
  interval?: number;
  /** Smallest object width and height in pixels (default twice the cascade window). */
  minSize?: number;
  /** Minimum raw detections per result; 0 returns them ungrouped (default 1). */
  minNeighbors?: number;
}
