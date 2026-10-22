import { CHALLENGE_PRESETS, challengeSteps } from "pixelvision";
import type { ChallengePreset, ChallengeStep } from "pixelvision";
import type { DemoOutput, OptionsInput } from "../example.model";
import type { ChallengeStepsDemoOptions } from "./demo.model";

/**
 * Lists the steps of every preset, and checks a list of your own.
 *
 * @param input - A comma-separated list of steps.
 * @returns The presets' steps, and whether the list is valid.
 */
export function demo({ options }: OptionsInput<ChallengeStepsDemoOptions>): DemoOutput {
  const rows = (Object.keys(CHALLENGE_PRESETS) as ChallengePreset[]).map((preset) => [
    preset,
    challengeSteps(preset).join(", ") || "(none)",
  ]);

  const custom = options.custom.split(",").map((step) => step.trim()) as ChallengeStep[];
  let check: string;
  try {
    check = challengeSteps(custom).join(", ");
  } catch (error) {
    check = (error as Error).message;
  }

  return {
    tables: [
      { label: "Presets", columns: ["Preset", "Steps"], rows },
      { label: "Your steps", columns: ["Result"], rows: [[check]] },
    ],
    values: { headCircle: challengeSteps("head-circle").length, custom: check },
  };
}
