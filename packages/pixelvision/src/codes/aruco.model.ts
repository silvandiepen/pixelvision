import type { Point } from "../math/transforms.model";

/**
 * A predefined ArUco dictionary: `"4x4_50"` (OpenCV's `DICT_4X4_50`: 50
 * markers of 4 x 4 bits) or `"6x6_250"` (`DICT_6X6_250`: 250 markers of 6 x 6
 * bits).
 */
export type ArucoDictionaryName = "4x4_50" | "6x6_250";

/** A dictionary's data as stored in the bundle. */
export interface ArucoDictionaryData {
  /** Bits per side of the marker's inner grid. */
  markerSize: number;
  /** Bit errors the dictionary's spacing allows correcting. */
  maxCorrectionBits: number;
  /** Every marker's unrotated bits, packed as hex. */
  hex: string;
}

/** A dictionary unpacked for matching. */
export interface ArucoDictionary {
  markerSize: number;
  maxCorrectionBits: number;
  /** Bytes per marker. */
  byteCount: number;
  /** Per marker, its bytes for 0, 1, 2 and 3 quarter turns counter-clockwise, one after another. */
  rotations: Uint8Array;
  /** Number of markers. */
  count: number;
}

/** A detected marker. */
export interface ArucoMarker {
  /** Index of the marker in its dictionary. */
  id: number;
  /**
   * Corners in the marker's own order: top-left, top-right, bottom-right,
   * bottom-left as the marker is drawn, wherever they are in the image.
   * Pixel positions on the marker's outer edge.
   */
  corners: [Point, Point, Point, Point];
}

/** Options for {@link detectArucoMarkers}. */
export interface DetectArucoMarkersOptions {
  /** Dictionary the markers come from (default `"4x4_50"`). */
  dictionary?: ArucoDictionaryName;
}

/** Options for {@link generateArucoMarker}. */
export interface GenerateArucoMarkerOptions {
  /** Dictionary to take the marker from (default `"4x4_50"`). */
  dictionary?: ArucoDictionaryName;
  /** Width and height of the image in pixels (default 120). */
  size?: number;
  /** Width of the black border in cells (default 1). */
  borderBits?: number;
}
