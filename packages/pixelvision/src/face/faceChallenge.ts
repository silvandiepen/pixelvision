import type {
  ChallengePreset,
  ChallengeStep,
  FaceChallenge,
  FaceChallengeOptions,
  FaceChallengeState,
} from "./faceChallenge.model";
import type { HeadPose } from "./headPose.model";

/** The steps of each preset. */
export const CHALLENGE_PRESETS: Readonly<Record<ChallengePreset, readonly ChallengeStep[]>> = {
  none: [],
  motion: ["frontal", "move"],
  "head-turn": ["frontal", "side", "other-side", "frontal"],
  "head-circle": ["frontal", "left", "up", "right", "down", "frontal"],
};

const DIRECTIONAL: ReadonlySet<ChallengeStep> = new Set(["left", "right", "up", "down"]);

/** The pose on the other side. */
const OPPOSITE: Partial<Record<HeadPose, HeadPose>> = {
  profile: "mirrored-profile",
  "mirrored-profile": "profile",
  "turned-left": "turned-right",
  "turned-right": "turned-left",
};

/**
 * Resolves a preset name to its steps.
 *
 * @param steps - Steps, or a preset name.
 * @returns The steps.
 * @throws {RangeError} When a preset or step name is unknown.
 */
export function challengeSteps(
  steps: readonly ChallengeStep[] | ChallengePreset,
): readonly ChallengeStep[] {
  if (typeof steps === "string") {
    const preset = CHALLENGE_PRESETS[steps];
    if (!preset) throw new RangeError(`Unknown challenge "${steps}"`);
    return preset;
  }
  for (const step of steps) {
    if (!(step in STEP_MATCHERS)) throw new RangeError(`Unknown challenge step "${step}"`);
  }
  return steps;
}

/**
 * Whether a challenge needs a pose source that reports direction (left,
 * right, up, down), such as `@pixelvision/face-neural`, rather than
 * `detectHeadPose`.
 *
 * @param steps - Steps, or a preset name.
 * @returns Whether it does.
 */
export function needsDirection(steps: readonly ChallengeStep[] | ChallengePreset): boolean {
  return challengeSteps(steps).some((step) => DIRECTIONAL.has(step));
}

const STEP_MATCHERS: Record<
  ChallengeStep,
  (pose: HeadPose, side: HeadPose | undefined) => boolean
> = {
  frontal: (pose) => pose === "frontal",
  left: (pose) => pose === "turned-left",
  right: (pose) => pose === "turned-right",
  up: (pose) => pose === "looking-up",
  down: (pose) => pose === "looking-down",
  side: (pose) => pose in OPPOSITE,
  "other-side": (pose, side) => side !== undefined && pose === OPPOSITE[side],
  move: (pose) => pose !== "none",
};

/**
 * Creates a face challenge: a sequence of things the person must do, such
 * as look at the camera, turn left, look up, or just be there and move
 * naturally. Feed it the pose of every frame (from `detectHeadPose`, or
 * `headPoseFromFace` in `@pixelvision/face-neural` for directions). A step
 * completes once most recent frames with a face match it, so one lucky
 * detection doesn't count and one missed detection doesn't reset it.
 *
 * Presets: `"head-turn"` (look, turn to one side, the other side, look
 * back), `"head-circle"` (look, left, up, right, down, look back),
 * `"motion"` (look, then move naturally for a moment) and `"none"`.
 *
 * Completing a challenge in the browser proves nothing to a server: a
 * recording, a virtual camera or a changed page can do the same. It guides
 * the person and stops a still photo. For a check a server can rely on,
 * let the server choose the steps and verify the frames.
 *
 * @param options - Steps or preset, hold frames, motion threshold, timeout, clock.
 * @returns The challenge.
 * @throws {RangeError} When a preset or step name is unknown.
 *
 * @example
 * const challenge = createFaceChallenge({ steps: ["frontal", "left", "right"] });
 * onFrame((frame) => {
 *   const state = challenge.update(headPoseFromFace(faces[0]));
 *   if (state.step === "done") capture();
 * });
 */
export function createFaceChallenge(options: FaceChallengeOptions = {}): FaceChallenge {
  const steps = challengeSteps(options.steps ?? "head-turn");
  const { holdFrames = 3, timeoutMs = 30_000, minMotion = 0.004, now = Date.now } = options;
  const frames = Math.max(1, Math.round(holdFrames));
  const windowFrames = Math.max(frames, Math.round(options.windowFrames ?? frames * 2));
  const moveFrames = Math.max(1, Math.round(options.moveFrames ?? frames * 4));

  let index = 0;
  // Recent frames with a face, for the current step only: whether each matched.
  let recent: { pose: HeadPose; match: boolean }[] = [];
  let side: FaceChallengeState["side"];
  let startedAt = now();
  let failed = false;

  const needed = () => (steps[index] === "move" ? moveFrames : frames);
  const hits = () => recent.filter((frame) => frame.match);

  const snapshot = (): FaceChallengeState => {
    const done = index >= steps.length;
    return {
      step: failed ? "failed" : done ? "done" : steps[index],
      index,
      progress: index,
      total: steps.length,
      holdProgress: done ? 1 : failed ? 0 : Math.min(1, hits().length / needed()),
      side,
    };
  };

  return {
    steps,
    update(observation) {
      const { pose, motion } =
        typeof observation === "string" ? { pose: observation, motion: undefined } : observation;
      if (failed || index >= steps.length) return snapshot();
      if (now() - startedAt > timeoutMs) {
        failed = true;
        return snapshot();
      }
      if (pose === "none") return snapshot();
      const step = steps[index];
      const match =
        STEP_MATCHERS[step](pose, side) &&
        (step !== "move" || (motion !== undefined && motion >= minMotion));
      // The move step is about time in view, so it looks further back.
      const window =
        step === "move" ? Math.max(windowFrames, Math.ceil(moveFrames * 1.5)) : windowFrames;
      recent = [...recent, { pose, match }].slice(-window);
      const matched = hits();
      if (matched.length >= needed()) {
        if (step === "side") {
          // The side seen most often during the step.
          const counts = new Map<HeadPose, number>();
          for (const hit of matched) counts.set(hit.pose, (counts.get(hit.pose) ?? 0) + 1);
          side = [...counts].sort((a, b) => b[1] - a[1])[0][0] as FaceChallengeState["side"];
        }
        recent = [];
        index++;
      }
      return snapshot();
    },
    get state() {
      return snapshot();
    },
    reset() {
      index = 0;
      recent = [];
      side = undefined;
      failed = false;
      startedAt = now();
    },
  };
}
