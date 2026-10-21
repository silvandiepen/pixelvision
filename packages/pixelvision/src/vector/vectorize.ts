import { assertChannels, assertType } from "../core/assert";
import { createMatrix } from "../core/matrix";
import type { Matrix, RGBAImage } from "../core/matrix.model";
import { adaptiveThreshold } from "../imgproc/adaptiveThreshold";
import { grayscale } from "../imgproc/grayscale";
import type { LineSegment } from "../imgproc/houghLinesP.model";
import { threshold } from "../imgproc/threshold";
import { fitLoop } from "./fit";
import type { FitSettings } from "./fit.model";
import { connectedComponents } from "../shape/connectedComponents";
import { posterize, unmixEdges } from "./posterize";
import { detectLines, straightSpans } from "./snap";
import { recognizeShape, shapeSegments } from "./recognize";
import type { RecognizeSettings } from "./recognize.model";
import { writeSvg } from "./svg";
import { edgeMidpoints, groupShapes, traceLoops } from "./trace";
import type {
  ShapeKind,
  VectorImage,
  VectorizeOptions,
  VectorPath,
  VectorShape,
} from "./vectorize.model";

/** Every primitive, the default for `shapes.kinds`. */
const KINDS: readonly ShapeKind[] = ["circle", "ellipse", "rect", "polygon"];

/**
 * Traces the shapes of a mask as filled shapes: each recognised as a
 * primitive when `recognize` is set and it matches one, otherwise fitted as
 * a path.
 *
 * @param mask - Single-channel `u8` matrix; non-zero pixels are shape.
 * @param settings - Fitting settings.
 * @param minArea - Smallest shape or hole kept, in pixels.
 * @param snapLength - Shortest run snapped to a straight line, or 0 to not snap.
 * @param recognize - Settings for recognising primitives, or `null` to fit paths only.
 * @param layer - In colour mode: the layer's fill colour, and which pixels are its own colour.
 *   Shapes without a pixel of their own (wholly covered by the layers above) are left out.
 * @returns One shape per traced shape, with its holes.
 */
const traceMask = (
  mask: Matrix<"u8">,
  settings: FitSettings,
  minArea: number,
  snapLength: number,
  recognize: RecognizeSettings | null,
  layer?: { color: string; own: Uint8Array },
): VectorShape[] => {
  const lines: LineSegment[] = snapLength > 0 ? detectLines(mask, snapLength) : [];
  const labels = connectedComponents(mask).labels.data;
  const shapes = groupShapes(traceLoops(mask, labels), minArea);
  const visible = layer && new Set(labels.filter((_, p) => layer.own[p] !== 0));
  return shapes
    .filter(({ outline }) => !visible || visible.has(outline.label))
    .flatMap(({ outline, holes }): VectorShape[] => {
      const loops = [outline, ...holes].map((loop) => ({
        samples: edgeMidpoints(loop.vertices),
        area: loop.area,
      }));
      const shape = recognize && recognizeShape(loops, recognize);
      if (shape) return [layer ? { ...shape, color: layer.color } : shape];
      const [outer, ...inner] = loops.map(({ samples }) => {
        const spans = snapLength > 0 ? straightSpans(samples, lines, snapLength) : [];
        return fitLoop(samples, settings, spans);
      });
      // A subpath of a single line (M, L, Z) encloses nothing: a sliver the
      // tolerance flattened away. It isn't drawn.
      if (outer.length <= 3) return [];
      const kept = inner.filter((subpath) => subpath.length > 3);
      const segments = [...outer, ...kept.flat()];
      const path: VectorShape = { kind: "path", segments, holes: kept.length };
      return [layer ? { ...path, color: layer.color } : path];
    });
};

/**
 * Checks that an option is a number within a range.
 *
 * @param name - Option name.
 * @param value - Its value.
 * @param min - Smallest allowed value.
 * @param max - Largest allowed value.
 * @param exclusiveMin - Whether `min` itself is out of range.
 * @throws {RangeError} When it's outside the range.
 */
const assertRange = (
  name: string,
  value: number,
  min: number,
  max: number,
  exclusiveMin = false,
) => {
  if (!(value >= min && value <= max) || (exclusiveMin && value === min)) {
    const upper = max === Infinity ? "" : ` and at most ${max}`;
    throw new RangeError(
      `vectorize: ${name} must be ${exclusiveMin ? "above" : "at least"} ${min}${upper}, got ${value}`,
    );
  }
};

