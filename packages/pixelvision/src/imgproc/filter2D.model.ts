import type { Matrix } from "../core/matrix.model";

/** A convolution kernel as rows of weights, e.g. `[[0, -1, 0], [-1, 5, -1], [0, -1, 0]]`. */
export type Kernel = readonly (readonly number[])[];

/** Options for {@link filter2D} with byte output (the default). */
export interface Filter2DOptions {
  /** Added to every filtered value before it is stored (default 0). */
  delta?: number;
  /** Element type of the result: `"u8"` rounds and clamps to 0–255 (default). */
  type?: "u8";
  /** Matrix to write into. */
  out?: Matrix<"u8">;
}

/** Options for {@link filter2D} with single-precision float output. */
export interface Filter2DFloatOptions {
  /** Added to every filtered value before it is stored (default 0). */
  delta?: number;
  /** `"f32"` keeps the sums unrounded, negative values included. */
  type: "f32";
  /** Matrix to write into. */
  out?: Matrix<"f32">;
}
