// GF(256) with QR's primitive polynomial x^8 + x^4 + x^3 + x^2 + 1 (0x11d)
// and generator 2.
const EXP = new Uint8Array(512);
const LOG = new Uint8Array(256);
for (let i = 0, x = 1; i < 255; i++) {
  EXP[i] = x;
  LOG[x] = i;
  x <<= 1;
  if (x & 0x100) x ^= 0x11d;
}
for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];

/**
 * Multiplies in GF(256).
 *
 * @param a - Factor.
 * @param b - Factor.
 * @returns The product.
 */
const mul = (a: number, b: number): number => (a && b ? EXP[LOG[a] + LOG[b]] : 0);

/**
 * Divides in GF(256).
 *
 * @param a - Dividend.
 * @param b - Divisor (0 gives a meaningless value, never an error).
 * @returns The quotient.
 */
const div = (a: number, b: number): number => mul(a, EXP[255 - LOG[b]]);

/**
 * Evaluates a polynomial given lowest coefficient first.
 *
 * @param poly - Coefficients, `poly[i]` for `x^i`.
 * @param x - Where to evaluate.
 * @returns The value.
 */
const evaluate = (poly: ArrayLike<number>, x: number): number => {
  let value = 0;
  for (let i = poly.length - 1; i >= 0; i--) value = mul(value, x) ^ poly[i];
  return value;
};

/**
 * Corrects a Reed–Solomon block in place (QR's code: the generator's roots
 * are 2^0 … 2^(ec-1)). Finds the error locator with Berlekamp–Massey, the
 * positions with a Chien search and the values with Forney's formula, so
 * up to `ecCount / 2` wrong codewords are fixed.
 *
 * @param block - Data codewords followed by error correction codewords, first codeword highest power.
 * @param ecCount - Number of error correction codewords.
 * @returns The number of codewords corrected, or -1 when there are too many errors to correct.
 */
export function correctReedSolomon(block: Uint8Array, ecCount: number): number {
  const n = block.length;
  // Syndromes S_j = r(2^j); the block's first codeword is the highest power.
  const syndromes = new Uint8Array(ecCount);
  let clean = true;
  for (let j = 0; j < ecCount; j++) {
    let value = 0;
    for (let i = 0; i < n; i++) value = mul(value, EXP[j]) ^ block[i];
    syndromes[j] = value;
    if (value) clean = false;
  }
  if (clean) return 0;

  // Berlekamp–Massey: the shortest error locator Λ(x), lowest coefficient first.
  let locator = [1];
  let previous = [1];
  let length = 0;
  let shift = 1;
  let previousDiscrepancy = 1;
  for (let k = 0; k < ecCount; k++) {
    let discrepancy = syndromes[k];
    for (let i = 1; i <= length; i++) discrepancy ^= mul(locator[i], syndromes[k - i]);
    if (discrepancy === 0) {
      shift++;
      continue;
    }
    const factor = div(discrepancy, previousDiscrepancy);
    const next = locator.slice();
    while (next.length < previous.length + shift) next.push(0);
    for (let i = 0; i < previous.length; i++) next[i + shift] ^= mul(factor, previous[i]);
    if (2 * length <= k) {
      previous = locator;
      length = k + 1 - length;
      previousDiscrepancy = discrepancy;
      shift = 1;
    } else {
      shift++;
    }
    locator = next;
  }
  if (2 * length > ecCount) return -1;

  // Ω(x) = S(x) Λ(x) mod x^ec, and Λ'(x) (odd terms of Λ, shifted down).
  const evaluator = new Uint8Array(ecCount);
  for (let i = 0; i < ecCount; i++) {
    for (let j = 0; j <= i && j < locator.length; j++)
      evaluator[i] ^= mul(syndromes[i - j], locator[j]);
  }
  const derivative = locator.map((c, i) => (i % 2 === 1 ? c : 0)).slice(1);

  // Chien search: codeword p has power n - 1 - p; it is wrong where Λ(X^-1) = 0.
  let found = 0;
  for (let p = 0; p < n; p++) {
    const power = n - 1 - p;
    const inverse = EXP[(255 - power) % 255];
    if (evaluate(locator, inverse) !== 0) continue;
    // Forney, with the generator's first root 2^0: e = X Ω(X^-1) / Λ'(X^-1).
    // Λ' is 0 only at a repeated root, which the count below rejects anyway.
    block[p] ^= mul(EXP[power], div(evaluate(evaluator, inverse), evaluate(derivative, inverse)));
    found++;
  }
  // Every root of Λ must be a codeword position, each once.
  return found === length ? found : -1;
}
