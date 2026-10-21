import type { Example } from "./example.model";
import { adaptiveThresholdExample } from "./adaptive-threshold";
import { affineTransformExample } from "./affine-transform";
import { approxPolygonExample } from "./approx-polygon";
import { arcLengthExample } from "./arc-length";
import { bilateralFilterExample } from "./bilateral-filter";
import { boundingRectExample } from "./bounding-rect";
import { boxBlurExample } from "./box-blur";
import { boxSumExample } from "./box-sum";
import { buildPyramidExample } from "./build-pyramid";
import { calcBackProjectExample } from "./calc-back-project";
import { calcHistExample } from "./calc-hist";
import { camShiftExample } from "./cam-shift";
import { cannyExample } from "./canny";
import { choleskySolveExample } from "./cholesky-solve";
import { claheExample } from "./clahe";
import { cleanUpScanExample } from "./clean-up-scan";
import { cloneMatrixExample } from "./clone-matrix";
import { colorPickerExample } from "./color-picker";
import { connectedComponentsExample } from "./connected-components";
import { contourAreaExample } from "./contour-area";
import { convexHullExample } from "./convex-hull";
import { countObjectsExample } from "./count-objects";
import { createMatrixExample } from "./create-matrix";
import { describeOrbExample } from "./describe-orb";
import { detectArucoMarkersExample } from "./detect-aruco-markers";
import { detectBbfExample } from "./detect-bbf";
import { detectFastExample } from "./detect-fast";
import { detectHaarExample } from "./detect-haar";
import { detectHeadPoseExample } from "./detect-head-pose";
import { detectSkinExample } from "./detect-skin";
import { detectYapeExample } from "./detect-yape";
import { detectYape06Example } from "./detect-yape06";
import { determinant3x3Example } from "./determinant3x3";
import { dilateExample } from "./dilate";
import { distanceTransformExample } from "./distance-transform";
import { documentTrackerExample } from "./document-tracker";
import { edgeDetectionExample } from "./edge-detection";
import { eigenSymmetricExample } from "./eigen-symmetric";
import { equalizeHistogramExample } from "./equalize-histogram";
import { erodeExample } from "./erode";
import { estimateAffineExample } from "./estimate-affine";
import { estimateHomographyExample } from "./estimate-homography";
import { extractDocumentExample } from "./extract-document";
import { filter2DExample } from "./filter-2d";
import { findContoursExample } from "./find-contours";
import { findDocumentExample } from "./find-document";
import { findLinesExample } from "./find-lines";
import { flipExample } from "./flip";
import { floodFillExample } from "./flood-fill";
import { fromImageDataExample } from "./from-image-data";
import { gaussianBlurExample } from "./gaussian-blur";
import { gaussianKernelExample } from "./gaussian-kernel";
import { generateArucoMarkerExample } from "./generate-aruco-marker";
import { grayscaleExample } from "./grayscale";
import { groupRectanglesExample } from "./group-rectangles";
import { hammingDistanceExample } from "./hamming-distance";
import { headTurnExample } from "./head-turn";
import { hlsToRgbExample } from "./hls-to-rgb";
import { houghCirclesExample } from "./hough-circles";
import { houghLinesExample } from "./hough-lines";
import { houghLinesPExample } from "./hough-lines-p";
import { hsvToRgbExample } from "./hsv-to-rgb";
import { huMomentsExample } from "./hu-moments";
import { identityExample } from "./identity";
import { inRangeExample } from "./in-range";
import { integralImageExample } from "./integral-image";
import { invert3x3Example } from "./invert3x3";
import { isConvexExample } from "./is-convex";
import { keypointOrientationExample } from "./keypoint-orientation";
import { labToRgbExample } from "./lab-to-rgb";
import { laplacianExample } from "./laplacian";
import { loadOpenCvCascadeExample } from "./load-opencv-cascade";
import { luSolveExample } from "./lu-solve";
import { matchDescriptorsExample } from "./match-descriptors";
import { matchTemplateExample } from "./match-template";
import { matrixFromRowsExample } from "./matrix-from-rows";
import { matrixToRowsExample } from "./matrix-to-rows";
import { meanShiftExample } from "./mean-shift";
import { medianExample } from "./median";
import { medianBlurExample } from "./median-blur";
import { minAreaRectExample } from "./min-area-rect";
import { minMaxLocExample } from "./min-max-loc";
import { momentsExample } from "./moments";
import { morphologyExample } from "./morphology";
import { multiplyExample } from "./multiply";
import { otsuLevelExample } from "./otsu-level";
import { perspectiveTransformExample } from "./perspective-transform";
import { projectPointsExample } from "./project-points";
import { pseudoInverseExample } from "./pseudo-inverse";
import { pyrDownExample } from "./pyr-down";
import { readQrCodeExample } from "./read-qr-code";
import { resampleExample } from "./resample";
import { rgbToHlsExample } from "./rgb-to-hls";
import { rgbToHsvExample } from "./rgb-to-hsv";
import { rgbToLabExample } from "./rgb-to-lab";
import { rgbToYCrCbExample } from "./rgb-to-ycrcb";
import { rodriguesExample } from "./rodrigues";
import { scanDocumentExample } from "./scan-document";
import { scharrDerivativesExample } from "./scharr-derivatives";
import { shapeAnalysisExample } from "./shape-analysis";
import { sharpnessExample } from "./sharpness";
import { sobelDerivativesExample } from "./sobel-derivatives";
import { solvePnPExample } from "./solve-pnp";
import { straightenDocumentExample } from "./straighten-document";
import { svdExample } from "./svd";
import { svdSolveExample } from "./svd-solve";
import { thresholdExample } from "./threshold";
import { toImageDataExample } from "./to-image-data";
import { trackPointsExample } from "./track-points";
import { transformPointExample } from "./transform-point";
import { transposeExample } from "./transpose";
import { vectorizeExample } from "./vectorize";
import { warpAffineExample } from "./warp-affine";
import { warpPerspectiveExample } from "./warp-perspective";
import { yCrCbToRgbExample } from "./ycrcb-to-rgb";

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
  claheExample,
  calcHistExample,
  calcBackProjectExample,
  cannyExample,
  houghLinesExample,
  houghLinesPExample,
  houghCirclesExample,
  warpPerspectiveExample,
  warpAffineExample,
  thresholdExample,
  adaptiveThresholdExample,
  otsuLevelExample,
  dilateExample,
  erodeExample,
  morphologyExample,
  medianBlurExample,
  bilateralFilterExample,
  filter2DExample,
  laplacianExample,
  flipExample,
  rgbToHsvExample,
  hsvToRgbExample,
  rgbToHlsExample,
  hlsToRgbExample,
  rgbToLabExample,
  labToRgbExample,
  rgbToYCrCbExample,
  yCrCbToRgbExample,
  inRangeExample,
  floodFillExample,
  detectSkinExample,
  detectHaarExample,
  loadOpenCvCascadeExample,
  detectBbfExample,
  matchTemplateExample,
  groupRectanglesExample,
  readQrCodeExample,
  detectArucoMarkersExample,
  generateArucoMarkerExample,
  detectHeadPoseExample,
  findDocumentExample,
  documentTrackerExample,
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
  meanShiftExample,
  camShiftExample,
  estimateAffineExample,
  estimateHomographyExample,
  solvePnPExample,
  projectPointsExample,
  rodriguesExample,
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
  vectorizeExample,
  distanceTransformExample,
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
  minMaxLocExample,
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
