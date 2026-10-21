import type {
  FaceBackend,
  FrontalPhoto,
  PoseSource,
} from "../../composables/useHeadTurn/useHeadTurn.model";

export interface FaceCaptureProps {
  /** Which face detector to use. */
  backend: FaceBackend;
  /** Start the camera as soon as it's ready, as after "Try again". */
  autostart?: boolean;
}

/** What a passed check hands over. */
export interface FaceCaptureResult {
  photo: FrontalPhoto | null;
  /** Whether it was the camera or the scripted run. */
  source: Exclude<PoseSource, "idle">;
}

export interface FaceCaptureEmits {
  /** All four steps were done. */
  (event: "complete", result: FaceCaptureResult): void;
  /** Time ran out. */
  (event: "fail"): void;
}
