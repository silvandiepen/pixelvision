/** How a region of a detection frame looks, measured on a fixed-size copy of it. */
export interface QualityAssessment {
  /**
   * Edge detail of the region at the measuring size: the Laplacian variance
   * left once its noise-like part is removed, at a contrast of 50 (see
   * `assessRegion`). Higher is crisper; blur from motion or focus lowers it,
   * and sensor noise barely raises it.
   */
  sharpness: number;
  /** Mean luminance of the region, 0–255. */
  brightness: number;
  /** Standard deviation of the region's luminance, 0–127.5. */
  contrast: number;
}

/** Why a frame isn't good enough to keep, or `null` when it is. */
export type QualityIssue = "blurry" | "dark" | "bright" | "flat";

/** Limits a frame must meet to count as good. */
export interface QualityThresholds {
  /** Lowest {@link QualityAssessment.sharpness} (`min-sharpness`). */
  minSharpness: number;
  /** Lowest {@link QualityAssessment.brightness} (`min-brightness`). */
  minBrightness: number;
  /** Highest {@link QualityAssessment.brightness} (`max-brightness`). */
  maxBrightness: number;
  /** Lowest {@link QualityAssessment.contrast} (`min-contrast`). */
  minContrast: number;
}

/** The result of {@link checkQuality}. */
export interface QualityCheck {
  /** The frame passes every threshold. */
  ok: boolean;
  /** The first failed check, in the order dark, bright, flat, blurry; `null` when ok. */
  issue: QualityIssue | null;
}

/** Which element a hint is for. */
export type QualitySubject = "face" | "document";

/** How {@link QualityAssessment.sharpness} is measured; see `FACE_MEASURE` and `DOCUMENT_MEASURE`. */
export interface QualityMeasure {
  /** Long side, in pixels, a larger region is shrunk to; a smaller one is measured as it is. */
  size: number;
  /** Run a 3 × 3 median over the region first, which removes most sensor noise but keeps edges. */
  median: boolean;
  /** How much of the Laplacian's noise-like part to remove, as `robustSharpness`'s `noiseWeight`. */
  noiseWeight: number;
}
