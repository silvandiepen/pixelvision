import type { Point } from "../math/transforms.model";
import type { ShapeKind } from "./vectorize.model";

/** Settings for {@link recognizeShape}. */
export interface RecognizeSettings {
  /** Largest distance between an outline sample and the primitive, in pixels. */
  tolerance: number;
  /** The primitives to try. */
  kinds: ReadonlySet<ShapeKind>;
}

/** One traced loop to match: its boundary samples and the area it encloses. */
export interface TracedOutline {
  /** Points along the boundary, closed, e.g. from `edgeMidpoints`. */
  samples: Point[];
  /** Enclosed area in pixels (its sign is ignored). */
  area: number;
}
