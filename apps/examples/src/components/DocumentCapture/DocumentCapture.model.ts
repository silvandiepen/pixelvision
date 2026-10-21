import type { DocumentCapture } from "../../composables/useDocumentScan/useDocumentScan.model";

export interface DocumentCaptureEmits {
  /** The document was found and held still, or found in an uploaded photo. */
  (event: "capture", capture: DocumentCapture): void;
}
