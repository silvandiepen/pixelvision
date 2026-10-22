import type { Matrix } from "pixelvision";
import type { Control, ControlValues } from "../example.model";

/** The effects a stack can hold. */
export type EffectId =
  | "grayscale"
  | "blur"
  | "smooth"
  | "sharpen"
  | "emboss"
  | "edges"
  | "threshold"
  | "scan"
  | "contrast"
  | "thicken"
  | "thin"
  | "invert"
  | "mirror";

/** One effect: its settings, and how it changes an image. */
export interface Effect {
  id: EffectId;
  label: string;
  /** One sentence: what it does and which pixelvision function does it. */
  description: string;
  /** Its settings, shown under it in the stack. */
  controls: Control[];
  /**
   * Applies the effect.
   *
   * @param image - RGBA (4 channels) or gray (1 channel).
   * @param options - Its settings.
   * @returns A new image, RGBA or gray.
   */
  apply: (image: Matrix<"u8">, options: ControlValues) => Matrix<"u8">;
}

/** An effect in the stack, with its own settings. */
export interface EffectLayer {
  /** Stays the same while the layer moves around the stack. */
  key: number;
  effect: EffectId;
  enabled: boolean;
  options: ControlValues;
}
