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

/**
 * A primitive {@link vectorize} can recognise: a circle (and a ring, two
 * concentric circles), an ellipse at any angle, a rectangle at any angle
 * (with rounded corners, which includes a stadium or pill), or a polygon of
 * 3 to 8 corners.
 */
export type ShapeKind = "circle" | "ellipse" | "rect" | "polygon";

/** Options for recognising primitive shapes. */
export interface ShapesOptions {
  /**
   * Largest distance, in pixels, between any point of the traced outline and
   * the primitive that replaces it (default 1). It's a fixed distance, not a
   * share of the shape's size: the traced outline's error comes from the
   * pixel grid (up to half a pixel, plus anti-aliasing), which is the same
   * for a small shape and a large one.
   */
  tolerance?: number;
  /** Which primitives to look for (default all of them). */
  kinds?: ShapeKind[];
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
   * variant), trace each colour as its own layer and stack the layers,
   * largest first (2–64; default: black and white). Anti-aliased pixels
   * along an edge are recognised as blends of the colours either side and
   * split at half coverage, so edges and corners come out where they are in
   * black and white, not as a fringe of some third colour.
   */
  colors?: number;
  /**
   * Recognise primitive shapes and draw them as what they are (default
   * `false`). Each traced outline is matched against a circle, an ellipse,
   * a rectangle (sharp or rounded) and a polygon of 3 to 8 corners, simplest
   * first, and takes the first that stays within `tolerance` of every point
   * of it. The SVG then has a `<circle>`, `<ellipse>`, `<rect>` or
   * `<polygon>` instead of a path of many points, with exact corners and
   * radii. A ring (a circle with a concentric circular hole) becomes one
   * stroked `<circle>`; other shapes whose holes are primitives too become
   * one `<path>` of arcs and lines under the even-odd rule. Anything else,
   * letters and freeform outlines, stays a fitted path. Recognised
   * primitives are drawn curved even with `curves: false`.
   */
  shapes?: boolean | ShapesOptions;
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

/** A circle, or with `strokeWidth` a ring: a circle stroked that wide, unfilled. */
export interface CircleShape {
  kind: "circle";
  /** Centre x. */
  cx: number;
  /** Centre y. */
  cy: number;
  /** Radius; for a ring, the radius of the middle of its band. */
  r: number;
  /** For a ring: the width of its band, the outer radius minus the inner. */
  strokeWidth?: number;
  /** Colour as `#rrggbb` in colour mode. */
  color?: string;
}

/** An ellipse, turned by `angle` about its centre. */
export interface EllipseShape {
  kind: "ellipse";
  /** Centre x. */
  cx: number;
  /** Centre y. */
  cy: number;
  /** Radius along the ellipse's own x axis. */
  rx: number;
  /** Radius along its own y axis. */
  ry: number;
  /** Rotation in degrees, clockwise on screen, from -45 to 45. */
  angle: number;
  /** Colour as `#rrggbb` in colour mode. */
  color?: string;
}

/**
 * A rectangle, possibly with rounded corners, turned by `angle` about its
 * centre. `x` and `y` are its top-left corner before turning, as in SVG.
 */
export interface RectShape {
  kind: "rect";
  /** Left edge before turning. */
  x: number;
  /** Top edge before turning. */
  y: number;
  width: number;
  height: number;
  /** Corner radius, 0 for sharp corners; half the height for a pill. */
  rx: number;
  /** Rotation in degrees, clockwise on screen, from -45 to 45. */
  angle: number;
  /** Colour as `#rrggbb` in colour mode. */
  color?: string;
}

/** A polygon of 3 to 8 corners, placed where its fitted sides meet. */
export interface PolygonShape {
  kind: "polygon";
  /** The corners, in order round the outline. */
  points: Point[];
  /** Colour as `#rrggbb` in colour mode. */
  color?: string;
}

/** A recognised primitive. */
export type PrimitiveShape = CircleShape | EllipseShape | RectShape | PolygonShape;

/**
 * A shape drawn as a path: a traced and fitted outline (with its holes), or,
 * with `parts`, an outline and holes that are each a primitive.
 */
export interface PathShape {
  kind: "path";
  /** The subpaths: the outline first, then each hole. */
  segments: PathSegment[];
  /** Number of holes. */
  holes: number;
  /**
   * When the outline and every hole are primitives: those, outline first.
   * The SVG draws them with arcs and lines under the even-odd rule.
   */
  parts?: PrimitiveShape[];
  /** Colour as `#rrggbb` in colour mode. */
  color?: string;
}

/** One shape of a {@link VectorImage}: a primitive, or a path. */
export type VectorShape = PrimitiveShape | PathShape;

/** Options for {@link VectorImage.toSvg}. */
export interface SvgOptions {
  /** Decimal places kept in coordinates (default 1). */
  precision?: number;
  /** Fill colour for black-and-white paths (default black). */
  fill?: string;
}

/** Result of {@link vectorize}. */
export interface VectorImage {
  /**
   * Filled shapes, in drawing order, as path segments. With `shapes`, a
   * recognised primitive is here as its exact outline: a circle or ellipse
   * as four cubic curves, a rectangle as lines and (for rounded corners)
   * quarter-circle curves, a ring as two circles.
   */
  paths: VectorPath[];
  /**
   * The same shapes, one for each path and in the same order: each
   * recognised primitive with its parameters (`kind` `"circle"`,
   * `"ellipse"`, `"rect"` or `"polygon"`), everything else `"path"`.
   * Without the `shapes` option every item is a `"path"`.
   */
  shapes: VectorShape[];
  /** Width of the source image in pixels. */
  width: number;
  /** Height of the source image in pixels. */
  height: number;
  /**
   * Writes the shapes as a compact SVG document: one element per shape, a
   * `<circle>`, `<ellipse>`, `<rect>` or `<polygon>` for a recognised
   * primitive and a `<path>` for everything else.
   *
   * @param options - Coordinate precision and fill colour.
   * @returns The SVG markup.
   * @throws {RangeError} When `precision` isn't a whole number from 0 to 6.
   */
  toSvg(options?: SvgOptions): string;
}
