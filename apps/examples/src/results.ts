import type { PublishedResult } from "./results.model";

/**
 * Publishes a demo's latest result as `window.__pixelvisionResults[slug]`,
 * where the end-to-end tests read it.
 *
 * @param slug - The example's slug.
 * @param result - The result.
 */
export function publishResult(slug: string, result: PublishedResult): void {
  window.__pixelvisionResults ??= {};
  window.__pixelvisionResults[slug] = result;
}
