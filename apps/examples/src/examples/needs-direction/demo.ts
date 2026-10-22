import { CHALLENGE_PRESETS, needsDirection } from "pixelvision";
import type { ChallengePreset, ChallengeStep } from "pixelvision";
import type { DemoOutput } from "../example.model";

/** A few custom challenges, next to the presets. */
const CUSTOM: ChallengeStep[][] = [
  ["frontal", "side", "frontal"],
  ["frontal", "left", "right"],
  ["frontal", "down", "move"],
];

/**
 * Tells, for each challenge, whether it needs a pose source that knows
 * left from right and up from down.
 *
 * @returns Every challenge, and whether it does.
 */
export function demo(): DemoOutput {
  const presets = Object.keys(CHALLENGE_PRESETS) as ChallengePreset[];
  const rows = [
    ...presets.map((preset) => [preset, needsDirection(preset) ? "Yes" : "No"]),
    ...CUSTOM.map((steps) => [steps.join(", "), needsDirection(steps) ? "Yes" : "No"]),
  ];
  return {
    tables: [{ label: "Needs a directional source", columns: ["Challenge", "Needs it"], rows }],
    values: {
      headTurn: needsDirection("head-turn"),
      headCircle: needsDirection("head-circle"),
    },
  };
}
