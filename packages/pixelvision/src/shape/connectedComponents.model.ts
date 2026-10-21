import type { Matrix } from "../core/matrix.model";
import type { Point } from "../math/transforms.model";
import type { Rect } from "./shapes.model";

/** One connected region. */
export interface Component extends Rect {
  /** Label in the label image (1 and up; 0 is the background). */
  label: number;
  /** Number of pixels. */
  area: number;
  /** Centre of mass. */
  centroid: Point;
}

/** Result of {@link connectedComponents}. */
export interface ConnectedComponents {
  /** Per pixel: 0 for background, otherwise the region's label. */
  labels: Matrix<"i32">;
  /** Every region, in label order. */
  components: Component[];
}
