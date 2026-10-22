import type { EffectId } from "./effects.model";

/** Ready-made stacks to start from. */
export type PresetId = "sketch" | "comic" | "scan" | "relief" | "none";

/** A ready-made stack. */
export interface Preset {
  id: PresetId;
  label: string;
  effects: EffectId[];
}

export interface LiveEffectsDemoOptions {
  preset: PresetId;
}
