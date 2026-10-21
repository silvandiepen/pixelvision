import type { Example } from "./examples.model";

/**
 * The web examples under test. Each one's `vite preview` serves its
 * production build on its own port (set in its `vite.config.ts`).
 */
export const EXAMPLES: readonly Example[] = [
  { name: "vanilla", port: 4321 },
  { name: "vue", port: 4322 },
  { name: "react", port: 4323 },
  { name: "svelte", port: 4324 },
  { name: "worker", port: 4325 },
];
