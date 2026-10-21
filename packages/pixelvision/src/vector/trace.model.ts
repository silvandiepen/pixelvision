import type { Point } from "../math/transforms.model";

/**
 * A closed outline along pixel edges, with shape pixels on its right
 * (y down): outlines run clockwise, holes anticlockwise.
 */
export interface TracedLoop {
  /** Pixel corners where the outline changes direction, in order. */
  vertices: Point[];
  /** Enclosed area in pixels: positive for an outline, negative for a hole. */
  area: number;
  /** Label of the 8-connected region the loop bounds (as `connectedComponents` numbers it). */
  label: number;
}

/** A shape outline with the holes inside it. */
export interface TracedShape {
  /** The outer loop. */
  outline: TracedLoop;
  /** Its holes. */
  holes: TracedLoop[];
}
