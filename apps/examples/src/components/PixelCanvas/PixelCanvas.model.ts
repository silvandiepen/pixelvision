import type { Matrix, RGBAImage } from "pixelvision";

export interface PixelCanvasProps {
  /** A `u8` matrix (1, 3 or 4 channels) or RGBA pixels. */
  image: Matrix<"u8"> | RGBAImage;
  /** What the image shows, for screen readers. */
  label: string;
  /** Show it flipped left to right, like a selfie preview. */
  mirrored?: boolean;
  /** `width`: as wide as its container, at its own proportions. `cover`: fills the container, cropped. */
  fit?: "width" | "cover";
}
