/** Opaque RGBA pixels ready for `putImageData`, with their hash. */
export interface DisplayPixels {
  width: number;
  height: number;
  data: Uint8ClampedArray<ArrayBuffer>;
  /** FNV-1a hash of `data`, compared with the canvas by the end-to-end tests. */
  checksum: string;
}
