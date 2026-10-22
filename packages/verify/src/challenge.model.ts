import type { ChallengePreset, ChallengeStep } from "pixelvision";

/**
 * A challenge your server issued: what the person must do, a one-time code,
 * when it was issued and when it expires, signed with your secret. Plain
 * JSON: send it to the browser as it is, and get it back with the evidence.
 */
export interface SignedChallenge {
  /** The one-time code: random, 128 bits, hex. */
  id: string;
  /** The steps, in order. */
  steps: ChallengeStep[];
  /** Milliseconds since the epoch, on the server's clock. */
  issuedAt: number;
  /** Milliseconds since the epoch, on the server's clock. */
  expiresAt: number;
  /** HMAC-SHA256 of the fields above with your secret, base64url. */
  signature: string;
}

/** Options for {@link createChallenge}. */
export interface CreateChallengeOptions {
  /** The secret the challenge is signed with: at least 32 characters, never sent to the browser. */
  secret: string;
  /**
   * The steps: a preset, a list, or `"random"` for a new order every time
   * (default `"random"`). A random challenge is what makes a recording of an
   * earlier attempt useless.
   */
  steps?: ChallengePreset | readonly ChallengeStep[] | "random";
  /**
   * For `"random"`: use left, right, up and down, which need a pose source
   * that tells directions (`@pixelvision/face-neural`), rather than side,
   * other side and natural movement, which HAAR can check (default `false`).
   */
  directions?: boolean;
  /** For `"random"`: steps between the frontal ones at the start and end (default 3). */
  length?: number;
  /** How long the challenge is valid, in milliseconds (default 120 000). */
  expiresInMs?: number;
  /** Clock, injectable for tests (default `Date.now`). */
  now?: () => number;
}
