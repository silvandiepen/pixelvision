/**
 * Computes `sqrt(a² + b²)` without overflow or underflow, as the Jacobi
 * rotations in jsfeat and OpenCV do (and with the same rounding, which
 * `Math.hypot` doesn't guarantee).
 *
 * @param a - First value.
 * @param b - Second value.
 * @returns The hypotenuse.
 */
export const hypot = (a: number, b: number): number => {
  a = Math.abs(a);
  b = Math.abs(b);
  if (a > b) {
    b /= a;
    return a * Math.sqrt(1 + b * b);
  }
  if (b > 0) {
    a /= b;
    return b * Math.sqrt(1 + a * a);
  }
  return 0;
};
