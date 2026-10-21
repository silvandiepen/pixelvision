/**
 * Rounds a number for display and for stable test values.
 *
 * @param value - The number.
 * @param digits - Decimal places (default 4).
 * @returns The rounded number; `-0` becomes `0`.
 */
export function round(value: number, digits = 4): number {
  const factor = 10 ** digits;
  const rounded = Math.round(value * factor) / factor;
  return rounded === 0 ? 0 : rounded;
}

/**
 * Rounds every value of a table of numbers.
 *
 * @param rows - Rows of numbers.
 * @param digits - Decimal places (default 4).
 * @returns The rounded rows.
 */
export function roundRows(rows: readonly (readonly number[])[], digits = 4): number[][] {
  return rows.map((row) => row.map((value) => round(value, digits)));
}

/**
 * Splits a flat row-by-row list into rows.
 *
 * @param values - Values row by row.
 * @param columns - Values per row.
 * @returns The rows.
 */
export function toRows(values: ArrayLike<number>, columns: number): number[][] {
  const rows: number[][] = [];
  for (let i = 0; i < values.length; i += columns) {
    rows.push(Array.from({ length: columns }, (_, c) => values[i + c]));
  }
  return rows;
}
