import { challengeSteps, createFaceChallenge, needsDirection } from "pixelvision";
import type { ChallengeStep, FaceObservation, HeadPose } from "pixelvision";
import type { DemoOutput, OptionsInput } from "../example.model";
import type { CreateFaceChallengeDemoOptions } from "./demo.model";

/** The pose (and motion) a person shows while doing a step. */
const SHOWN: Record<ChallengeStep, FaceObservation> = {
  frontal: { pose: "frontal" },
  left: { pose: "turned-left" },
  right: { pose: "turned-right" },
  up: { pose: "looking-up" },
  down: { pose: "looking-down" },
  side: { pose: "turned-left" },
  "other-side": { pose: "turned-right" },
  move: { pose: "frontal", motion: 0.01 },
};

/**
 * Runs a challenge on a person who does each step as asked, with a frame
 * without a face and one stray pose thrown in. With a camera, feed it the
 * pose of every frame instead: `detectHeadPose` for HAAR, or
 * `createHeadPoseTracker` from `@pixelvision/face-neural` for directions.
 *
 * @param input - The challenge and the frames each step must hold.
 * @returns The state after every frame.
 */
export function demo({ options }: OptionsInput<CreateFaceChallengeDemoOptions>): DemoOutput {
  const steps = challengeSteps(options.preset);
  const challenge = createFaceChallenge({
    steps,
    holdFrames: options.holdFrames,
    now: () => 0,
  });

  // Each step held for a few frames, plus a missed face and a stray pose.
  const frames: (HeadPose | FaceObservation)[] = ["none"];
  for (const step of steps) {
    const frameCount = step === "move" ? options.holdFrames * 4 : options.holdFrames;
    frames.push("profile", ...Array.from({ length: frameCount }, () => SHOWN[step]));
  }

  const rows = frames.map((frame, index) => {
    const state = challenge.update(frame);
    const shown =
      typeof frame === "string" ? frame : `${frame.pose}, motion ${frame.motion ?? "–"}`;
    return [index + 1, shown, state.step, `${state.progress} of ${state.total}`];
  });
  const { state } = challenge;

  return {
    tables: [{ label: "Frame by frame", columns: ["Frame", "Seen", "Step", "Done"], rows }],
    values: {
      step: state.step,
      progress: state.progress,
      steps: steps.join(","),
      needsDirection: needsDirection(steps),
    },
  };
}
