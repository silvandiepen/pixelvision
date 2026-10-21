/** Why the camera could not start. */
export type CameraErrorCode =
  "denied" | "blocked-frame" | "unavailable" | "in-use" | "insecure" | "unknown";

/** What is known about the page when the camera fails. */
export interface CameraContext {
  /** `window.isSecureContext`. */
  secure: boolean;
  /** Whether `navigator.mediaDevices.getUserMedia` exists. */
  supported: boolean;
  /** The page runs inside an iframe. */
  inFrame: boolean;
  /** The frame's permissions policy allows the camera; undefined when the browser can't tell. */
  policyAllows: boolean | undefined;
}

/** A camera failure, as reported in the `pv-error` event. */
export interface CameraError {
  code: CameraErrorCode;
  /** The browser's error, when there was one. */
  cause?: unknown;
}

/** A document that may expose its permissions policy (Chromium). */
export interface PolicyDocument {
  permissionsPolicy?: { allowsFeature: (feature: string) => boolean };
  featurePolicy?: { allowsFeature: (feature: string) => boolean };
}
