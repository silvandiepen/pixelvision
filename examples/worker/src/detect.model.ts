import type { Matrix, Quad } from "pixelvision";

/** What {@link detect} finds in a photo. */
export interface DetectResult {
  /** Canny edges of the photo: 255 on edges, 0 elsewhere. */
  edges: Matrix<"u8">;
  /** The document's corners (top-left, top-right, bottom-right, bottom-left), or null when there's none. */
  corners: Quad | null;
}

/** A message to the worker: find the document in this photo. */
export interface DetectRequest {
  /** Matches the reply to the request. */
  id: number;
  /** The photo's RGBA pixels. Its buffer is transferred, not copied. */
  image: ImageData;
}

/** The worker's reply to a {@link DetectRequest}. */
export type DetectResponse =
  | { id: number; result: DetectResult; error?: undefined }
  | { id: number; result?: undefined; error: string };
