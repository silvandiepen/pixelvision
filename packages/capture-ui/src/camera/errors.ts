import type { CameraContext, CameraErrorCode, PolicyDocument } from "./camera.model";

/**
 * Turns a `getUserMedia` failure into a reason the person can act on.
 * Chromium reports a camera blocked by an iframe's permissions policy as a
 * plain `NotAllowedError`, so the policy is checked first: the fix there is
 * on the embedding page (`allow="camera"`), not in the browser settings.
 *
 * @param error - What `getUserMedia` threw, or undefined when it doesn't exist.
 * @param context - Secure context, API support, iframe and policy facts.
 * @returns The error code.
 *
 * @example
 * classifyCameraError(err, cameraContext()); // "blocked-frame"
 */
export function classifyCameraError(error: unknown, context: CameraContext): CameraErrorCode {
  if (!context.secure) return "insecure";
  if (context.policyAllows === false) return "blocked-frame";
  if (!context.supported) return "unavailable";
  const name = (error as { name?: unknown } | null | undefined)?.name;
  switch (name) {
    case "NotAllowedError":
    case "PermissionDeniedError":
    case "SecurityError":
      return context.inFrame && context.policyAllows === undefined ? "blocked-frame" : "denied";
    case "NotFoundError":
    case "DevicesNotFoundError":
    case "OverconstrainedError":
      return "unavailable";
    case "NotReadableError":
    case "TrackStartError":
    case "AbortError":
      return "in-use";
    default:
      return "unknown";
  }
}

/**
 * Asks the document's permissions policy whether the camera is allowed
 * (Chromium only; other browsers return undefined).
 *
 * @param doc - The document.
 * @returns Whether the camera is allowed, or undefined when unknown.
 */
export function policyAllowsCamera(doc: PolicyDocument | undefined): boolean | undefined {
  const policy = doc?.permissionsPolicy ?? doc?.featurePolicy;
  if (!policy || typeof policy.allowsFeature !== "function") return undefined;
  try {
    return policy.allowsFeature("camera");
  } catch {
    return undefined;
  }
}

/**
 * Whether a window is inside a frame. Cross-origin parents throw on
 * access, which also means framed.
 *
 * @param win - The window.
 * @returns `true` inside an iframe.
 */
export function isFramed(win: { self: unknown; top: unknown } | undefined): boolean {
  if (!win) return false;
  try {
    return win.self !== win.top;
  } catch {
    return true;
  }
}

/**
 * Collects the facts {@link classifyCameraError} needs from the browser.
 *
 * @param win - The window (default the global one).
 * @returns The context.
 */
export function cameraContext(
  win: (Window & typeof globalThis) | undefined = globalThis.window,
): CameraContext {
  return {
    secure: win?.isSecureContext ?? false,
    supported: typeof win?.navigator?.mediaDevices?.getUserMedia === "function",
    inFrame: isFramed(win),
    policyAllows: policyAllowsCamera(win?.document as PolicyDocument | undefined),
  };
}
