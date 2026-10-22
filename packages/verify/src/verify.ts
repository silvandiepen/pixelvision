import { decode } from "jpeg-js";
import {
  createFaceChallenge,
  detectHeadPose,
  grayscale,
  measureMotion,
  needsDirection,
  regionPatch,
} from "pixelvision";
import type { HeadPoseCascades, RegionPatch, RGBAImage } from "pixelvision";
import { frontalFace } from "pixelvision/cascades/frontal-face";
import { profileFace } from "pixelvision/cascades/profile-face";
import { hasValidSignature } from "./challenge";
import type {
  Evidence,
  FaceBox,
  PoseReading,
  PoseSource,
  VerifyOptions,
  VerifyReason,
  VerifyResult,
} from "./verify.model";

const CASCADES: HeadPoseCascades = { frontal: frontalFace, profile: profileFace };

/** More than this share of exact repeats is a frozen or looped picture. */
const FROZEN_SHARE = 0.25;

/** A face whose centre moves more than this share of its width between frames jumped. */
const JUMP = 0.75;

/**
 * The default pose source: pixelvision's HAAR cascades.
 *
 * @param frame - RGBA pixels.
 * @returns The pose and the face.
 */
export const haarPoseSource: PoseSource = (frame) => {
  // At 240 px the poses come out the same as at 320 px, in 60% of the time.
  const { pose, face } = detectHeadPose(grayscale(frame), CASCADES, { maxSize: 240 });
  return face ? { pose, face } : { pose };
};

/**
 * Whether two files have the same bytes.
 *
 * @param a - One file.
 * @param b - The other.
 * @returns Whether they're identical.
 */
const sameBytes = (a: Uint8Array, b: Uint8Array): boolean => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
};

/**
 * Reads a JPEG's size from its frame header, without decoding it.
 *
 * @param jpeg - The file.
 * @returns Width and height, or null when it has no frame header.
 */
export const jpegSize = (jpeg: Uint8Array): { width: number; height: number } | null => {
  if (jpeg[0] !== 0xff || jpeg[1] !== 0xd8) return null;
  for (let i = 2; i + 8 < jpeg.length;) {
    if (jpeg[i] !== 0xff) return null;
    const marker = jpeg[i + 1];
    const length = (jpeg[i + 2] << 8) | jpeg[i + 3];
    // Start of frame: baseline, extended, progressive or lossless (not DHT, JPG or DAC).
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { height: (jpeg[i + 5] << 8) | jpeg[i + 6], width: (jpeg[i + 7] << 8) | jpeg[i + 8] };
    }
    i += 2 + length;
  }
  return null;
};

/**
 * Decodes a JPEG frame. Its size has been checked from its header already.
 *
 * @param jpeg - The file.
 * @param maxSide - Largest side in pixels, a limit for the decoder too.
 * @returns The pixels, or null when it doesn't decode.
 */
const decodeFrame = (jpeg: Uint8Array, maxSide: number): RGBAImage | null => {
  try {
    const { width, height, data } = decode(jpeg, {
      useTArray: true,
      formatAsRGBA: true,
      maxResolutionInMP: (maxSide * maxSide) / 1e6,
      maxMemoryUsageInMB: 64,
    });
    return {
      width,
      height,
      data: new Uint8ClampedArray(data.buffer, data.byteOffset, data.length),
    };
  } catch {
    return null;
  }
};

/**
 * Whether a face moved further than a person can between two frames.
 *
 * @param a - The face in one frame.
 * @param b - The face in the next.
 * @returns Whether it jumped.
 */
const jumped = (a: FaceBox, b: FaceBox): boolean =>
  Math.hypot(a.x + a.width / 2 - (b.x + b.width / 2), a.y + a.height / 2 - (b.y + b.height / 2)) >
  JUMP * Math.max(a.width, b.width);

/**
 * Checks what a browser sent back for a challenge, without trusting
 * anything the browser concluded itself:
 *
 * 1. The challenge carries your signature and hasn't expired.
 * 2. Its one-time code hasn't been used: the code is spent on the first
 *    attempt, pass or fail, so a challenge can't be tried again.
 * 3. The frames are within limits, the same size, and their times increase
 *    within the challenge's lifetime.
 * 4. Running the face detection again on the frames completes every step
 *    of the challenge, in order.
 * 5. The frames aren't mostly exact repeats (a frozen or looped picture),
 *    and the face doesn't jump across the frame (spliced footage).
 *
 * Passing shows that someone produced frames doing what the server asked,
 * just now. It doesn't show that the frames came from a real camera with a
 * real person in front of it: a live deepfake or a virtual camera can do
 * the same. For identity decisions, also use a certified liveness service.
 *
 * @param evidence - The challenge and frames from the browser (see `readEvidenceForm`).
 * @param options - Secret, code store, pose source, limits.
 * @returns Whether it passed, and why not.
 * @throws {RangeError} When the secret is shorter than 32 characters.
 *
 * @example
 * const result = await verifyEvidence(await readEvidenceForm(await request.formData()), {
 *   secret: process.env.CHALLENGE_SECRET,
 *   codes,
 * });
 * if (!result.passed) console.warn(result.reasons);
 */
