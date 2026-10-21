/**
 * One weak classifier: a Haar-like rectangle feature compared with a
 * threshold. Most cascades use single splits (stumps); a tree with more
 * splits continues at `left` or `right` instead of scoring.
 */
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
  /** Split evaluated instead of scoring `left_val` (trees with more than one split). */
  left?: HaarTree;
  /** Split evaluated instead of scoring `right_val`. */
  right?: HaarTree;
}

/** One stage: the window passes when its trees' scores sum to at least `threshold`. */
export interface HaarStage {
  threshold: number;
  simpleClassifiers: readonly HaarTree[];
}

/** A Viola-Jones cascade (js-objectdetect format; {@link loadOpenCvCascade} reads OpenCV's XML). */
export interface HaarCascade {
  /** Training window `[width, height]`. */
  size: readonly [number, number];
  /** Whether any tree uses tilted features (needs the tilted integral image). */
  tilted?: boolean;
  /**
   * Score windows as OpenCV's `CascadeClassifier` does: a window's mean and
   * deviation come from inside a one-pixel border, and at larger sizes each
   * rectangle's weight follows its rounded area, so a feature responds as
   * it would on the image scaled down to the cascade's size.
   * {@link loadOpenCvCascade} sets it; the bundled cascades score over the
   * whole window with their stored weights.
   */
  opencvScoring?: boolean;
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
   * Skip windows with too few Canny edges: the fraction of edge pixels a
   * window needs (default 0.07), or `false` to disable. It pays
   * off on large images with big flat areas; on camera frames of ~320 px
   * the edge map costs more than it saves, and smooth, evenly lit faces
   * can be skipped, so prefer `false` there.
   */
  edgeDensity?: number | false;
}

/** A tree split placed at one scale, ready to score windows. */
export interface ScaledHaarNode {
  /** Whether the rectangles are read from the tilted table. */
  tilted: boolean;
  /** Four integral-table offsets per rectangle, relative to the window's top-left cell. */
  offsets: Int32Array;
  /** One weight per rectangle. */
  weights: Float64Array;
  threshold: number;
  left_val: number;
  right_val: number;
  left?: ScaledHaarNode;
  right?: ScaledHaarNode;
}
