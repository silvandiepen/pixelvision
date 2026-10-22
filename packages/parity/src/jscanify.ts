// A port of jscanify 1.4.3's paper detection (`findPaperContour` and
// `getCornerPoints` in src/jscanify-node.js), so pixelvision's findDocument can
// be compared with it on the same photos.
//
// jscanify: https://github.com/puffinsoft/jscanify
// (c) ColonelParrot and other contributors, MIT License.
//
// The npm package can't run here as is: it requires the native `canvas`
// package and `jsdom` when it loads, reads its own bundled OpenCV.js into a
// module-level variable, and only accepts images through `cv.imread` on a
// canvas. The two functions below are its whole detection; they run on the
// OpenCV.js 4.12 the parity tests already load, on the RGBA Mat `cv.imread`
// would produce. The steps, parameters and corner rule are unchanged.

import { fromImageData } from "pixelvision";
import type { Point } from "pixelvision";
import type { Fixture } from "./fixtures.model";
import type { OpenCv } from "./opencv";
import { toMat } from "./opencv";

/** jscanify's corners, or undefined where its rule found none. */
export interface JscanifyCorners {
  topLeftCorner?: Point;
  topRightCorner?: Point;
  bottomRightCorner?: Point;
  bottomLeftCorner?: Point;
}

/**
 * jscanify's `findPaperContour`: Canny (50, 200), a 3 × 3 Gaussian blur,
 * Otsu threshold, then the contour with the largest area.
 *
 * @param cv - OpenCV namespace.
 * @param image - RGBA Mat, as `cv.imread` returns it.
 * @returns The largest contour (caller deletes it), or null without one.
 */
const findPaperContour = (cv: OpenCv, image: OpenCv): OpenCv | null => {
  const imgGray = new cv.Mat();
  cv.Canny(image, imgGray, 50, 200);
  const imgBlur = new cv.Mat();
  cv.GaussianBlur(imgGray, imgBlur, new cv.Size(3, 3), 0, 0, cv.BORDER_DEFAULT);
  const imgThresh = new cv.Mat();
  cv.threshold(imgBlur, imgThresh, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU);
  const contours = new cv.MatVector();
  const hierarchy = new cv.Mat();
  cv.findContours(imgThresh, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
  let maxArea = 0;
  let maxContourIndex = -1;
  for (let i = 0; i < contours.size(); ++i) {
    const contour = contours.get(i);
    const area = cv.contourArea(contour);
    contour.delete();
    if (area > maxArea) {
      maxArea = area;
      maxContourIndex = i;
    }
  }
  const maxContour = maxContourIndex >= 0 ? contours.get(maxContourIndex) : null;
  imgGray.delete();
  imgBlur.delete();
  imgThresh.delete();
  contours.delete();
  hierarchy.delete();
  return maxContour;
};

/**
 * jscanify's `getCornerPoints`: in each quadrant around the centre of the
 * contour's minimum-area rectangle, the contour point farthest from it.
 *
 * @param cv - OpenCV namespace.
 * @param contour - From {@link findPaperContour}.
 * @returns The corners found.
 */
const getCornerPoints = (cv: OpenCv, contour: OpenCv): JscanifyCorners => {
  const center: Point = cv.minAreaRect(contour).center;
  const corners: JscanifyCorners = {};
  const best = { tl: 0, tr: 0, bl: 0, br: 0 };
  const data: Int32Array = contour.data32S;
  for (let i = 0; i < data.length; i += 2) {
    const point = { x: data[i], y: data[i + 1] };
    const dist = Math.hypot(point.x - center.x, point.y - center.y);
    if (point.x < center.x && point.y < center.y) {
      if (dist > best.tl) [corners.topLeftCorner, best.tl] = [point, dist];
    } else if (point.x > center.x && point.y < center.y) {
      if (dist > best.tr) [corners.topRightCorner, best.tr] = [point, dist];
    } else if (point.x < center.x && point.y > center.y) {
      if (dist > best.bl) [corners.bottomLeftCorner, best.bl] = [point, dist];
    } else if (point.x > center.x && point.y > center.y) {
      if (dist > best.br) [corners.bottomRightCorner, best.br] = [point, dist];
    }
  }
  return corners;
};

/**
 * Finds a document's corners the way jscanify 1.4.3 does, on full-size
 * RGBA pixels.
 *
 * @param cv - OpenCV namespace.
 * @param photo - RGBA photo.
 * @returns Top-left, top-right, bottom-right and bottom-left corners, or null
 *   when jscanify finds no contour or leaves a corner undefined.
 */
export const jscanifyCorners = (cv: OpenCv, photo: Fixture): Point[] | null => {
  const image = toMat(cv, fromImageData(photo));
  try {
    const contour = findPaperContour(cv, image);
    if (!contour) return null;
    const c = getCornerPoints(cv, contour);
    contour.delete();
    const corners = [c.topLeftCorner, c.topRightCorner, c.bottomRightCorner, c.bottomLeftCorner];
    return corners.every((p) => p !== undefined) ? (corners as Point[]) : null;
  } finally {
    image.delete();
  }
};
