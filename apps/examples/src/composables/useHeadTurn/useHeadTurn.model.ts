import type { ComputedRef, Ref, ShallowRef } from "vue";
import type { ChallengePreset, FaceChallengeState, HeadPose, Point, RGBAImage } from "pixelvision";
import type { HeadPoseResources } from "../../examples/detect-head-pose/demo.model";
import type { UseCamera } from "../useCamera/useCamera.model";

/** Where the frames come from: the camera, or a sample video of an AI-generated person. */
export type PoseSource = "idle" | "camera" | "sample";

/** Which face detector runs on the frames. */
export type FaceBackend = "haar" | "neural";

/** The challenges the demos offer. */
export type DemoChallenge = Exclude<ChallengePreset, "none">;

/** The challenge's state, with the instruction to show. */
export interface CheckState extends FaceChallengeState {
  /** What to ask the person, for the current step. */
  instruction: string;
}

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
  /** Matching frames a step needs before it counts. */
  holdFrames: number;
  /** Loads the frontal and profile cascades for the built-in detector. */
  loadCascades: () => Promise<HeadPoseResources>;
  /** Called after every frame, from the camera or the sample video. */
  onUpdate?: (state: CheckState, source: PoseSource) => void;
}

export interface UseHeadTurn {
  camera: UseCamera;
  source: Ref<PoseSource>;
  /** The challenge being run. */
  challenge: Ref<DemoChallenge>;
  /** The challenge's state. */
  state: ShallowRef<CheckState>;
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
  /**
   * Switches the challenge. One that asks for left, right, up or down switches to the neural
   * detector, which is the one that can tell.
   */
  chooseChallenge: (choice: DemoChallenge) => Promise<void>;
  /** Starts the selfie camera and a new check. */
  start: () => Promise<boolean>;
  /** Plays the sample video of the challenge through the same detector and check. */
  playSample: () => Promise<boolean>;
  /** Stops the camera or video and resets the check. */
  stop: () => void;
}
