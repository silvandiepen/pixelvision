/** An RGB colour, 0–255 per channel. */
export type Color = readonly [number, number, number];

/** A point in pixel coordinates. */
export interface Vec {
  x: number;
  y: number;
}
