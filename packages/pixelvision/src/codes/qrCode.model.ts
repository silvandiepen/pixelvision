import type { Point } from "../math/transforms.model";

/** QR error correction level: about 7% (L), 15% (M), 25% (Q) or 30% (H) of codewords recoverable. */
export type QrErrorCorrectionLevel = "L" | "M" | "Q" | "H";

/** A decoded QR code. */
export interface QrCode {
  /** The content as text: UTF-8 when the bytes are valid UTF-8, otherwise ISO-8859-1. */
  text: string;
  /** The content as bytes (numeric and alphanumeric segments as their ASCII characters). */
  bytes: Uint8Array;
  /**
   * Outer corners of the symbol in the code's own order: top-left,
   * top-right, bottom-right, bottom-left, wherever they are in the image.
   */
  corners: [Point, Point, Point, Point];
  /** Version, 1–10: the symbol is `17 + 4 * version` modules wide. */
  version: number;
  errorCorrectionLevel: QrErrorCorrectionLevel;
}

/** A finder pattern candidate: the centre of one of the three corner squares. */
export interface FinderPattern {
  x: number;
  y: number;
  /** Estimated module size in pixels. */
  moduleSize: number;
  /** How many scan lines confirmed it. */
  count: number;
}

/** Error correction layout of one version and level. */
export interface QrBlockLayout {
  /** Error correction codewords per block. */
  ecPerBlock: number;
  /** Data codewords of each block, in order. */
  dataPerBlock: number[];
}

/** What the modules of a symbol decode to. */
export interface QrContent {
  bytes: Uint8Array;
  text: string;
  version: number;
  errorCorrectionLevel: QrErrorCorrectionLevel;
}
