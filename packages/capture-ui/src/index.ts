import { DocumentScannerElement } from "./elements/documentScanner";
import { FaceCaptureElement } from "./elements/faceCapture";
import type {
  CompleteDetail,
  DetectDetail,
  DetectorDetail,
  ErrorDetail,
  PoseDetail,
  ReadyDetail,
  StepDetail,
} from "./elements/events.model";

// Elements
export { DocumentScannerElement } from "./elements/documentScanner";
export { FaceCaptureElement } from "./elements/faceCapture";
export type { ViewState } from "./elements/captureElement";
export type {
  CaptureErrorCode,
  CompleteDetail,
  DetectDetail,
  DetectorDetail,
  DocumentCaptureDetail,
  ErrorDetail,
  FaceCaptureDetail,
  FaceCaptureMetadata,
  PoseDetail,
  ReadyDetail,
  StepDetail,
} from "./elements/events.model";

// Detectors
export type {
  DetectFace,
  DocumentFinder,
  FaceNeuralModuleLike,
  LoadNeuralPoseSourceOptions,
  FaceObservation,
  FrameImage,
  HaarPoseSourceOptions,
  NeuralDetectorLike,
  NeuralFaceLike,
  NeuralPoseSourceOptions,
  PoseSource,
  WorkerLike,
} from "./sources/source.model";
export { haarPoseSource } from "./sources/haar";
export { loadNeuralPoseSource, neuralPoseSource } from "./sources/neural";
export { mainThreadDocumentFinder } from "./sources/document";
export { createWorkerClient, workerDocumentFinder, workerPoseSource } from "./sources/worker";

// Logic, for building your own UI
export type { CameraContext, CameraErrorCode } from "./camera/camera.model";
export { classifyCameraError } from "./camera/errors";
export type {
  AlignmentOptions,
  Box,
  FaceGuidance,
  Guide,
  GuideOptions,
  GuideShape,
  ViewTransform,
} from "./logic/geometry.model";
export {
  assessFace,
  boxToView,
  coverTransform,
  fromView,
  guideFor,
  toView,
} from "./logic/geometry";
export type {
  FaceFlow,
  FaceFlowInput,
  FaceFlowOptions,
  FaceFlowState,
  FacePhase,
  GuideTone,
  TurnHint,
} from "./logic/faceFlow.model";
export { createFaceFlow, turnProgress } from "./logic/faceFlow";
export type {
  AspectPreset,
  DocumentFlow,
  DocumentFlowOptions,
  DocumentFlowState,
} from "./logic/documentFlow.model";
export { A4_ASPECT, ID_CARD_ASPECT, createDocumentFlow, resolveAspect } from "./logic/documentFlow";
export type {
  EasedNumber,
  EasedNumberOptions,
  PointsTracker,
  PointsTrackerOptions,
  TrackedPoints,
} from "./logic/smoothing.model";
export { createEasedNumber, createPointsTracker, smoothingFactor } from "./logic/smoothing";
export type { BoxSmoother, BoxSmootherOptions, SmoothedBox } from "./logic/boxSmoother.model";
export { createBoxSmoother } from "./logic/boxSmoother";
export type { SettledValue, SettledValueOptions } from "./logic/settle.model";
export { createSettledValue } from "./logic/settle";
export type { StabilityOptions, StabilityState, StabilityTracker } from "./logic/stability.model";
export { createStabilityTracker } from "./logic/stability";
export { sharpness } from "./logic/sharpness";
export type {
  QualityAssessment,
  QualityCheck,
  QualityIssue,
  QualitySubject,
  QualityThresholds,
} from "./logic/quality.model";
export {
  DOCUMENT_QUALITY,
  DOCUMENT_QUALITY_SIZE,
  FACE_QUALITY,
  QUALITY_SIZE,
  REFERENCE_CONTRAST,
  assessRegion,
  checkQuality,
  describeQuality,
  documentRegion,
  qualityHint,
} from "./logic/quality";
export type { CaptureLabels, LabelKey } from "./logic/labels.model";
export { dutchLabels, englishLabels, resolveLabels } from "./logic/labels";

/**
 * Registers `<pv-face-capture>` and `<pv-document-scanner>` (or your own
 * tag names). Importing the package already does this with the default
 * names; call it yourself only for other names.
 *
 * @param names - Tag names to use.
 *
 * @example
 * defineCaptureElements({ face: "acme-selfie", document: "acme-scanner" });
 */
export function defineCaptureElements(names: { face?: string; document?: string } = {}): void {
  if (typeof customElements === "undefined") return;
  const { face = "pv-face-capture", document = "pv-document-scanner" } = names;
  if (!customElements.get(face)) {
    customElements.define(
      face,
      face === "pv-face-capture" ? FaceCaptureElement : class extends FaceCaptureElement {},
    );
  }
  if (!customElements.get(document)) {
    customElements.define(
      document,
      document === "pv-document-scanner"
        ? DocumentScannerElement
        : class extends DocumentScannerElement {},
    );
  }
}

defineCaptureElements();

declare global {
  interface HTMLElementTagNameMap {
    "pv-face-capture": FaceCaptureElement;
    "pv-document-scanner": DocumentScannerElement;
  }
  interface HTMLElementEventMap {
    "pv-ready": CustomEvent<ReadyDetail>;
    "pv-error": CustomEvent<ErrorDetail>;
    "pv-step": CustomEvent<StepDetail>;
    "pv-pose": CustomEvent<PoseDetail>;
    "pv-complete": CustomEvent<CompleteDetail>;
    "pv-detect": CustomEvent<DetectDetail>;
    "pv-detector": CustomEvent<DetectorDetail>;
  }
}
