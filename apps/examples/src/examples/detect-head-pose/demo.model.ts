import type { HeadPoseCascades } from "pixelvision";

export interface DetectHeadPoseDemoOptions {
  minFaceSize: number;
  minNeighbors: number;
}

/** Cascades loaded on demand: they're large, so they aren't in the main bundle. */
export type HeadPoseResources = HeadPoseCascades;
