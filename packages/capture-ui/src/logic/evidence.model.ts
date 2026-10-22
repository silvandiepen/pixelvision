import type { ChallengeStep } from "pixelvision";

/**
 * A challenge your server signed (see `createChallenge` in
 * `@pixelvision/verify`): the steps to ask for, a one-time code, and when
 * it was issued and expires. The browser only passes it back.
 */
export interface ServerChallenge {
  id: string;
  steps: ChallengeStep[];
  issuedAt: number;
  expiresAt: number;
  signature: string;
}
