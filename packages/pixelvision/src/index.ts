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
export type {
  DocumentTracker,
  DocumentTrackerOptions,
  DocumentTrackerState,
} from "./document/documentTracker.model";
export { createDocumentTracker } from "./document/documentTracker";

// Shapes
export type { Contour, FindContoursOptions } from "./shape/contours.model";
export { findContours } from "./shape/contours";
export { approxPolygon, arcLength, contourArea, isConvex } from "./shape/polygon";
export type { Moments, Rect, RotatedRect } from "./shape/shapes.model";
export { boundingRect, convexHull, huMoments, minAreaRect, moments } from "./shape/shapes";
export type { Component, ConnectedComponents } from "./shape/connectedComponents.model";
export { connectedComponents } from "./shape/connectedComponents";

// Vectorising
export type {
  CircleShape,
  CloseSegment,
  CurveSegment,
  EllipseShape,
  LineToSegment,
  MoveSegment,
  PathSegment,
  PathShape,
  PolygonShape,
  PrimitiveShape,
  RectShape,
  ShapeKind,
  ShapesOptions,
  SnapLinesOptions,
  SvgOptions,
  VectorImage,
  VectorizeOptions,
  VectorizeThreshold,
  VectorPath,
  VectorShape,
} from "./vector/vectorize.model";
export { vectorize } from "./vector/vectorize";

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
export { loadOpenCvCascade } from "./detect/opencvCascade";
export { groupRectangles } from "./detect/groupRectangles";
export type {
  ArucoDictionaryName,
  ArucoMarker,
  DetectArucoMarkersOptions,
  GenerateArucoMarkerOptions,
} from "./codes/aruco.model";
export { detectArucoMarkers, generateArucoMarker } from "./codes/aruco";
export type { QrCode, QrErrorCorrectionLevel } from "./codes/qrCode.model";
export { readQrCode } from "./codes/qrCode";

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

// Camera pose
export type {
  CameraMatrix,
  Point3,
  ProjectPointsOptions,
  RadialDistortion,
} from "./imgproc/projectPoints.model";
export { projectPoints } from "./imgproc/projectPoints";
export type { Vec3 } from "./imgproc/rodrigues.model";
export { rodrigues } from "./imgproc/rodrigues";
export type { PnPResult, Pose, SolvePnPOptions } from "./imgproc/solvePnP.model";
export { solvePnP } from "./imgproc/solvePnP";

// Tracking
export type { FlowFrame, TrackedPoint, TrackPointsOptions } from "./tracking/opticalFlow.model";
export { trackPoints } from "./tracking/opticalFlow";
export { buildPyramid } from "./tracking/pyramid";
export type { CamShiftResult, MeanShiftOptions, MeanShiftResult } from "./imgproc/meanShift.model";
export { meanShift } from "./imgproc/meanShift";
export { camShift } from "./imgproc/camShift";

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
export type { HoughLinesPOptions, LineSegment } from "./imgproc/houghLinesP.model";
export { houghLinesP } from "./imgproc/houghLinesP";
export type { Circle, HoughCirclesOptions } from "./imgproc/houghCircles.model";
export { houghCircles } from "./imgproc/houghCircles";
export type { IntegralImage, IntegralImageOptions } from "./imgproc/integralImage.model";
export { integralImage } from "./imgproc/integralImage";
export type { PyrDownOptions } from "./imgproc/pyrDown.model";
export { pyrDown } from "./imgproc/pyrDown";
export type { AdaptiveThresholdOptions } from "./imgproc/adaptiveThreshold.model";
export { adaptiveThreshold } from "./imgproc/adaptiveThreshold";
export {
  hlsToRgb,
  hsvToRgb,
  labToRgb,
  rgbToHls,
  rgbToHsv,
  rgbToLab,
  rgbToYCrCb,
  yCrCbToRgb,
} from "./imgproc/color";
export type { BilateralFilterOptions } from "./imgproc/bilateralFilter.model";
export { bilateralFilter } from "./imgproc/bilateralFilter";
export type { CalcHistOptions } from "./imgproc/calcHist.model";
export { calcHist } from "./imgproc/calcHist";
export type { CalcBackProjectOptions } from "./imgproc/calcBackProject.model";
export { calcBackProject } from "./imgproc/calcBackProject";
export type { ClaheOptions, TileGridSize } from "./imgproc/clahe.model";
export { clahe } from "./imgproc/clahe";
export type { DistanceMetric, DistanceTransformOptions } from "./imgproc/distanceTransform.model";
export { distanceTransform } from "./imgproc/distanceTransform";
export type { Filter2DFloatOptions, Filter2DOptions, Kernel } from "./imgproc/filter2D.model";
export { filter2D } from "./imgproc/filter2D";
export type { ChannelValues, FloodFillOptions, FloodFillResult } from "./imgproc/floodFill.model";
export { floodFill } from "./imgproc/floodFill";
export type { MatchTemplateOptions, TemplateMatchMethod } from "./imgproc/matchTemplate.model";
export { matchTemplate } from "./imgproc/matchTemplate";
export type { MinMaxLoc } from "./imgproc/minMaxLoc.model";
export { minMaxLoc } from "./imgproc/minMaxLoc";
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
