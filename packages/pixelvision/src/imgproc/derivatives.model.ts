import type { Matrix } from "../core/matrix.model";

/** Options for {@link sobelDerivatives} and {@link scharrDerivatives}. */
export interface DerivativesOptions {
  /** Matrix to write into, reused across calls. `i32` for integer input, `f32` for float input. */
  out?: Matrix<"i32"> | Matrix<"f32">;
}

/** Element type of the gradients: integers for integer input, floats otherwise. */
export type DerivativeType<T> = T extends "u8" | "i32" ? "i32" : "f32";
