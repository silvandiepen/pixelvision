import type { Box, Guide } from "./geometry.model";

/** Options for {@link selectMainFace}. */
export interface FaceSelectionOptions {
  /**
   * Faces narrower than this fraction of the largest face's width are
   * ignored, such as a small face on a poster far behind the person
   * (default 0.4, kept between 0 and 1). `0` counts every face; `1` only
   * faces as wide as the largest.
   */
  ratio?: number;
}

/** Which face the selfie flow follows, and how many faces of a meaningful size are in view. */
export interface FaceSelection {
  /** Index of the main face in the list, or -1 when the list is empty. */
  index: number;
  /** Faces of a meaningful size, the main face included; 0 without a face. */
  count: number;
}

/** Options for {@link followFace}. */
export interface FollowFaceOptions extends FaceSelectionOptions {
  /** The face guide, in view pixels. */
  guide: Guide;
  /** Maps a box in the source frame's pixels to view pixels. */
  toView: (box: Box) => Box;
}

/** The face the selfie flow follows in one detection. */
export interface FollowedFace {
  /** The followed face in the source frame's pixels, when there is a face. */
  box?: Box;
  /** The followed face in view pixels, when there is a face. */
  viewBox?: Box;
  /** Faces of a meaningful size, the followed face included; 0 without a face. */
  count: number;
  /**
   * Whether the followed face is the source's own face (`box`), which the
   * observation's `pose`, `landmarks`, `score` and `yaw` describe.
   */
  own: boolean;
}
