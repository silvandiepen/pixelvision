import type { Matrix, Point, RGBAImage } from "pixelvision";
import type { Overlay } from "../../examples/example.model";

export interface ImageViewProps {
  /** A `u8` matrix (1, 3 or 4 channels) or RGBA pixels. */
  image: Matrix<"u8"> | RGBAImage;
  label: string;
  overlay?: Overlay;
  /** Points to show as draggable handles, joined into a polygon. */
  points?: Point[];
}

export interface ImageViewEmits {
  (event: "update:points", points: Point[]): void;
}
