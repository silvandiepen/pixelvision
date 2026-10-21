import type { Example } from "../../examples/example.model";

export interface DocumentScannerProps {
  example: Example;
}

/** What the scanner is doing. */
export type ScannerState = "photo" | "looking" | "holding" | "captured" | "not-found";
