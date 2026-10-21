import type { DemoValue } from "./examples/example.model";

/** What a demo page publishes for the end-to-end tests. */
export interface PublishedResult {
  status: "ready" | "error";
  /** The demo's key values. */
  values: Record<string, DemoValue>;
  /** Error message when the demo threw. */
  error: string | null;
  /** Whether the input and options were the defaults. */
  defaults: boolean;
}

declare global {
  interface Window {
    /** Latest result of each demo, by slug. */
    __pixelvisionResults?: Record<string, PublishedResult>;
  }
}
