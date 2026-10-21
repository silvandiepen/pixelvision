import type { Matrix } from "../core/matrix.model";

/**
 * How a template position is scored:
 * - `"sqdiff"`: sum of squared differences; 0 is a perfect match, lower is better.
 * - `"sqdiff-normed"`: the same divided by the energies of template and window; 0–1, lower is better.
 * - `"ccorr-normed"`: correlation divided by the energies; 0–1, higher is better.
 * - `"ccoeff-normed"`: correlation of the mean-removed values (Pearson's r); −1–1,
 *   higher is better, and unaffected by brightness and contrast changes.
 */
export type TemplateMatchMethod = "sqdiff" | "sqdiff-normed" | "ccorr-normed" | "ccoeff-normed";

/** Options for {@link matchTemplate}. */
export interface MatchTemplateOptions {
  /** Score to compute (default `"ccoeff-normed"`). */
  method?: TemplateMatchMethod;
  /** Matrix to write into. */
  out?: Matrix<"f32">;
}
