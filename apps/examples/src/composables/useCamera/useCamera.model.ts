import type { Ref, ShallowRef } from "vue";
import type { RGBAImage } from "pixelvision";

/** Which camera to ask for: the back camera ("environment") or the selfie camera ("user"). */
export type FacingMode = "environment" | "user";

export interface UseCamera {
  /** Whether frames are coming in. */
  active: Ref<boolean>;
  /** Why the camera couldn't start, in words; `null` when fine. */
  error: Ref<string | null>;
  /** The video element frames are read from; bind it with `ref`. */
  video: ShallowRef<HTMLVideoElement | null>;
  /** Asks for the camera and starts the video. Resolves `false` when it isn't available. */
  start: (facingMode: FacingMode) => Promise<boolean>;
  /** Stops the camera and releases it. */
  stop: () => void;
  /** Reads the current frame, scaled to fit the box; `null` before the first frame. */
  frame: (box: { width: number; height: number }) => RGBAImage | null;
}
