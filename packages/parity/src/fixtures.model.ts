/** A named RGBA test image. */
export interface Fixture {
  name: string;
  width: number;
  height: number;
  /** RGBA pixels, row by row. */
  data: Uint8ClampedArray;
}
