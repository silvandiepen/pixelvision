import type { AdaptiveThresholdOptions } from "../imgproc/adaptiveThreshold.model";
import type { Point } from "../math/transforms.model";

/**
 * How {@link vectorize} decides which pixels are shape and which are
 * background: `"otsu"` picks a global level automatically, `"adaptive"`
 * compares every pixel with its neighbourhood (for line art and text under
 * uneven light), and a number is a fixed gray level, 0–255.
 */
export type VectorizeThreshold = "otsu" | "adaptive" | number;

/** Options for snapping near-straight outline runs to exact straight lines. */
export interface SnapLinesOptions {
  /** Shortest run, in pixels, that is snapped to a straight line (default 20). */
  minLength?: number;
}

/** Options for {@link vectorize}. */
export interface VectorizeOptions {
  /**
   * How pixels are split into shape and background (default `"otsu"`).
   * Pixels at or below the level are shape: dark shapes on a light ground.
   * Ignored when `colors` is set.
   */
  threshold?: VectorizeThreshold;
  /**
   * Neighbourhood and offset for `threshold: "adaptive"` (default block
   * size 25, offset 10, plain mean).
   */
  adaptive?: Pick<AdaptiveThresholdOptions, "blockSize" | "offset" | "method">;
  /** Trace the light parts instead of the dark ones (default `false`). */
  invert?: boolean;
  /**
   * Shapes and holes enclosing fewer pixels than this are dropped: specks
   * disappear and pinholes are filled (default 2, or 16 with `colors`, where
   * anti-aliased edges leave more specks of in-between colours).
   */
  minArea?: number;
  /**
   * Largest distance, in pixels, between the traced outline and the curves
   * or lines that replace it (default 0.5). Smaller follows the pixels more
   * closely; larger gives fewer, smoother segments.
   */
  tolerance?: number;
  /**
   * How sharply the outline must change direction, in degrees, to stay a
   * sharp corner (default 60). Turns gentler than this are rounded off with
   * curves; 0 keeps every corner sharp, 180 rounds every corner.
   */
  corners?: number;
  /** Fit cubic Bézier curves (default `true`); `false` gives straight polygons only. */
  curves?: boolean;
  /**
   * Find straight lines with {@link houghLinesP} and draw the outline runs
   * along them as exact straight segments (default `false`). Helps on
   * drawings, diagrams and floor plans, where walls and edges should come out
   * perfectly straight instead of as long, slightly wavy curves.
   */
  snapLines?: boolean | SnapLinesOptions;
  /**
   * Trace in colour: reduce the image to this many colours (a median-cut
   * variant, then a 3x3 majority filter against anti-aliased fringes), trace
   * each colour as its own layer and stack the layers, largest first
   * (2–64; default: black and white).
   */
  colors?: number;
}

/** Start of a subpath. */
export interface MoveSegment {
  type: "M";
  /** The start point. */
  points: [Point];
}

/** A straight line from the current point. */
export interface LineToSegment {
  type: "L";
  /** The end point. */
  points: [Point];
}

/** A cubic Bézier curve from the current point. */
export interface CurveSegment {
  type: "C";
  /** First control point, second control point, end point. */
  points: [Point, Point, Point];
}

/** Closes the subpath back to its start. */
export interface CloseSegment {
  type: "Z";
  points: [];
}

/** One drawing command of a {@link VectorPath}, as in SVG path data. */
export type PathSegment = MoveSegment | LineToSegment | CurveSegment | CloseSegment;

/**
 * One filled shape: its outline followed by the outlines of its holes,
 * each a closed subpath (`M` … `Z`). Holes run the opposite way round to
 * the outline, so both the non-zero and the even-odd fill rule leave them
 * empty.
 */
export interface VectorPath {
  /** The subpaths: the outline first, then each hole. */
  segments: PathSegment[];
  /** Number of holes. */
  holes: number;
  /** Fill colour as `#rrggbb` in colour mode; absent in black and white. */
  color?: string;
}

/** Options for {@link VectorImage.toSvg}. */
export interface SvgOptions {
  /** Decimal places kept in coordinates (default 1). */
  precision?: number;
  /** Fill colour for black-and-white paths (default black). */
  fill?: string;
}

/** Result of {@link vectorize}. */
export interface VectorImage {
  /** Filled shapes, in drawing order. */
  paths: VectorPath[];
  /** Width of the source image in pixels. */
  width: number;
  /** Height of the source image in pixels. */
  height: number;
  /**
   * Writes the paths as a compact SVG document, one `<path>` per shape.
   *
   * @param options - Coordinate precision and fill colour.
   * @returns The SVG markup.
   * @throws {RangeError} When `precision` isn't a whole number from 0 to 6.
   */
  toSvg(options?: SvgOptions): string;
}
