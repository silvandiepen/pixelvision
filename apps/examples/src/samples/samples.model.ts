import type { RGBAImage } from "pixelvision";

/** Bundled sample images. */
export type SampleId =
  | "desk"
  | "shapes"
  | "low-contrast"
  | "palette"
  | "portrait"
  | "page"
  | "pebbles"
  | "qr-code"
  | "markers";

/** A square drawn turned about its centre. */
export interface TurnedSquare {
  /** Centre x. */
  x: number;
  /** Centre y. */
  y: number;
  /** Side length in pixels. */
  side: number;
  /** Clockwise turn in degrees. */
  angle: number;
}

/** A generated sample image. */
export interface Sample {
  id: SampleId;
  label: string;
  /** What's in it and what it's good for. */
  description: string;
  /** Draws the image; the same pixels every time, in every browser. */
  generate: () => RGBAImage;
}
