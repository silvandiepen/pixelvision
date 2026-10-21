import type { ComputedRef, Ref, ShallowRef } from "vue";
import type { HeadPose, HeadTurnState, Point, RGBAImage } from "pixelvision";
import type { HeadPoseResources } from "../../examples/detect-head-pose/demo.model";
import type { UseCamera } from "../useCamera/useCamera.model";

/** Where the poses come from. */
export type PoseSource = "idle" | "camera" | "scripted";

/** Which face detector runs on camera frames. */
export type FaceBackend = "haar" | "neural";

/** A face's box, in frame pixels. */
export interface FaceBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** The frontal photo kept from a finished check. */
export interface FrontalPhoto {
  /** The whole frame, as the camera took it (not mirrored). */
  frame: RGBAImage;
  /** Where the face is in it. */
  face: FaceBox;
  /** Whether to show it mirrored, like the preview. */
  mirrored: boolean;
}

export interface UseHeadTurnOptions {
  /** Frames in a row a pose must be seen before it counts. */
  holdFrames: number;
  /** Loads the frontal and profile cascades for the built-in detector. */
  loadCascades: () => Promise<HeadPoseResources>;
  /** Called after every pose, camera or scripted. */
  onUpdate?: (state: HeadTurnState, source: PoseSource) => void;
}

export interface UseHeadTurn {
  camera: UseCamera;
  source: Ref<PoseSource>;
  /** The challenge's state. */
  state: ShallowRef<HeadTurnState>;
  /** Whether the built-in cascades have loaded. */
  cascadesState: Ref<"loading" | "ready" | "error">;
  backend: Ref<FaceBackend>;
  neuralState: Ref<"idle" | "loading" | "ready" | "error">;
  /** Whether the chosen detector can run. */
  ready: ComputedRef<boolean>;
  /** Whether the check finished, passed or failed. */
  finished: ComputedRef<boolean>;
  pose: Ref<HeadPose | "—">;
  face: ShallowRef<FaceBox | null>;
  landmarks: ShallowRef<Point[]>;
  /** Head turn in degrees from the neural detector; `null` otherwise. */
  yaw: Ref<number | null>;
  frameSize: Ref<{ width: number; height: number } | null>;
  detectionTime: Ref<number | null>;
  /** The last frontal frame with a face, kept for the result. */
  photo: ShallowRef<FrontalPhoto | null>;
  /**
   * Where to move ("Move a little closer"), shown only once it has held for
   * about 800 ms; `null` when the face is fine.
   */
  hint: Ref<string | null>;
  /** What went wrong, in words; `null` when fine. */
  message: Ref<string | null>;
  /** Switches the detector, loading the neural one the first time. */
  chooseBackend: (choice: FaceBackend) => Promise<void>;
  /** Starts the selfie camera and a new check. */
  start: () => Promise<boolean>;
  /** Stops the camera and resets the check. */
  stop: () => void;
  /** Plays a scripted sequence of poses through the same challenge. */
  playScripted: (photo?: FrontalPhoto) => void;
}
