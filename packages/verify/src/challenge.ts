import { challengeSteps } from "pixelvision";
import type { ChallengeStep } from "pixelvision";
import type { CreateChallengeOptions, SignedChallenge } from "./challenge.model";

const encoder = new TextEncoder();

/**
 * Bytes as base64url, without padding.
 *
 * @param bytes - The bytes.
 * @returns The text.
 */
const base64url = (bytes: Uint8Array): string =>
  btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

/**
 * Throws unless a secret is long enough to sign with.
 *
 * @param secret - The secret.
 * @throws {RangeError} When it's shorter than 32 characters.
 */
export const assertSecret = (secret: string): void => {
  if (typeof secret !== "string" || secret.length < 32) {
    throw new RangeError("The secret must be at least 32 characters");
  }
};

/**
 * Signs a challenge's fields with HMAC-SHA256 (Web Crypto, so this runs in
 * Node, Deno, Bun and edge workers alike).
 *
 * @param challenge - The fields to sign.
 * @param secret - The secret.
 * @returns The signature, base64url.
 */
export async function sign(
  challenge: Omit<SignedChallenge, "signature">,
  secret: string,
): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const message = [
    challenge.id,
    challenge.steps.join(","),
    challenge.issuedAt,
    challenge.expiresAt,
  ].join(".");
  return base64url(new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(message))));
}

/**
 * Compares two strings in time that doesn't depend on where they differ.
 *
 * @param a - One string.
 * @param b - The other.
 * @returns Whether they're equal.
 */
const sameText = (a: string, b: string): boolean => {
  let difference = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    difference |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return difference === 0;
};

/**
 * Whether a challenge carries a valid signature for its fields: it was
 * issued with this secret and not changed since.
 *
 * @param challenge - What the browser sent back.
 * @param secret - The secret it was signed with.
 * @returns Whether the signature matches.
 */
export async function hasValidSignature(
  challenge: SignedChallenge,
  secret: string,
): Promise<boolean> {
  assertSecret(secret);
  if (!isChallenge(challenge)) return false;
  return sameText(await sign(challenge, secret), challenge.signature);
}

/**
 * Whether something has the shape of a signed challenge (whatever its signature).
 *
 * @param value - What the browser sent.
 * @returns Whether it does.
 */
export const isChallenge = (value: unknown): value is SignedChallenge => {
  const c = value as SignedChallenge | null;
  return (
    typeof c === "object" &&
    c !== null &&
    typeof c.id === "string" &&
    Array.isArray(c.steps) &&
    c.steps.every((step) => typeof step === "string") &&
    Number.isFinite(c.issuedAt) &&
    Number.isFinite(c.expiresAt) &&
    typeof c.signature === "string"
  );
};

/**
 * A random whole number below a limit, from the platform's secure random source.
 *
 * @param limit - Exclusive upper bound, at least 1.
 * @returns The number.
 */
const randomBelow = (limit: number): number =>
  crypto.getRandomValues(new Uint32Array(1))[0] % limit;

/**
 * A random challenge: frontal, then `length` steps, then frontal again.
 * With directions, a random order of left, right, up and down (repeating
 * after four); without, side turns (`side` then `other-side`) and natural
 * movement in a random order.
 *
 * @param length - Steps between the frontal ones.
 * @param directions - Use left, right, up and down.
 * @returns The steps.
 */
export function randomSteps(length: number, directions: boolean): ChallengeStep[] {
  const middle: ChallengeStep[] = [];
  if (directions) {
    let pool: ChallengeStep[] = [];
    while (middle.length < length) {
      if (pool.length === 0) pool = ["left", "right", "up", "down"];
      // Never the same direction twice in a row.
      const options = pool.filter((step) => step !== middle[middle.length - 1]);
      const step = options[randomBelow(options.length)];
      pool = pool.filter((candidate) => candidate !== step);
      middle.push(step);
    }
  } else {
    while (middle.length < length) {
      const turn = middle.length + 2 <= length && randomBelow(3) > 0;
      middle.push(...(turn ? (["side", "other-side"] as const) : (["move"] as const)));
    }
  }
  return ["frontal", ...middle, "frontal"];
}

/**
 * Issues a challenge for the browser: the steps, a one-time code and an
 * expiry, signed with your secret so the browser can't change them. Send
 * it as JSON to `<pv-face-capture challenge-url>`; when the evidence comes
 * back, {@link verifyEvidence} checks the frames against these steps.
 *
 * @param options - Secret, steps (random by default), expiry.
 * @returns The signed challenge.
 * @throws {RangeError} When the secret is too short, a step is unknown, or the length or expiry isn't positive.
 *
 * @example
 * app.get("/challenge", async (req, res) => {
 *   res.json(await createChallenge({ secret: process.env.CHALLENGE_SECRET }));
 * });
 */
export async function createChallenge(options: CreateChallengeOptions): Promise<SignedChallenge> {
  const { secret, directions = false, length = 3, expiresInMs = 120_000, now = Date.now } = options;
  assertSecret(secret);
  if (!Number.isInteger(length) || length < 1) throw new RangeError("length must be at least 1");
  if (!(expiresInMs > 0)) throw new RangeError("expiresInMs must be positive");
  const choice = options.steps ?? "random";
  const steps = choice === "random" ? randomSteps(length, directions) : [...challengeSteps(choice)];
  const id = Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
  const issuedAt = now();
  const fields = { id, steps, issuedAt, expiresAt: issuedAt + expiresInMs };
  return { ...fields, signature: await sign(fields, secret) };
}
