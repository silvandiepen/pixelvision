import type { BbfCascade } from "pixelvision";

export interface DetectBbfDemoOptions {
  interval: number;
  minNeighbors: number;
}

/** The BBF face cascade, loaded on demand. */
export type BbfResources = BbfCascade;
