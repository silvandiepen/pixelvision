import type { Ref, ShallowRef } from "vue";
import type { Point, RGBAImage } from "pixelvision";
import type { UseCamera } from "../useCamera/useCamera.model";

/** What the camera loop is doing. */
export type DocumentScanState = "idle" | "looking" | "holding" | "captured";

/** A frame the loop captured, with the document's corners in it. */
export interface DocumentCapture {
  photo: RGBAImage;
  corners: Point[];
}

export interface UseDocumentScanOptions {
  /** Called once the document has held still; the camera is already stopped. */
  onCapture: (capture: DocumentCapture) => void;
}

export interface UseDocumentScan {
  camera: UseCamera;
  state: Ref<DocumentScanState>;
  /** Corners in the latest frame, for the live outline; `null` when none was found. */
  liveCorners: ShallowRef<readonly Point[] | null>;
  /** Size of the frames the corners refer to. */
  frameSize: Ref<{ width: number; height: number } | null>;
  /** Detections in a row that found the document, up to {@link UseDocumentScan.stableFrames}. */
  held: Ref<number>;
  /** Detections in a row needed before it captures. */
  stableFrames: number;
  /** Starts the back camera and the loop. Resolves `false` when the camera isn't available. */
  start: () => Promise<boolean>;
  /** Stops the camera and the loop. */
  stop: () => void;
}
