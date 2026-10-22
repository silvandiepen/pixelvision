import type { CodeStore } from "./verify.model";

/**
 * Remembers used one-time codes in this process's memory, forgetting each
 * once its challenge has expired. Fine for one server; with several, or
 * restarts, use a shared store (Redis, a database table) with the same
 * `use` method.
 *
 * @param now - Clock, injectable for tests (default `Date.now`).
 * @returns The store.
 *
 * @example
 * const codes = createMemoryCodeStore();
 * const result = await verifyEvidence(evidence, { secret, codes });
 */
export function createMemoryCodeStore(now: () => number = Date.now): CodeStore {
  const used = new Map<string, number>();
  return {
    use(id, expiresAt) {
      const t = now();
      for (const [code, until] of used) if (until < t) used.delete(code);
      if (used.has(id)) return false;
      used.set(id, expiresAt);
      return true;
    },
  };
}
