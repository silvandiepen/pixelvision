import type { Matrix } from "../core/matrix.model";
import { roundHalfEven } from "../core/round";
import type { Point } from "../math/transforms.model";
import type { Rect, RotatedRect } from "../shape/shapes.model";
import type { CamShiftResult, MeanShiftOptions } from "./meanShift.model";
import { meanShift, readSearch, windowMoments } from "./meanShift";

// Pixels the window grows by on each side before the object is measured.
const MARGIN = 10;

/**
 * Corners of a rotated rectangle, in the order OpenCV's `RotatedRect::points`
 * gives them.
 *
 * @param center - Centre.
 * @param width - Side along `angle`.
 * @param height - Side across `angle`.
 * @param angle - Direction of `width`, in degrees.
 * @returns Four corners.
 */
const corners = (
  center: Point,
  width: number,
  height: number,
  angle: number,
): RotatedRect["corners"] => {
  const radians = (angle * Math.PI) / 180;
  const b = Math.cos(radians) * 0.5;
  const a = Math.sin(radians) * 0.5;
  const p0 = { x: center.x - a * height - b * width, y: center.y + b * height - a * width };
  const p1 = { x: center.x + a * height - b * width, y: center.y - b * height - a * width };
  return [
    p0,
    p1,
    { x: 2 * center.x - p0.x, y: 2 * center.y - p0.y },
    { x: 2 * center.x - p1.x, y: 2 * center.y - p1.y },
  ];
};

/**
 * Tracks an object and measures its size and orientation, as OpenCV's
 * `CamShift` (continuously adaptive mean shift): {@link meanShift} finds
 * the object, then the window grows by 10 pixels on each side and the
 * object's second moments under it give a rotated box: the long axis is
 * `height`, the short axis `width`, each four standard deviations of the
 * probability mass, so a uniform ellipse gets exactly its own axes. The
 * returned window fits that box, so it follows the object as it grows,
 * shrinks or turns; pass it in again for the next frame.
 *
 * The window is identical to OpenCV's, and the box's size and angle agree
 * with OpenCV's to single precision. The box's centre is the centroid of
 * the probability. OpenCV reports the centre of its whole-pixel window
 * instead, which is up to a pixel away from the centroid, and much further
 * when the window is pushed against the left or top edge of the image.
 *
 * @param probability - Single-channel `u8` matrix: how likely each pixel is part of the object.
 * @param window - Where to start; whole pixels, positive size.
 * @param options - When the mean-shift search stops.
 * @returns The rotated box, the next search window and the mean-shift iteration count.
 * @throws {TypeError} When the image isn't `u8`.
 * @throws {RangeError} When the image has more than one channel, the window isn't whole numbers with a positive size, or a stopping option is invalid.
 *
 * @example
 * let window = { x: 100, y: 80, width: 60, height: 60 };
 * // Each frame:
 * const result = camShift(calcBackProject(rgbToHsv(frame), hueHistogram, backProjectOptions), window);
 * window = result.window;
 * drawPolygon(result.box.corners);
 */
export function camShift(
  probability: Matrix<"u8">,
  window: Rect,
  options: MeanShiftOptions = {},
): CamShiftResult {
  readSearch("camShift", probability, window, options);
  const { width: imageWidth, height: imageHeight } = probability;
  const found = meanShift(probability, window, options);

  // Grow the window by the margin, inside the image.
  const grown = { ...found.window };
  grown.x = Math.max(grown.x - MARGIN, 0);
  grown.y = Math.max(grown.y - MARGIN, 0);
  grown.width = Math.min(grown.width + 2 * MARGIN, imageWidth - grown.x);
  grown.height = Math.min(grown.height + 2 * MARGIN, imageHeight - grown.y);

  const m = windowMoments(probability, grown);
  if (m.m00 === 0) {
    const zero = { x: 0, y: 0 };
    return {
      box: { center: zero, width: 0, height: 0, angle: 0, corners: [zero, zero, zero, zero] },
      window: grown,
      iterations: found.iterations,
    };
  }
  const inverseM00 = 1 / m.m00;
  // Central moments, as OpenCV completes them.
  const cx = m.m10 * inverseM00;
  const cy = m.m01 * inverseM00;
  const mu20 = m.m20 - m.m10 * cx;
  const mu11 = m.m11 - m.m10 * cy;
  const mu02 = m.m02 - m.m01 * cy;
  const xc = roundHalfEven(m.m10 * inverseM00 + grown.x);
  const yc = roundHalfEven(m.m01 * inverseM00 + grown.y);
  const a = mu20 * inverseM00;
  const b = mu11 * inverseM00;
  const c = mu02 * inverseM00;
  const square = Math.sqrt(4 * b * b + (a - c) * (a - c));
  let theta = Math.atan2(2 * b, a - c + square);
  let cs = Math.cos(theta);
  let sn = Math.sin(theta);
  const rotateA = Math.max(0, cs * cs * mu20 + 2 * cs * sn * mu11 + sn * sn * mu02);
  const rotateC = Math.max(0, sn * sn * mu20 - 2 * cs * sn * mu11 + cs * cs * mu02);
  let length = Math.sqrt(rotateA * inverseM00) * 4;
  let breadth = Math.sqrt(rotateC * inverseM00) * 4;
  // At θ = 0 or π/2 the two axes can come out swapped.
  if (length < breadth) {
    [length, breadth] = [breadth, length];
    [cs, sn] = [sn, cs];
    theta = Math.PI * 0.5 - theta;
  }

  // The next search window: the box's extent, plus 2, around the rounded centre.
  const next = { x: 0, y: 0, width: 0, height: 0 };
  next.width = Math.min(
    Math.max(roundHalfEven(Math.abs(length * cs)), roundHalfEven(Math.abs(breadth * sn))) + 2,
    (imageWidth - xc) * 2,
  );
  next.height = Math.min(
    Math.max(roundHalfEven(Math.abs(length * sn)), roundHalfEven(Math.abs(breadth * cs))) + 2,
    (imageHeight - yc) * 2,
  );
  next.x = Math.max(0, xc - Math.trunc(next.width / 2));
  next.y = Math.max(0, yc - Math.trunc(next.height / 2));
  next.width = Math.min(imageWidth - next.x, next.width);
  next.height = Math.min(imageHeight - next.y, next.height);

  // θ is in [−π/2, π/2] (or [0, π] after the swap), so the angle is in
  // [0°, 270°); fold it into [0°, 180°).
  let angle = ((Math.PI * 0.5 + theta) * 180) / Math.PI;
  if (angle >= 180) angle -= 180;
  const center = { x: cx + grown.x, y: cy + grown.y };
  return {
    box: {
      center,
      width: breadth,
      height: length,
      angle,
      corners: corners(center, breadth, length, angle),
    },
    window: next,
    iterations: found.iterations,
  };
}
