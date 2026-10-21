/** A Haar feature as an OpenCV cascade file stores it. */
export interface CascadeFeature {
  /** Rectangles `[x, y, width, height, weight]` in window coordinates. */
  rects: ReadonlyArray<readonly [number, number, number, number, number]>;
  /** Whether the rectangles are rotated 45°. */
  tilted: boolean;
}

/** Where a split leads: a score, or another split of the same tree by index. */
export type CascadeBranch = number | { node: number };

/** One split of a weak classifier tree, as read from the file. */
export interface CascadeNode {
  feature: CascadeFeature;
  threshold: number;
  left: CascadeBranch;
  right: CascadeBranch;
}