/**
 * Turns a raster image into vector shapes, Potrace-style: the image is split
 * into shape and background, every boundary is traced along the pixel
 * edges (outlines and holes, so letters keep their counters), sharp corners
 * are kept, and the rest is fitted with cubic Bézier curves within
 * `tolerance` pixels. Optionally, near-straight runs are snapped to exact
 * lines found with {@link houghLinesP}, the image is traced in colour as
 * stacked layers, or shapes are recognised as circles, ellipses,
 * rectangles and polygons and drawn as those elements.
 *
 * Every shape becomes one path whose first subpath is its outline and the
 * rest its holes; holes run the opposite way round, so they stay empty under
 * either fill rule. Coordinates are in pixels, with pixel `(x, y)` covering
 * `x`–`x + 1` and `y`–`y + 1`.
 *
 * @param image - A gray `u8` matrix, an RGB or RGBA `u8` matrix, or `ImageData`. Transparent pixels count as white.
 * @param options - Threshold, inversion, speck size, tolerance, corners, curves, line snapping, colours and shape recognition.
 * @returns The paths, the shapes (primitives where recognised), the image size and `toSvg()` to write them as an SVG document.
 * @throws {TypeError} When a matrix isn't `u8`.
 * @throws {RangeError} When it doesn't have 1, 3 or 4 channels, or an option is out of range.
 *
 * @example
 * const logo = vectorize(context.getImageData(0, 0, width, height), { tolerance: 0.75 });
 * const svg = logo.toSvg({ precision: 1, fill: "#1d4ed8" });
 *
 * @example
 * // A floor plan: walls as exact straight lines, no curves.
 * const plan = vectorize(gray, { threshold: "adaptive", curves: false, snapLines: true });
 *
 * @example
 * // A flat logo in colour, with its circles, rectangles and triangles drawn
 * // as <circle>, <rect> and <polygon> elements of exact size.
 * const { shapes, toSvg } = vectorize(imageData, { colors: 4, shapes: true });
 * const discs = shapes.filter((shape) => shape.kind === "circle");
 */
export function vectorize(
  image: Matrix<"u8"> | RGBAImage,
  options: VectorizeOptions = {},
): VectorImage {
  const { width, height } = image;
  const channels = "type" in image ? image.channels : 4;
  if ("type" in image) {
    assertType("vectorize", image, "u8");
    assertChannels("vectorize", image, 1, 3, 4);
  }
  const tolerance = options.tolerance ?? 0.5;
  const corners = options.corners ?? 60;
  const minArea = options.minArea ?? (options.colors === undefined ? 2 : 16);
  const snap = options.snapLines ?? false;
  const snapLength = snap === false ? 0 : snap === true ? 20 : (snap.minLength ?? 20);
  assertRange("tolerance", tolerance, 0, Infinity, true);
  assertRange("corners", corners, 0, 180);
  assertRange("minArea", minArea, 0, Infinity);
  if (snap !== false) assertRange("snapLines.minLength", snapLength, 1, Infinity);
  const shapes = options.shapes ?? false;
  const recognize: RecognizeSettings | null =
    shapes === false
      ? null
      : {
          tolerance: shapes === true ? 1 : (shapes.tolerance ?? 1),
          kinds: new Set(shapes === true ? KINDS : (shapes.kinds ?? KINDS)),
        };
  if (recognize) assertRange("shapes.tolerance", recognize.tolerance, 0, Infinity, true);
  const settings: FitSettings = {
    tolerance,
    cornerAngle: (corners * Math.PI) / 180,
    curves: options.curves ?? true,
  };

  // RGB, with transparency composited over white.
  const pixels = width * height;
  const rgb = new Uint8Array(pixels * 3);
  for (let p = 0; p < pixels; p++) {
    const alpha = channels === 4 ? image.data[p * 4 + 3] / 255 : 1;
    for (let c = 0; c < 3; c++) {
      const value = image.data[p * channels + (channels === 1 ? 0 : c)];
      rgb[p * 3 + c] = Math.round(255 - (255 - value) * alpha);
    }
  }

  const traced: VectorShape[] = [];
  if (options.colors === undefined) {
    const gray = grayscale({ width, height, data: rgb, channels: 3 });
    const level = options.threshold ?? "otsu";
    // Shape is dark by default, so the threshold keeps pixels at or below the level.
    const mask =
      level === "adaptive"
        ? adaptiveThreshold(gray, {
            blockSize: 25,
            offset: 10,
            ...options.adaptive,
            invert: !options.invert,
          })
        : threshold(gray, { level: level === "otsu" ? undefined : level, invert: !options.invert });
    traced.push(...traceMask(mask, settings, minArea, snapLength, recognize));
  } else {
    const count = options.colors;
    if (!Number.isInteger(count) || count < 2 || count > 64) {
      throw new RangeError(`vectorize: colors must be a whole number from 2 to 64, got ${count}`);
    }
    const { palette, labels: nearest } = posterize(rgb, count);
    const labels = unmixEdges(rgb, nearest, palette, width, height);
    // Largest colour at the bottom (the sort is stable, so ties keep palette
    // order). Each layer also covers the pixels of every layer above it, so
    // neighbouring layers overlap instead of leaving gaps.
    const counts = palette.map(() => 0);
    for (const label of labels) counts[label]++;
    const order = palette.map((_, i) => i).sort((a, b) => counts[b] - counts[a]);
    const rank = new Uint8Array(palette.length);
    order.forEach((entry, r) => (rank[entry] = r));
    const mask = createMatrix(width, height);
    const own = new Uint8Array(pixels);
    order.forEach((entry, r) => {
      for (let p = 0; p < pixels; p++) {
        mask.data[p] = rank[labels[p]] >= r ? 255 : 0;
        own[p] = rank[labels[p]] === r ? 1 : 0;
      }
      const color = `#${palette[entry].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
      traced.push(...traceMask(mask, settings, minArea, snapLength, recognize, { color, own }));
    });
  }
  const paths = traced.map((shape): VectorPath => {
    const { segments, holes } = shapeSegments(shape);
    return shape.color ? { segments, holes, color: shape.color } : { segments, holes };
  });
  return {
    paths,
    shapes: traced,
    width,
    height,
    toSvg: (svgOptions) => writeSvg(traced, width, height, svgOptions),
  };
}
