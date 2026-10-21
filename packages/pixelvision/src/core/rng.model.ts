/** A seeded pseudo-random generator, from {@link createRng}. */
export interface Rng {
  /** Advances the state and returns its low 32 bits, 0 to 2^32 − 1. */
  next: () => number;
  /** A whole number from 0 to `count − 1`, as OpenCV's `RNG::uniform(0, count)`. */
  uniform: (count: number) => number;
}
