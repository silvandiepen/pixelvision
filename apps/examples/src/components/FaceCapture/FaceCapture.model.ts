import type {
  DemoChallenge,
  FaceBackend,
  FrontalPhoto,
  PoseSource,
} from "../../composables/useHeadTurn/useHeadTurn.model";

export interface FaceCaptureProps {
  /** Which face detector to use. */
  backend: FaceBackend;
  /** What the person is asked to do (default `"head-turn"`). */
  challenge?: DemoChallenge;
  /** Start the camera as soon as it's ready, as after "Try again". */
  autostart?: boolean;
}

/** What a passed check hands over. */
export interface FaceCaptureResult {
  photo: FrontalPhoto | null;
  /** Whether it was the camera or the sample video. */
  source: Exclude<PoseSource, "idle">;
  /** The challenge that was passed. */
  challenge: DemoChallenge;
}

export interface FaceCaptureEmits {
  /** Every step was done. */
  (event: "complete", result: FaceCaptureResult): void;
  /** Time ran out. */
  (event: "fail"): void;
}
