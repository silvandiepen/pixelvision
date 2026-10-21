import type { Example } from "./examples.model";

/**
 * The web examples under test. Each one's `pnpm preview` serves its
 * production build with `vite preview` on its own port (set in its
 * `vite.config.ts`, or for Angular in its `preview` script).
 */
export const EXAMPLES: readonly Example[] = [
  { name: "vanilla", port: 4321 },
  { name: "vue", port: 4322 },
  { name: "react", port: 4323 },
  { name: "svelte", port: 4324 },
  { name: "worker", port: 4325 },
  { name: "angular", port: 4326 },
];
