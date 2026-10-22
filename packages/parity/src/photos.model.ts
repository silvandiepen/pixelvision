/** A corner or point as `[x, y]` in image pixels. */
export type PhotoPoint = [number, number];

/** Fields every photo in the manifest has. */
interface PhotoEntry {
  /** File name in `fixtures/photos/`. */
  file: string;
  width: number;
  height: number;
  /** What the photo shows, as described when it was made. */
  prompt: string;
  /** Anything a reader of the results should know about this photo. */
  note?: string;
}

/** A document photo and its hand-labelled corners. */
export interface DocumentPhoto extends PhotoEntry {
  /**
   * Corners as top-left, top-right, bottom-right, bottom-left, labelled by
   * eye on zoomed crops: the paper's corner points, or for rounded cards
   * where two edges read off the crops meet. A corner outside the image is
   * where its two edges meet beyond it.
   */
  corners: [PhotoPoint, PhotoPoint, PhotoPoint, PhotoPoint];
  /** A corner lies outside the image: the document runs off its edge. */
  cut: boolean;
  /** Pixels a corner may be off, when the default doesn't suit the photo (see `note`). */
  tolerance?: number;
  /** Why pixelvision is known not to find this document; the tests expect the miss. */
  expectedMiss?: string;
}

/** Where the photos came from. */
export interface PhotoProvenance {
  source: string;
  date: string;
  licence: string;
}

/** `fixtures/photos/manifest.json`. */
export interface PhotoManifest {
  provenance: PhotoProvenance;
  documents: DocumentPhoto[];
}
