import type { Point } from "pixelvision";

/** An axis-aligned box. */
export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Shape of the face guide drawn over the camera preview. */
export type GuideShape = "oval" | "circle" | "rect";

/** The face guide in view pixels: centre, radii and (for `rect`) corner radius. */
export interface Guide {
  shape: GuideShape;
  cx: number;
  cy: number;
  /** Half the guide's width. */
  rx: number;
  /** Half the guide's height. */
  ry: number;
  /** Corner radius; half the shorter side for `oval` and `circle`. */
  corner: number;
}

/** Options for {@link guideFor}. */
export interface GuideOptions {
  /** Guide shape (default `"oval"`). */
  shape?: GuideShape;
  /** Width / height of the guide (default 0.78 for `oval` and `rect`; always 1 for `circle`). */
  aspect?: number;
  /** Largest guide height as a fraction of the view height (default 0.62). */
  size?: number;
  /** Largest guide width as a fraction of the view width (default 0.82). */
  maxWidth?: number;
  /** Vertical centre as a fraction of the view height (default 0.44, leaving room below for text). */
  centreY?: number;
}

/**
 * Maps camera-frame pixels to view pixels for a video drawn with
 * `object-fit: cover`, optionally mirrored.
 */
export interface ViewTransform {
  scale: number;
  offsetX: number;
  offsetY: number;
  viewWidth: number;
  viewHeight: number;
  mirrored: boolean;
}

/** What the person should change so their face fits the guide. */
export type FaceGuidance = "no-face" | "too-far" | "too-close" | "off-centre" | "aligned";

/** Options for {@link assessFace}. */
export interface AlignmentOptions {
  /** Smallest face width as a fraction of the guide width (default 0.45). */
  minFill?: number;
  /** Largest face width as a fraction of the guide width (default 1.05). */
  maxFill?: number;
  /** Largest distance between face and guide centres, in guide radii (default 0.3). */
  maxOffset?: number;
}

export type { Point };
