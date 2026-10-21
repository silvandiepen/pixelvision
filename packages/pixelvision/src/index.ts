// Core
export type {
  CreateMatrixOptions,
  ImageLike,
  Matrix,
  PixelArrays,
  PixelType,
  RGBAImage,
} from "./core/matrix.model";
export { cloneMatrix, createMatrix } from "./core/matrix";
export { fromImageData, toImageData } from "./core/image";

// Math
export type { GaussianKernelOptions } from "./math/gaussianKernel.model";
export { gaussianKernel } from "./math/gaussianKernel";
export type { Eigen, SVD } from "./math/linalg.model";
export {
  choleskySolve,
  eigenSymmetric,
  luSolve,
  pseudoInverse,
  svd,
  svdSolve,
} from "./math/linalg";
export type { MultiplyOptions, NumericMatrix } from "./math/matmath.model";
export {
  determinant3x3,
  identity,
  invert3x3,
  matrixFromRows,
  matrixToRows,
  multiply,
  transpose,
} from "./math/matmath";
export { median } from "./math/median";
export type { Point } from "./math/transforms.model";
export { affineTransform, perspectiveTransform, transformPoint } from "./math/transforms";

// Document scanning
export type {
  ExtractDocumentOptions,
  FindDocumentOptions,
  FoundDocument,
  Quad,
} from "./document/document.model";
export { extractDocument, findDocument } from "./document/document";

// Shapes
export type { Contour, FindContoursOptions } from "./shape/contours.model";
export { findContours } from "./shape/contours";
export { approxPolygon, arcLength, contourArea, isConvex } from "./shape/polygon";
export type { Moments, Rect, RotatedRect } from "./shape/shapes.model";
export { boundingRect, convexHull, huMoments, minAreaRect, moments } from "./shape/shapes";
export type { Component, ConnectedComponents } from "./shape/connectedComponents.model";
export { connectedComponents } from "./shape/connectedComponents";

// Face
export type {
  HeadPose,
  HeadPoseCascades,
  HeadPoseOptions,
  HeadPoseResult,
} from "./face/headPose.model";
export { detectHeadPose } from "./face/headPose";
export type {
  HeadTurnChallenge,
  HeadTurnChallengeOptions,
  HeadTurnState,
  HeadTurnStep,
} from "./face/headTurnChallenge.model";
export { createHeadTurnChallenge } from "./face/headTurnChallenge";

// Detection
export type { BbfCascade, BbfFeature, BbfOptions, BbfStage } from "./detect/bbf.model";
export { detectBbf } from "./detect/bbf";
export type { Detection, HaarCascade, HaarOptions, HaarStage, HaarTree } from "./detect/haar.model";
export { detectHaar } from "./detect/haar";
export { groupRectangles } from "./detect/groupRectangles";

// Features
export type { FastOptions } from "./features/fast.model";
export { detectFast } from "./features/fast";
export type { Keypoint } from "./features/keypoint.model";
export type { DescriptorMatch, MatchOptions } from "./features/orb.model";
export {
  describeOrb,
  hammingDistance,
  keypointOrientation,
  matchDescriptors,
} from "./features/orb";
export type { YapeOptions } from "./features/yape.model";
export { detectYape } from "./features/yape";
export type { Yape06Options } from "./features/yape06.model";
export { detectYape06 } from "./features/yape06";

// Motion estimation
export type { Estimate, EstimateOptions, EstimationMethod } from "./motion/estimate.model";
export { estimateAffine, estimateHomography } from "./motion/estimate";

// Tracking
export type { FlowFrame, TrackedPoint, TrackPointsOptions } from "./tracking/opticalFlow.model";
export { trackPoints } from "./tracking/opticalFlow";
export { buildPyramid } from "./tracking/pyramid";

// Image processing
export type { BoxBlurOptions, BoxSumOptions } from "./imgproc/boxBlur.model";
export { boxBlur, boxSum } from "./imgproc/boxBlur";
export type { CannyOptions } from "./imgproc/canny.model";
export { canny } from "./imgproc/canny";
export type { DerivativeType, DerivativesOptions } from "./imgproc/derivatives.model";
export { scharrDerivatives, sobelDerivatives } from "./imgproc/derivatives";
export type { DetectSkinOptions } from "./imgproc/detectSkin.model";
export { detectSkin } from "./imgproc/detectSkin";
export type { EqualizeHistogramOptions } from "./imgproc/equalizeHistogram.model";
export { equalizeHistogram } from "./imgproc/equalizeHistogram";
export type { GaussianBlurOptions } from "./imgproc/gaussianBlur.model";
export { gaussianBlur } from "./imgproc/gaussianBlur";
export type { ChannelOrder, GrayscaleOptions } from "./imgproc/grayscale.model";
export { grayscale } from "./imgproc/grayscale";
export type { HoughLine, HoughLinesOptions } from "./imgproc/houghLines.model";
export { houghLines } from "./imgproc/houghLines";
export type { IntegralImage, IntegralImageOptions } from "./imgproc/integralImage.model";
export { integralImage } from "./imgproc/integralImage";
export type { PyrDownOptions } from "./imgproc/pyrDown.model";
export { pyrDown } from "./imgproc/pyrDown";
export type { AdaptiveThresholdOptions } from "./imgproc/adaptiveThreshold.model";
export { adaptiveThreshold } from "./imgproc/adaptiveThreshold";
export { rgbToHsv } from "./imgproc/color";
export { flip } from "./imgproc/flip";
export { inRange } from "./imgproc/inRange";
export { laplacian } from "./imgproc/laplacian";
export { medianBlur } from "./imgproc/medianBlur";
export type { MorphologyOptions } from "./imgproc/morphology.model";
export { dilate, erode, morphology } from "./imgproc/morphology";
export type { ThresholdOptions } from "./imgproc/threshold.model";
export { otsuLevel, threshold } from "./imgproc/threshold";
export type { ResampleOptions } from "./imgproc/resample.model";
export { resample } from "./imgproc/resample";
export type { Transform, WarpOptions } from "./imgproc/warp.model";
export { warpAffine, warpPerspective } from "./imgproc/warp";
