/** The parts of `URL` used to create and revoke Blob URLs, injectable for tests. */
export interface BlobUrlApi {
  createObjectURL(blob: Blob): string;
  revokeObjectURL(url: string): void;
}

/** Tracks the Blob URLs an element created, so every one of them can be revoked. */
export interface BlobUrls {
  /**
   * Creates a Blob URL and remembers it.
   *
   * @param blob - The blob.
   * @returns The URL.
   */
  create(blob: Blob): string;
  /**
   * Revokes one URL created here. Unknown or already revoked URLs are ignored.
   *
   * @param url - The URL.
   */
  revoke(url: string): void;
  /** Revokes every URL still alive. Safe to call repeatedly. */
  revokeAll(): void;
  /** How many URLs are alive. */
  readonly size: number;
}

/** A canvas, or anything else whose pixels are freed by setting its size to zero. */
export interface SizedSurface {
  width: number;
  height: number;
}

/** The parts of an `<img>` used to show a blob. */
export interface ImageTarget extends EventTarget {
  src: string;
  removeAttribute(name: string): void;
}
