/**
 * Creates a seeded pseudo-random generator (mulberry32). The same seed gives
 * the same sequence in every browser and in Node, so generated samples are
 * identical everywhere.
 *
 * @param seed - Any 32-bit integer.
 * @returns A function returning numbers in `[0, 1)`.
 *
 * @example
 * const random = seededRandom(42);
 * random(); // always the same first value
 */
export function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
