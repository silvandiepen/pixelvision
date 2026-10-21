import type { Matrix } from "../core/matrix.model";

/** A numeric matrix: `width` columns by `height` rows, one channel. */
export type NumericMatrix = Matrix<"f32"> | Matrix<"f64">;

/** Options for {@link multiply}. */
export interface MultiplyOptions {
  /** Use the transpose of `a` (default `false`). */
  transposeA?: boolean;
  /** Use the transpose of `b` (default `false`). */
  transposeB?: boolean;
}
