import type { RGBAImage } from "pixelvision";

/** Bundled sample images. */
export type SampleId = "desk" | "shapes" | "low-contrast" | "palette" | "portrait";

/** A generated sample image. */
export interface Sample {
  id: SampleId;
  label: string;
  /** What's in it and what it's good for. */
  description: string;
  /** Draws the image; the same pixels every time, in every browser. */
  generate: () => RGBAImage;
}
