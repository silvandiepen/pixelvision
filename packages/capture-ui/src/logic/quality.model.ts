/** How a region of a detection frame looks, measured on a fixed-size copy of it. */
export interface QualityAssessment {
  /**
   * Laplacian variance of the region resampled to 96 pixels on its long side.
   * Higher is crisper; blur from motion or focus lowers it.
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
