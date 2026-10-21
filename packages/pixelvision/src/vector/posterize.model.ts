/** An image reduced to a few colours. */
export interface Posterized {
  /** The colours, `[r, g, b]` each 0–255. */
  palette: [number, number, number][];
  /** Per pixel: the index of its colour in `palette`. */
  labels: Uint8Array;
}
