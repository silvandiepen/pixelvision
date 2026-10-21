import type { HeadPose, HeadTurnStep, Point, Quad } from "pixelvision";
import type { CameraErrorCode } from "../camera/camera.model";
import type { AspectPreset } from "../logic/documentFlow.model";
import type { FacePhase } from "../logic/faceFlow.model";
import type { Box, FaceGuidance } from "../logic/geometry.model";

/** Why a component stopped: a camera failure, the selfie timeout, or a detector failure. */
export type CaptureErrorCode = CameraErrorCode | "timeout" | "detector";

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

/** `pv-step`: a head-turn step started or completed. */
export interface StepDetail {
  /** The current step, or `"done"`. */
  step: HeadTurnStep | "done";
  /** Completed steps. */
  stepsDone: number;
  totalSteps: number;
  /** 0–1. */
  progress: number;
}

/** `pv-pose`: one detection. Coordinates are in camera-frame pixels. */
export interface PoseDetail {
  pose: HeadPose;
  guidance: FaceGuidance;
  phase: FacePhase;
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
  /** Laplacian-variance sharpness of the face region in the detection frame. */
  sharpness: number;
  /** Face box in capture pixels, when known. */
  box?: Box;
  pose: HeadPose;
  /** Whether the head-turn challenge was completed. */
  liveness: boolean;
  /** Milliseconds from start to capture. */
  durationMs: number;
  capturedAt: string;
  /** The capture is never mirrored, whatever the preview shows. */
  mirrored: false;
}

/** `pv-capture` from `<pv-face-capture>`. */
export interface FaceCaptureDetail {
  /** JPEG of the capture. */
  blob: Blob;
  /** Pixels of the capture. */
  image: ImageData;
  metadata: FaceCaptureMetadata;
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

/** `pv-capture` from `<pv-document-scanner>`. */
export interface DocumentCaptureDetail {
  /** JPEG of the straightened document. */
  blob: Blob;
  /** Pixels of the straightened document. */
  image: ImageData;
  /** Corners in the source photo's pixels: top-left, top-right, bottom-right, bottom-left. */
  corners: Quad;
  aspect: AspectPreset;
  /** Width / height used, undefined for `"auto"`. */
  aspectRatio?: number;
  /** Size of the source photo. */
  source: { width: number; height: number };
}

/** `pv-detector`: the face detector was switched through "Use precise detection". */
export interface DetectorDetail {
  /** The new source's `name`, e.g. "yunet". */
  name: string;
}
