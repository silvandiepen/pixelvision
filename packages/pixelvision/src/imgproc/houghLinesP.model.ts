import type { Point } from "../math/transforms.model";

/** Options for {@link houghLinesP}. */
export interface HoughLinesPOptions {
  /** Distance resolution in pixels (default 1). */
  rhoStep?: number;
  /** Angle resolution in radians (default 1°, `Math.PI / 180`). */
  thetaStep?: number;
  /** Votes a line needs before a segment is traced along it (default 50). */
  threshold?: number;
  /** Shortest segment kept, in pixels along x or y (default 0). */
  minLineLength?: number;
  /** Longest run of missing edge pixels bridged within one segment (default 0). */
  maxLineGap?: number;
  /** Stop after this many segments (default: no limit). */
  maxLines?: number;
  /**
   * Seed of the generator that picks the order in which edge pixels vote, a
   * whole number from 0 to 2^53 − 1. The same image, options and seed always
   * give the same segments. Default: the state OpenCV starts from.
   */
  seed?: number;
}

/** A line segment between two pixels, both on the edge it was traced along. */
export interface LineSegment {
  /** One end. */
  from: Point;
  /** The other end. */
  to: Point;
}
