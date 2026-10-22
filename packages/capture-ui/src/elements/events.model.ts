import type { ChallengeStep, HeadPose, Point, Quad } from "pixelvision";
import type { CameraErrorCode } from "../camera/camera.model";
import type { StreamFailure } from "../camera/startup.model";
import type { AspectPreset } from "../logic/documentFlow.model";
import type { ServerChallenge } from "../logic/evidence.model";
import type { FacePhase } from "../logic/faceFlow.model";
import type { Box, FaceGuidance } from "../logic/geometry.model";
import type { QualityAssessment } from "../logic/quality.model";

/**
 * Why a component stopped: a camera failure, the selfie timeout, a detector failure, or a
 * stream that has no live video track (`no-video`), whose track ended (`ended`), that reported
 * a media error (`media-error`), or that delivered no frame size in time (`start-timeout`).
 */
export type CaptureErrorCode =
  CameraErrorCode | "timeout" | "detector" | "challenge" | Exclude<StreamFailure, "aborted">;

/** `pv-ready`: the camera is running. */
export interface ReadyDetail {
  width: number;
  height: number;
  facingMode: "user" | "environment";
}

/** `pv-error`. */
export interface ErrorDetail {
  code: CaptureErrorCode;
  /** The shown title, in the element's language. */
  message: string;
  cause?: unknown;
}

/** `pv-step`: a challenge step started or completed. */
export interface StepDetail {
  /** The current step, or `"done"`. */
  step: ChallengeStep | "done";
  /** Completed steps. */
  stepsDone: number;
  totalSteps: number;
  /** 0–1. */
  progress: number;
}

/** `pv-pose`: one detection. Coordinates are in camera-frame pixels. */
export interface PoseDetail {
  /** The pose of the face being followed (`"none"` when the detector described another face). */
  pose: HeadPose;
  guidance: FaceGuidance;
  phase: FacePhase;
  /**
   * Faces of a meaningful size in view (at least `several-faces-ratio` of the largest face's
   * width), the followed face included; 0 without a face. Above 1, the flow waits and asks
   * for only one person in the frame.
   */
  faceCount: number;
  /** The face being followed: the largest face nearest the guide's centre. */
  box?: Box;
  landmarks?: Point[];
  score?: number;
  /** Degrees towards the person's left, from sources with landmarks. */
  yaw?: number;
}

/** Facts about a selfie capture. */
export interface FaceCaptureMetadata {
  width: number;
  height: number;
  /**
   * Sharpness of the kept face region in the detection frame (see {@link QualityAssessment}),
   * 0 when the capture isn't a kept frame (a capture before the flow is done).
   */
  sharpness: number;
  /**
   * Sharpness, brightness and contrast of the face region: of the kept frame, which passed the
   * quality gate, or of the latest detection frame for a capture before the flow is done.
   * Undefined when no face was measured.
   */
  quality?: QualityAssessment;
  /** Face box in capture pixels, when known. */
  box?: Box;
  pose: HeadPose;
  /** The challenge's steps, as asked; empty without a challenge. */
  challenge: ChallengeStep[];
  /** The server challenge's one-time code, with `challenge-url`. */
  challengeId?: string;
  /**
   * Whether the challenge was completed in this browser.
   *
   * This is a client-side challenge result, not presentation-attack detection (PAD) and not
   * evidence that a live person was present: a replayed video, a virtual camera, an injected
   * stream or a modified page can complete the challenge or set this field. Use it for capture
   * quality and user guidance only. A KYC or identity decision belongs on a server, with
   * independently evaluated PAD and checks on the uploaded media.
   */
  challengePassed: boolean;
  /** Milliseconds from start to capture. */
  durationMs: number;
  /** The browser's clock at capture time; client-controlled, so not evidence of when. */
  capturedAt: string;
  /** The capture is never mirrored, whatever the preview shows. */
  mirrored: false;
}

/**
 * `pv-capture` from `<pv-face-capture>`. The event doesn't bubble or cross the shadow root:
 * listen on the element itself.
 */
export interface FaceCaptureDetail {
  /** JPEG of the capture, at most `max-pixels` pixels. */
  blob: Blob;
  /** Pixels of the capture; only with `include-image-data`. */
  image?: ImageData;
  metadata: FaceCaptureMetadata;
}

/**
 * `pv-evidence`, with `challenge-url`: what your server needs to check the
 * challenge itself (see `verifyEvidence` in `@pixelvision/verify`). Like
 * `pv-capture`, it stays on the element. Post it with `evidenceForm`.
 */
export interface EvidenceDetail {
  /** The challenge as the server signed it. */
  challenge: ServerChallenge;
  /** Every detection frame from the first face to the end, as JPEGs, 320 px at most. */
  frames: { time: number; blob: Blob }[];
  /** The captured photo. */
  photo: Blob;
}

/** `pv-complete`. */
export interface CompleteDetail {
  durationMs: number;
  stepsDone: number;
}

/** `pv-detect`: one document detection, in camera-frame pixels. */
export interface DetectDetail {
  corners: Quad | null;
  /** Fraction of the frame the document covers. */
  area?: number;
  /** 0–1: how far the hold-still ring is. */
  progress: number;
  stable: boolean;
}

/**
 * `pv-capture` from `<pv-document-scanner>`. The event doesn't bubble or cross the shadow
 * root: listen on the element itself. This is a cropped photo, not a verified document.
 */
export interface DocumentCaptureDetail {
  /** JPEG of the straightened document. */
  blob: Blob;
  /** Pixels of the straightened document; only with `include-image-data`. */
  image?: ImageData;
  /** Corners in the source photo's pixels: top-left, top-right, bottom-right, bottom-left. */
  corners: Quad;
  aspect: AspectPreset;
  /** Width / height used, undefined for `"auto"`. */
  aspectRatio?: number;
  /** Size of the source photo, at most `max-pixels` pixels. */
  source: { width: number; height: number };
  /**
   * Sharpness, brightness and contrast of the document region in the last detection frame
   * before the capture. An automatic capture only happens once this passed the quality gate.
   * Undefined when no document was found.
   */
  quality?: QualityAssessment;
}

/** `pv-detector`: the face detector was switched through "Use precise detection". */
export interface DetectorDetail {
  /** The new source's `name`, e.g. "yunet". */
  name: string;
}
