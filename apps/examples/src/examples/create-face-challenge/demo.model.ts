import type { ChallengePreset } from "pixelvision";

export interface CreateFaceChallengeDemoOptions {
  preset: Exclude<ChallengePreset, "none">;
  holdFrames: number;
}