export async function verifyEvidence(
  evidence: Evidence,
  options: VerifyOptions,
): Promise<VerifyResult> {
  const {
    secret,
    codes,
    holdFrames = 2,
    maxFrames = 240,
    maxFrameBytes = 300_000,
    maxFrameSide = 1024,
    now = Date.now,
  } = options;
  const { challenge, frames } = evidence;
  const result = (reasons: VerifyReason[], stepsDone = 0, framesChecked = 0): VerifyResult => ({
    passed: reasons.length === 0,
    reasons,
    challengeId: String(challenge.id),
    stepsDone,
    stepsTotal: Array.isArray(challenge.steps) ? challenge.steps.length : 0,
    framesChecked,
  });

  if (!(await hasValidSignature(challenge, secret))) return result(["bad-signature"]);
  if (now() > challenge.expiresAt) return result(["expired"]);
  if (!(await codes.use(challenge.id, challenge.expiresAt))) return result(["code-used"]);
  if (needsDirection(challenge.steps) && !options.poseSource) {
    return result(["needs-direction-source"]);
  }
  const poseSource = options.poseSource ?? haarPoseSource;

  if (frames.length > maxFrames) return result(["too-many-frames"]);
  if (frames.length < challenge.steps.length * holdFrames) return result(["too-few-frames"]);
  if (frames.some((frame) => frame.jpeg.length > maxFrameBytes)) {
    return result(["frame-too-large"]);
  }
  const lifetime = challenge.expiresAt - challenge.issuedAt;
  const timesIncrease = frames.every((frame, i) => i === 0 || frame.time > frames[i - 1].time);
  if (!timesIncrease || frames[frames.length - 1].time - frames[0].time > lifetime) {
    return result(["bad-timing"]);
  }

  // Sizes first, from the headers alone: nothing is decoded until every frame is in bounds.
  const sizes = frames.map((frame) => jpegSize(frame.jpeg));
  if (sizes.some((size) => size === null)) return result(["bad-frame"]);
  if (sizes.some((size) => size!.width > maxFrameSide || size!.height > maxFrameSide)) {
    return result(["frame-too-large"]);
  }
  if (sizes.some((size) => size!.width !== sizes[0]!.width || size!.height !== sizes[0]!.height)) {
    return result(["frames-differ"]);
  }

  const run = createFaceChallenge({
    steps: challenge.steps,
    holdFrames,
    timeoutMs: Infinity,
  });
  const reasons = new Set<VerifyReason>();
  let previous: { jpeg: Uint8Array; pose: PoseReading } | undefined;
  let previousPatch: RegionPatch | undefined;
  let previousFace: FaceBox | undefined;
  let frozen = 0;
  let jumps = 0;
  let checked = 0;
  for (const frame of frames) {
    // Once every step is done, later frames can't change the outcome.
    if (run.state.step === "done") break;
    checked++;
    // An exact repeat of the frame before: frozen, and no need to look again.
    if (previous && sameBytes(previous.jpeg, frame.jpeg)) {
      frozen++;
      run.update({ pose: previous.pose.pose, motion: 0 });
      continue;
    }
    const image = decodeFrame(frame.jpeg, maxFrameSide);
    if (!image) return result(["bad-frame"], run.state.progress, checked);
    const reading = await poseSource(image);
    const { pose, face } = reading;
    const patch = face ? regionPatch(grayscale(image), face) : undefined;
    const motion = measureMotion(previousPatch, patch);
    if (motion === 0) frozen++;
    if (face && previousFace && jumped(previousFace, face)) jumps++;
    previous = { jpeg: frame.jpeg, pose: reading };
    previousPatch = patch;
    previousFace = face ?? previousFace;
    run.update({ pose, motion });
  }

  if (frozen > FROZEN_SHARE * checked) reasons.add("frozen-frames");
  if (jumps > 0) reasons.add("face-jumps");
  if (run.state.step !== "done") reasons.add("steps-not-done");
  return result([...reasons], run.state.progress, checked);
}
