import type { HeadPose } from "pixelvision";

export interface HeadTurnDemoOptions {
  holdFrames: number;
}

/** One frame of a scripted run. */
export interface ScriptedFrame {
  pose: HeadPose;
}
