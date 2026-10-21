/**
 * Hashes bytes with 32-bit FNV-1a. The page stores the hash of every image
 * it draws, and the end-to-end tests hash what the canvas holds to prove
 * the drawn pixels are exactly the computed ones.
 *
 * @param data - Bytes to hash.
 * @returns The hash as 8 hex digits.
 */
export function fnv1a(data: ArrayLike<number>): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < data.length; i++) {
    hash ^= data[i] & 0xff;
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}
