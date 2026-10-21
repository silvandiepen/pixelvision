import { createHeadTurnChallenge } from "pixelvision";
import type { DemoOutput, OptionsInput } from "../example.model";
import type { HeadTurnDemoOptions } from "./demo.model";
import { scriptedPoses } from "./script";

/**
 * Runs the head-turn challenge on a scripted sequence of poses. With the
 * camera, the page feeds it `detectHeadPose(gray, cascades).pose` for each
 * frame instead (about 8 times a second).
 *
 * @param input - Frames each pose must hold.
 * @returns The state after every frame.
 */
export function demo({ options }: OptionsInput<HeadTurnDemoOptions>): DemoOutput {
  const challenge = createHeadTurnChallenge({ holdFrames: options.holdFrames, now: () => 0 });

  const rows = scriptedPoses(options.holdFrames).map((pose, frame) => {
    const state = challenge.update(pose);
    return [frame + 1, pose, state.step, state.progress, state.instruction];
  });
  const { state } = challenge;

  return {
    tables: [
      { label: "Frame by frame", columns: ["Frame", "Pose", "Step", "Done", "Instruction"], rows },
    ],
    values: { step: state.step, progress: state.progress, firstSide: state.firstSide ?? "" },
  };
}
