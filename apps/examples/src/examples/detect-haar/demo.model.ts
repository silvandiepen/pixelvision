import type { HaarCascade } from "pixelvision";

export type CascadeName = "frontalFace" | "profileFace" | "eye" | "upperBody";

export interface DetectHaarDemoOptions {
  cascade: CascadeName;
  scaleFactor: number;
  minNeighbors: number;
  skipFlat: boolean;
}

/** The cascades, loaded on demand (each is a few hundred kilobytes). */
export type Cascades = Record<CascadeName, HaarCascade>;
