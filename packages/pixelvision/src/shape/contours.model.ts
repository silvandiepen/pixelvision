import type { Point } from "../math/transforms.model";

/** A closed outline as a list of pixel positions, in order. */
export type Contour = Point[];

/** Options for {@link findContours}. */
export interface FindContoursOptions {
  /** Ignore regions with fewer pixels than this (default 1). */
  minPixels?: number;
}
