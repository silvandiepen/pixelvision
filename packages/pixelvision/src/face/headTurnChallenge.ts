import type { HeadPose } from "./headPose.model";
import type {
  HeadTurnChallenge,
  HeadTurnChallengeOptions,
  HeadTurnState,
  HeadTurnStep,
} from "./headTurnChallenge.model";

const INSTRUCTIONS: Record<HeadTurnState["step"], string> = {
  "face-camera": "Look straight at the camera",
  "turn-one-side": "Slowly turn your head to one side",
  "turn-other-side": "Now turn your head to the other side",
  "face-camera-again": "Look straight at the camera again",
  done: "Done",
  failed: "Time's up. Let's try again",
};
const ORDER: HeadTurnStep[] = [
  "face-camera",
  "turn-one-side",
  "turn-other-side",
  "face-camera-again",
];

/**
 * Creates a head-turn challenge: the person looks at the camera, turns to
 * one side, then the other, and looks back. A step completes once most of
 * the recent frames with a face match it, so a single lucky detection
 * doesn't count and a single missed one doesn't reset progress; frames
 * without a face are ignored. Feed it the result of
 * {@link detectHeadPose} for every camera frame.
 *
 * This proves the person moved their head as asked: a useful liveness
 * signal against printed photos and still screens. It is not a certified
 * presentation-attack check (a video replay or deepfake can follow the
 * steps); for KYC, send the capture to a certified liveness service.
 *
 * @param options - Frames to hold each pose, timeout, clock.
 * @returns The challenge.
 *
 * @example
 * const challenge = createHeadTurnChallenge();
 * onFrame((gray) => {
 *   const { pose } = detectHeadPose(gray, cascades);
 *   const state = challenge.update(pose);
 *   showInstruction(state.instruction);
 *   if (state.step === "done") capture();
 * });
 */
export function createHeadTurnChallenge(options: HeadTurnChallengeOptions = {}): HeadTurnChallenge {
  const { holdFrames = 3, timeoutMs = 30_000, now = Date.now } = options;
  const windowFrames = Math.max(holdFrames, options.windowFrames ?? holdFrames * 2);
  let index = 0;
  // Recent poses with a face, for the current step only.
  let recent: HeadPose[] = [];
  let firstSide: HeadTurnState["firstSide"];
  let startedAt = now();
  let finished: "done" | "failed" | undefined;

  const matches = (pose: HeadPose): boolean => {
    switch (ORDER[index]) {
      case "face-camera":
      case "face-camera-again":
        return pose === "frontal";
      case "turn-one-side":
        return pose !== "frontal";
      default:
        return pose !== "frontal" && pose !== firstSide;
    }
  };
  const matching = () => recent.filter(matches);

  const snapshot = (): HeadTurnState => {
    const step = finished ?? ORDER[index];
    const holdProgress = finished
      ? finished === "done"
        ? 1
        : 0
      : Math.min(1, matching().length / holdFrames);
    return {
      step,
      instruction: INSTRUCTIONS[step],
      progress: finished === "done" ? 4 : index,
      holdProgress,
      firstSide,
    };
  };

  return {
    update(pose) {
      if (finished) return snapshot();
      if (now() - startedAt > timeoutMs) {
        finished = "failed";
        return snapshot();
      }
      if (pose === "none") return snapshot();
      recent = [...recent, pose].slice(-windowFrames);
      const hits = matching();
      if (hits.length >= holdFrames) {
        if (ORDER[index] === "turn-one-side") {
          // The side seen most often during the step.
          const counts = new Map<HeadPose, number>();
          for (const hit of hits) counts.set(hit, (counts.get(hit) ?? 0) + 1);
          firstSide = [...counts].sort((a, b) => b[1] - a[1])[0][0] as HeadTurnState["firstSide"];
        }
        recent = [];
        index++;
        if (index === ORDER.length) finished = "done";
      }
      return snapshot();
    },
    get state() {
      return snapshot();
    },
    reset() {
      index = 0;
      recent = [];
      firstSide = undefined;
      finished = undefined;
      startedAt = now();
    },
  };
}
