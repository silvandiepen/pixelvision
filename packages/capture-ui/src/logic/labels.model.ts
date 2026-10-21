/** Every piece of text the components show or announce. */
export interface CaptureLabels {
  // Face capture: intro and guidance
  faceIntroTitle: string;
  faceIntroBody: string;
  start: string;
  noFace: string;
  tooFar: string;
  tooClose: string;
  offCentre: string;
  holdStill: string;
  faceCamera: string;
  turnOneSide: string;
  turnOtherSide: string;
  /** First turn, to the left (directional detectors). */
  turnLeft: string;
  /** Second turn, to the right (directional detectors). */
  turnRight: string;
  /** First turn, to the right (`first-turn="right"`). */
  turnRightFirst: string;
  /** Second turn, to the left (`first-turn="right"`). */
  turnLeftNow: string;
  faceCameraAgain: string;
  faceDone: string;
  timeoutTitle: string;
  timeoutBody: string;
  /** Announced with the step number, e.g. "Step {step} of {total}". */
  stepOf: string;
  /** Secondary hint when the face is lost during the head turns. */
  faceLost: string;
  /** Secondary hint while more than one face of a meaningful size is in view. */
  severalFaces: string;
  /** Helper hints when a step makes no progress for a while. */
  alignHelp: string;
  turnFurther: string;
  faceCameraHelp: string;
  /** Quality hints: the face is too dark, too bright, washed out or blurred. */
  faceTooDark: string;
  faceTooBright: string;
  faceLowContrast: string;
  faceBlurry: string;
  /** Offer to switch to the neural detector. */
  usePrecise: string;
  loadingPrecise: string;

  // Document scanner
  docIntroTitle: string;
  docIntroBody: string;
  docSearching: string;
  docFound: string;
  docHoldStill: string;
  docReview: string;
  /** Quality hints: the document is too dark, too bright, washed out or blurred. */
  docTooDark: string;
  docTooBright: string;
  docLowContrast: string;
  docBlurry: string;
  docAdjust: string;
  capture: string;
  retake: string;
  confirm: string;
  adjust: string;
  adjustDone: string;
  aspectLabel: string;
  aspectAuto: string;
  aspectIdCard: string;
  aspectA4: string;
  cornerTopLeft: string;
  cornerTopRight: string;
  cornerBottomRight: string;
  cornerBottomLeft: string;
  /** Hint for the draggable corners' keyboard use. */
  cornerHint: string;

  // Camera states
  retry: string;
  startingCamera: string;
  cameraDeniedTitle: string;
  cameraDeniedBody: string;
  cameraBlockedFrameTitle: string;
  cameraBlockedFrameBody: string;
  cameraUnavailableTitle: string;
  cameraUnavailableBody: string;
  cameraInUseTitle: string;
  cameraInUseBody: string;
  cameraInsecureTitle: string;
  cameraInsecureBody: string;
  cameraErrorTitle: string;
  cameraErrorBody: string;

  /** Accessible name of the camera preview. */
  previewLabel: string;
}

/** A language's labels. */
export type LabelKey = keyof CaptureLabels;
