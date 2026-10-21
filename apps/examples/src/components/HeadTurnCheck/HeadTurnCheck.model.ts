import type { Example } from "../../examples/example.model";

export interface HeadTurnCheckProps {
  example: Example;
}

/** Where the poses come from. */
export type PoseSource = "idle" | "camera" | "scripted";

/** Which face detector runs on camera frames. */
export type FaceBackend = "haar" | "neural";
