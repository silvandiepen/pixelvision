/** Options for {@link headPoseFromFace}. */
export interface HeadPoseFromFaceOptions {
  /** Turn angle in degrees from which the head counts as turned (default 18). */
  threshold?: number;
  /** Set when the image is mirrored (a selfie preview), so left and right swap (default `false`). */
  mirrored?: boolean;
}
