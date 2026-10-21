import type { Example } from "./example.model";
import { affineTransformExample } from "./affine-transform";
import { approxPolygonExample } from "./approx-polygon";
import { arcLengthExample } from "./arc-length";
import { boxBlurExample } from "./box-blur";
import { boxSumExample } from "./box-sum";
import { buildPyramidExample } from "./build-pyramid";
import { cannyExample } from "./canny";
import { choleskySolveExample } from "./cholesky-solve";
import { cloneMatrixExample } from "./clone-matrix";
import { contourAreaExample } from "./contour-area";
import { createMatrixExample } from "./create-matrix";
import { describeOrbExample } from "./describe-orb";
import { detectBbfExample } from "./detect-bbf";
import { detectFastExample } from "./detect-fast";
import { detectHaarExample } from "./detect-haar";
import { detectHeadPoseExample } from "./detect-head-pose";
import { detectSkinExample } from "./detect-skin";
import { detectYapeExample } from "./detect-yape";
import { detectYape06Example } from "./detect-yape06";
import { determinant3x3Example } from "./determinant3x3";
import { dilateExample } from "./dilate";
import { edgeDetectionExample } from "./edge-detection";
import { eigenSymmetricExample } from "./eigen-symmetric";
import { equalizeHistogramExample } from "./equalize-histogram";
import { erodeExample } from "./erode";
import { estimateAffineExample } from "./estimate-affine";
import { estimateHomographyExample } from "./estimate-homography";
import { extractDocumentExample } from "./extract-document";
import { findContoursExample } from "./find-contours";
import { findDocumentExample } from "./find-document";
import { findLinesExample } from "./find-lines";
import { flipExample } from "./flip";
import { fromImageDataExample } from "./from-image-data";
import { gaussianBlurExample } from "./gaussian-blur";
import { gaussianKernelExample } from "./gaussian-kernel";
import { grayscaleExample } from "./grayscale";
import { groupRectanglesExample } from "./group-rectangles";
import { hammingDistanceExample } from "./hamming-distance";
import { headTurnExample } from "./head-turn";
import { houghLinesExample } from "./hough-lines";
import { identityExample } from "./identity";
import { integralImageExample } from "./integral-image";
import { invert3x3Example } from "./invert3x3";
import { isConvexExample } from "./is-convex";
import { keypointOrientationExample } from "./keypoint-orientation";
import { luSolveExample } from "./lu-solve";
import { matchDescriptorsExample } from "./match-descriptors";
import { matrixFromRowsExample } from "./matrix-from-rows";
import { matrixToRowsExample } from "./matrix-to-rows";
import { medianExample } from "./median";
import { multiplyExample } from "./multiply";
import { otsuLevelExample } from "./otsu-level";
import { perspectiveTransformExample } from "./perspective-transform";
import { pseudoInverseExample } from "./pseudo-inverse";
import { pyrDownExample } from "./pyr-down";
import { resampleExample } from "./resample";
import { scharrDerivativesExample } from "./scharr-derivatives";
import { scanDocumentExample } from "./scan-document";
import { sobelDerivativesExample } from "./sobel-derivatives";
import { straightenDocumentExample } from "./straighten-document";
import { svdExample } from "./svd";
import { svdSolveExample } from "./svd-solve";
import { thresholdExample } from "./threshold";
import { toImageDataExample } from "./to-image-data";
import { trackPointsExample } from "./track-points";
import { transformPointExample } from "./transform-point";
import { transposeExample } from "./transpose";
import { warpAffineExample } from "./warp-affine";
import { warpPerspectiveExample } from "./warp-perspective";
import { adaptiveThresholdExample } from "./adaptive-threshold";
import { boundingRectExample } from "./bounding-rect";
import { cleanUpScanExample } from "./clean-up-scan";
import { colorPickerExample } from "./color-picker";
import { connectedComponentsExample } from "./connected-components";
import { convexHullExample } from "./convex-hull";
import { countObjectsExample } from "./count-objects";
import { huMomentsExample } from "./hu-moments";
import { inRangeExample } from "./in-range";
import { laplacianExample } from "./laplacian";
import { medianBlurExample } from "./median-blur";
import { minAreaRectExample } from "./min-area-rect";
import { momentsExample } from "./moments";
import { morphologyExample } from "./morphology";
import { rgbToHsvExample } from "./rgb-to-hsv";
import { shapeAnalysisExample } from "./shape-analysis";
import { sharpnessExample } from "./sharpness";

/**
 * Every example, in gallery order. The router makes a page of each and the
 * tests run each one, so adding an example here is all it takes to publish
 * and test it.
 */
export const EXAMPLES: readonly Example[] = [
  createMatrixExample,
  cloneMatrixExample,
  fromImageDataExample,
  toImageDataExample,
  grayscaleExample,
  gaussianBlurExample,
  boxBlurExample,
  boxSumExample,
  pyrDownExample,
  resampleExample,
  sobelDerivativesExample,
  scharrDerivativesExample,
  integralImageExample,
  equalizeHistogramExample,
  cannyExample,
  houghLinesExample,
  warpPerspectiveExample,
  warpAffineExample,
  thresholdExample,
  adaptiveThresholdExample,
  otsuLevelExample,
  dilateExample,
  erodeExample,
  morphologyExample,
  medianBlurExample,
  laplacianExample,
  flipExample,
  rgbToHsvExample,
  inRangeExample,
  detectSkinExample,
  detectHaarExample,
  detectBbfExample,
  groupRectanglesExample,
  detectHeadPoseExample,
  findDocumentExample,
  extractDocumentExample,
  detectFastExample,
  detectYape06Example,
  detectYapeExample,
  keypointOrientationExample,
  describeOrbExample,
  hammingDistanceExample,
  matchDescriptorsExample,
  buildPyramidExample,
  trackPointsExample,
  estimateAffineExample,
  estimateHomographyExample,
  findContoursExample,
  contourAreaExample,
  arcLengthExample,
  approxPolygonExample,
  isConvexExample,
  boundingRectExample,
  convexHullExample,
  minAreaRectExample,
  momentsExample,
  huMomentsExample,
  connectedComponentsExample,
  gaussianKernelExample,
  perspectiveTransformExample,
  affineTransformExample,
  transformPointExample,
  identityExample,
  transposeExample,
  multiplyExample,
  invert3x3Example,
  determinant3x3Example,
  matrixFromRowsExample,
  matrixToRowsExample,
  luSolveExample,
  choleskySolveExample,
  svdExample,
  svdSolveExample,
  pseudoInverseExample,
  eigenSymmetricExample,
  medianExample,
  scanDocumentExample,
  headTurnExample,
  edgeDetectionExample,
  straightenDocumentExample,
  findLinesExample,
  shapeAnalysisExample,
  countObjectsExample,
  cleanUpScanExample,
  colorPickerExample,
  sharpnessExample,
];

/**
 * Finds an example by its URL slug.
 *
 * @param slug - The slug.
 * @returns The example, or `undefined` when there's none.
 */
export function findExample(slug: string): Example | undefined {
  return EXAMPLES.find((example) => example.slug === slug);
}
