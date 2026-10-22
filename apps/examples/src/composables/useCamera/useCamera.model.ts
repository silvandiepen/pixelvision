import type { Ref, ShallowRef } from "vue";
import type { RGBAImage } from "pixelvision";

/** Which camera to ask for: the back camera ("environment") or the selfie camera ("user"). */
export type FacingMode = "environment" | "user";

/** A video file and its type, e.g. `{ src: "/media/clip.webm", type: 'video/webm; codecs="vp9"' }`. */
export interface VideoSource {
  src: string;
  type: string;
}

export interface UseCamera {
  /** Whether frames are coming in. */
  active: Ref<boolean>;
  /** Why the camera couldn't start, in words; `null` when fine. */
  error: Ref<string | null>;
  /** The video element frames are read from; bind it with `ref`. */
  video: ShallowRef<HTMLVideoElement | null>;
  /** Asks for the camera and starts the video. Resolves `false` when it isn't available. */
  start: (facingMode: FacingMode) => Promise<boolean>;
  /**
   * Plays a video file instead of the camera, so frames come from it the same way. Takes the
   * same clip in several formats and plays the first one the browser supports.
   * Resolves `false` when none can play.
   */
  startVideo: (sources: readonly VideoSource[]) => Promise<boolean>;
  /**
   * Moves a paused video file on, so the next {@link frame} is a later frame. Frames are taken
   * at the pace of whoever reads them, so a slow detector still sees every part of the clip.
   * Resolves `false` once the video has ended (its last frame stays).
   */
  stepVideo: (seconds: number) => Promise<boolean>;
  /** Stops the camera and releases it. */
  stop: () => void;
  /** Reads the current frame, scaled to fit the box; `null` before the first frame. */
  frame: (box: { width: number; height: number }) => RGBAImage | null;
}
