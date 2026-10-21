/** One weak classifier (a tree of Haar-like rectangle features). */
export interface HaarTree {
  /** Rectangles `[x, y, width, height, weight]` in window coordinates. */
  features: ReadonlyArray<readonly [number, number, number, number, number]>;
  /** Normalised feature threshold. */
  threshold: number;
  /** Stage score when the feature sum is below the threshold. */
  left_val: number;
  /** Stage score otherwise. */
  right_val: number;
  /** `1` when the features are rotated 45°. */
  tilted?: number;
}

/** One stage: the window passes when its trees' scores sum to at least `threshold`. */
export interface HaarStage {
  threshold: number;
  simpleClassifiers: readonly HaarTree[];
}

/** A Viola-Jones cascade (jsfeat / js-objectdetect format). */
export interface HaarCascade {
  /** Training window `[width, height]`. */
  size: readonly [number, number];
  /** Whether any tree uses tilted features (needs the tilted integral image). */
  tilted?: boolean;
  complexClassifiers: readonly HaarStage[];
}

/** A detected object. */
export interface Detection {
  x: number;
  y: number;
  width: number;
  height: number;
  /** Number of raw detections merged into this one; more is more certain. */
  neighbors: number;
  /** Score of the best merged detection's last stage. */
  confidence: number;
}

/** Options for {@link detectHaar}. */
export interface HaarOptions {
  /** Window growth between scales (default 1.2). Smaller finds more sizes, slower. */
  scaleFactor?: number;
  /** Smallest scale relative to the cascade window (default 1). */
  minScale?: number;
  /** Minimum raw detections per result; 0 returns them ungrouped (default 1). */
  minNeighbors?: number;
  /**
   * Skip windows with too few Canny edges, a large speed-up: the fraction
   * of edge pixels a window needs (default 0.07), or `false` to disable.
   */
  edgeDensity?: number | false;
}
