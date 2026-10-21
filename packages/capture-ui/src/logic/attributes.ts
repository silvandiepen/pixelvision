import type { GuideShape } from "./geometry.model";

/**
 * Reads an on/off attribute. A present attribute with no value, `"true"`,
 * `"on"` or `"1"` is on; `"false"`, `"off"` and `"0"` are off; a missing
 * attribute takes the default.
 *
 * @param value - The attribute value (`getAttribute`), null when absent.
 * @param fallback - Value when the attribute is absent.
 * @returns The boolean.
 *
 * @example
 * parseBoolean(el.getAttribute("auto-capture"), true);
 */
export function parseBoolean(value: string | null | undefined, fallback: boolean): boolean {
  if (value === null || value === undefined) return fallback;
  const v = value.trim().toLowerCase();
  if (v === "false" || v === "off" || v === "0" || v === "no") return false;
  return true;
}

/**
 * Reads a number attribute, kept within a range.
 *
 * @param value - The attribute value, null when absent.
 * @param fallback - Value when absent or not a number.
 * @param min - Smallest allowed value.
 * @param max - Largest allowed value.
 * @returns The number.
 */
export function parseNumber(
  value: string | null | undefined,
  fallback: number,
  min = -Infinity,
  max = Infinity,
): number {
  const n = value === null || value === undefined || value.trim() === "" ? NaN : Number(value);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
}

/**
 * Reads a ratio attribute such as `"3/4"`, `"0.75"` or `"3:4"`.
 *
 * @param value - The attribute value, null when absent.
 * @param fallback - Value when absent or invalid.
 * @returns The ratio (width / height).
 */
export function parseRatio(value: string | null | undefined, fallback: number): number {
  if (!value) return fallback;
  const parts = value.split(/[/:]/).map((p) => Number(p.trim()));
  const ratio = parts.length === 2 ? parts[0] / parts[1] : parts[0];
  return parts.length <= 2 && Number.isFinite(ratio) && ratio > 0 ? ratio : fallback;
}

/**
 * Reads the guide shape attribute.
 *
 * @param value - The attribute value.
 * @returns `"circle"`, `"rect"`, or `"oval"` for anything else.
 */
export function parseShape(value: string | null | undefined): GuideShape {
  return value === "circle" || value === "rect" ? value : "oval";
}
